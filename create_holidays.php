<?php
/**
 * Daily cron script: creates zero-duration "Public Holiday" timesheet entries
 * for all active users when today is a public holiday.
 *
 * Run daily at 00:05 via cron:
 *   5 0 * * * php /var/www/html/kimai/create_holidays.php >> /var/log/kimai-holidays.log 2>&1
 */

function getUgandaHoliday(int $year, string $monthDay): ?string
{
    $holidays = getUgandaHolidays($year);
    return $holidays[$monthDay] ?? null;
}

function getUgandaHolidays(int $year): array
{
    $holidays = [];

    // Fixed-date holidays
    $fixed = [
        '01-01' => "New Year's Day",
        '01-26' => 'NRM Liberation Day',
        '02-16' => 'Archbishop Janani Luwum Day',
        '03-08' => "International Women's Day",
        '05-01' => 'Labour Day',
        '06-03' => "Martyrs' Day",
        '06-09' => 'National Heroes Day',
        '10-09' => 'Independence Day',
        '12-25' => 'Christmas Day',
        '12-26' => 'Boxing Day',
    ];
    foreach ($fixed as $md => $name) {
        $holidays[$md] = $name;
    }

    // Easter-based holidays
    $easter = new DateTime(sprintf('%04d-03-21', $year));
    $easter->modify('+' . easter_days($year) . ' days');
    $holidays[$easter->modify('-2 days')->format('m-d')] = 'Good Friday';
    $holidays[$easter->modify('+3 days')->format('m-d')] = 'Easter Monday';

    // Islamic holidays — lookup for known years, Tabular algorithm as fallback
    $islamicLookup = [
        // year => ['eid-fitr' => 'm-d', 'eid-adha' => 'm-d']
        2026 => ['03-20' => 'Eid al-Fitr', '05-27' => 'Eid al-Adha'],
    ];
    if (isset($islamicLookup[$year])) {
        foreach ($islamicLookup[$year] as $md => $name) {
            $holidays[$md] = $name;
        }
    } else {
        $islamicEstimate = (int)(($year - 622) / 0.97);
        foreach ([$islamicEstimate, $islamicEstimate + 1] as $iy) {
            $jd = (int)((11 * $iy + 3) / 30)
                + 354 * $iy
                + 30 * 10 - (int)((10 - 1) / 2)
                + 1
                + 1948440 - 386;
            [$mF, $dF, $yF] = explode('/', jdToGregorian($jd));
            if ((int)$yF === $year) {
                $holidays[sprintf('%02d-%02d', (int)$mF, (int)$dF)] = 'Eid al-Fitr';
            }

            $jd = (int)((11 * $iy + 3) / 30)
                + 354 * $iy
                + 30 * 12 - (int)((12 - 1) / 2)
                + 10
                + 1948440 - 386;
            [$mA, $dA, $yA] = explode('/', jdToGregorian($jd));
            if ((int)$yA === $year) {
                $holidays[sprintf('%02d-%02d', (int)$mA, (int)$dA)] = 'Eid al-Adha';
            }
        }
    }

    // Election Day — Uganda holds elections every 5 years; dates are set by
    // the Electoral Commission and cannot be derived algorithmically.
    $electionDays = [
        2026 => ['01-15' => 'Election Day Holiday', '01-16' => 'Election Day Holiday'],
    ];
    if (isset($electionDays[$year])) {
        foreach ($electionDays[$year] as $md => $name) {
            $holidays[$md] = $name;
        }
    }

    ksort($holidays);
    return $holidays;
}

$today = date('Y-m-d');
$year = date('Y');
$monthDay = date('m-d');

$holidayName = getUgandaHoliday($year, $monthDay);

if ($holidayName === null) {
    echo "[$today] Not a public holiday. Nothing to do.\n";
    exit(0);
}

echo "[$today] Public holiday: $holidayName\n";

// DB connection
$db = new PDO(
    'mysql:host=127.0.0.1;dbname=kimai;charset=utf8mb4',
    'kimaiuser',
    'Ppda345#'
);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get activity ID
$st = $db->query("SELECT id FROM kimai2_activities WHERE name = 'Public Holiday' LIMIT 1");
$activityId = $st->fetchColumn();
if (!$activityId) {
    echo "[$today] ERROR: 'Public Holiday' activity not found.\n";
    exit(1);
}

// Get project ID
$projectId = 4;
$st = $db->query("SELECT id FROM kimai2_projects WHERE id = 4 LIMIT 1");
if (!$st->fetchColumn()) {
    echo "[$today] ERROR: Project ID 4 not found.\n";
    exit(1);
}

// Get all non-admin users
$users = $db->query(
    "SELECT u.id, COALESCE(p.value, 'Africa/Kampala') AS timezone
     FROM kimai2_users u
     LEFT JOIN kimai2_user_preferences p ON p.user_id = u.id AND p.name = 'timezone'
     WHERE u.id > 1
     ORDER BY u.id"
)->fetchAll(PDO::FETCH_ASSOC);

// Check which users already have an entry for today
$existing = $db->prepare(
    "SELECT 1 FROM kimai2_timesheet WHERE user = ? AND activity_id = ? AND DATE(start_time) = ?"
);

$values = [];
$params = [];
$created = 0;
$skipped = 0;

foreach ($users as $user) {
    $existing->execute([$user['id'], $activityId, $today]);
    if ($existing->fetch()) {
        $skipped++;
        continue;
    }

    $startTime = $today . ' 00:00:00';
    $description = 'Public Holiday: ' . $holidayName;

    $values[] = "(?, ?, ?, ?, NULL, 0, 0, 1, ?, 1, 'work', ?, NOW(), ?)";
    $params = array_merge($params, [$user['id'], $activityId, $projectId, $startTime, $user['timezone'], $description, $today]);
    $created++;
}

if (!empty($values)) {
    $sql = "INSERT INTO kimai2_timesheet 
            (user, activity_id, project_id, start_time, end_time, duration, rate, exported, timezone, billable, category, description, modified_at, date_tz) 
            VALUES " . implode(', ', $values);
    $db->prepare($sql)->execute($params);
    echo "[$today] Created $created entries, $skipped already existed\n";
} else {
    echo "[$today] All users already have entries ($skipped skipped)\n";
}
