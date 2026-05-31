<?php
/**
 * Create Kimai teams for each Manager, with the department Director as team lead.
 *
 * Department structure is pulled directly from LDAP (Active Directory).
 * Users are grouped by the 'department' attribute and their role is inferred
 * from the 'title' attribute: Director or Manager.
 */

require_once __DIR__ . '/vendor/autoload.php';

$kernel = new App\Kernel('prod', false);
$kernel->boot();

$db = new PDO('mysql:host=127.0.0.1;dbname=kimai;charset=utf8mb4', 'kimaiuser', 'Ppda345#');

// ====== LDAP Connection ======

$ldapHost = '192.168.33.8';
$ldapPort = 389;
$bindDn = 'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug';
$bindPassword = 'ppda2016*';
$baseDn = 'dc=ppda,dc=go,dc=ug';

$ldap = ldap_connect($ldapHost, $ldapPort);
if (!$ldap) {
    echo "FATAL: Could not connect to LDAP server $ldapHost\n";
    exit(1);
}
ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);

if (!@ldap_bind($ldap, $bindDn, $bindPassword)) {
    echo "FATAL: LDAP bind failed: " . ldap_error($ldap) . "\n";
    exit(1);
}
echo "Connected to LDAP\n";

// ====== Fetch Users from LDAP ======

$search = ldap_search($ldap, $baseDn, '(objectClass=user)', [
    'userprincipalname',
    'displayname',
    'title',
    'department',
    'manager',
    'distinguishedname',
    'samaccountname',
    'mail',
]);

if (!$search) {
    echo "FATAL: LDAP search failed: " . ldap_error($ldap) . "\n";
    exit(1);
}

$entries = ldap_get_entries($ldap, $search);
echo "Found " . $entries['count'] . " LDAP user entries\n";

// Resolve manager DN to email
$managerDnToEmail = [];
foreach ($entries as $i => $e) {
    if ($i === 'count') continue;
    $dn = strtolower($e['distinguishedname'][0] ?? '');
    $email = strtolower($e['userprincipalname'][0] ?? '');
    if ($dn && $email) {
        $managerDnToEmail[$dn] = $email;
    }
}

// Build department -> users map
$deptUsers = [];
foreach ($entries as $i => $e) {
    if ($i === 'count') continue;

    $dept = $e['department'][0] ?? null;
    if (!$dept) continue;

    $email = strtolower($e['userprincipalname'][0] ?? '');
    $displayName = $e['displayname'][0] ?? '';
    $title = $e['title'][0] ?? '';
    $mgrDn = strtolower($e['manager'][0] ?? '');
    $mgrEmail = $managerDnToEmail[$mgrDn] ?? null;

    if (!$email) continue;

    $deptUsers[$dept][] = [
        'email' => $email,
        'name' => $displayName,
        'title' => $title,
        'mgrEmail' => $mgrEmail,
    ];
}

echo "Found " . count($deptUsers) . " departments with users\n";

// ====== Helpers ======

function getUserId(PDO $db, string $email): ?int {
    static $cache = [];
    $key = strtolower($email);
    if (!isset($cache[$key])) {
        $r = $db->prepare("SELECT id FROM kimai2_users WHERE LOWER(email) = ?");
        $r->execute([$key]);
        $row = $r->fetch(PDO::FETCH_ASSOC);
        $cache[$key] = $row ? (int)$row['id'] : null;
    }
    return $cache[$key];
}

function getOrCreateTeam(PDO $db, string $name): int {
    $r = $db->prepare("SELECT id FROM kimai2_teams WHERE name = ?");
    $r->execute([$name]);
    $row = $r->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        return (int)$row['id'];
    }
    $r = $db->prepare("INSERT INTO kimai2_teams (name) VALUES (?)");
    $r->execute([$name]);
    echo "  Created team: $name\n";
    return (int)$db->lastInsertId();
}

function addTeamMember(PDO $db, int $teamId, int $userId, bool $isLead = false): void {
    $r = $db->prepare("SELECT id FROM kimai2_users_teams WHERE user_id = ? AND team_id = ?");
    $r->execute([$userId, $teamId]);
    if ($r->fetch()) {
        $r2 = $db->prepare("UPDATE kimai2_users_teams SET teamlead = ? WHERE user_id = ? AND team_id = ?");
        $r2->execute([$isLead ? 1 : 0, $userId, $teamId]);
        return;
    }
    $r = $db->prepare("INSERT INTO kimai2_users_teams (user_id, team_id, teamlead) VALUES (?, ?, ?)");
    $r->execute([$userId, $teamId, $isLead ? 1 : 0]);
    echo "  Added user $userId" . ($isLead ? ' as lead' : ' as member') . " to team $teamId\n";
}

function linkTeamToDepartment(PDO $db, int $teamId, int $departmentId): void {
    $r = $db->prepare("SELECT 1 FROM kimai2_departments_teams WHERE department_id = ? AND team_id = ?");
    $r->execute([$departmentId, $teamId]);
    if (!$r->fetch()) {
        $r = $db->prepare("INSERT INTO kimai2_departments_teams (department_id, team_id) VALUES (?, ?)");
        $r->execute([$departmentId, $teamId]);
        echo "  Linked team $teamId to department $departmentId\n";
    }
}

// ====== Configuration: Map LDAP department names to Kimai department names ======

$deptMap = [
    'Strategy Planning And Monitoring'       => 'Strategy and Planning',
    'Performance Monitoring Central Government' => 'Perfomance Monitoring - Central',
    'Performance Monitoring Regional Offices' => 'Performance Monitoring - Regional Offices',
    "Executive Director's Office"           => 'ED Office',
    'Procurement and Disposal Capacity Building' => 'Procurment Capacity Building',
    'Human Resources and Administration'     => 'HR and Admin',
    'Risk and Audit'                         => 'Internal Audit',
    'Legal and Board Affairs'                => 'Legal and Board Affairs',
    'Finance'                                => 'Finance',
];

// Get Kimai department IDs
$kimaiDepts = [];
$r = $db->query("SELECT id, name FROM kimai2_departments");
while ($row = $r->fetch(PDO::FETCH_ASSOC)) {
    $kimaiDepts[$row['name']] = (int)$row['id'];
}

// ====== Process ======

$createdCount = 0;
$skippedCount = 0;

foreach ($deptUsers as $ldapDeptName => $users) {
    $kimaiDeptName = $deptMap[$ldapDeptName] ?? null;

    if (!$kimaiDeptName || !isset($kimaiDepts[$kimaiDeptName])) {
        echo "SKIP: No Kimai department found for LDAP department '$ldapDeptName'" .
            ($kimaiDeptName ? " (mapped to '$kimaiDeptName')" : '') . "\n";
        $skippedCount++;
        continue;
    }

    $deptId = $kimaiDepts[$kimaiDeptName];
    echo "\n--- $ldapDeptName (Kimai dept ID $deptId) ---\n";

    // Categorize users by role
    $directors = [];
    $managers = [];
    $others = [];

    foreach ($users as $u) {
        $titleLower = strtolower($u['title']);
        if (str_contains($titleLower, 'director') || str_contains($titleLower, 'executive')) {
            $directors[] = $u;
        } elseif (str_contains($titleLower, 'manager')) {
            $managers[] = $u;
        } else {
            $others[] = $u;
        }
    }

    // Get Kimai user IDs for directors
    $directorIds = [];
    foreach ($directors as $d) {
        $uid = getUserId($db, $d['email']);
        if ($uid) {
            $directorIds[] = $uid;
            echo "  Director: {$d['name']} ({$d['email']}) -> Kimai ID $uid\n";
        } else {
            echo "  WARN: Director {$d['name']} ({$d['email']}) not in Kimai\n";
        }
    }

    if (empty($directorIds)) {
        echo "  WARN: No directors found in Kimai for '$ldapDeptName'\n";
    }

    // Process each manager
    foreach ($managers as $mgr) {
        $mgrId = getUserId($db, $mgr['email']);
        if (!$mgrId) {
            echo "  SKIP: Manager {$mgr['name']} ({$mgr['email']}) not in Kimai\n";
            continue;
        }

        // Use job title as team name, stripped of "Manager " prefix
        $teamName = $mgr['title'];
        // Remove leading "Manager " or "Regional " prefix for cleaner names
        $teamName = preg_replace('/^(Manager|Regional)\s+/i', '', $teamName);
        // Remove leading "Manager - " or "Manager: " prefix
        $teamName = preg_replace('/^Manager\s*[-:]\s*/i', '', $teamName);
        $teamName .= ' Team';

        $teamId = getOrCreateTeam($db, $teamName);
        addTeamMember($db, $teamId, $mgrId, false);

        foreach ($directorIds as $did) {
            addTeamMember($db, $teamId, $did, true);
        }

        linkTeamToDepartment($db, $teamId, $deptId);
        echo "  Created team '$teamName' for {$mgr['name']}\n";
        $createdCount++;
    }
}

echo "\n=== DONE ===\n";
echo "Teams created/updated: $createdCount\n";
echo "Departments skipped: $skippedCount\n";

ldap_close($ldap);
