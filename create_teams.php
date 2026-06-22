<?php
/**
 * Map all staff to teams based on AD department and title/role.
 *
 * - Directors/Executives → team leads for all teams in their department
 * - Managers → each gets a team named after their function
 * - Other staff → assigned to their manager's team (via AD manager attribute),
 *   or to a general department team if no manager is found
 */

$db = new PDO('mysql:host=127.0.0.1;dbname=timesheet;charset=utf8mb4', 'timesheet', 'ppda2022*');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ====== LDAP Connection ======
$ldapHost = '192.168.33.8';
$ldapPort = 389;
$bindDn = 'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug';
$bindPassword = 'ppda2016*';
$baseDn = 'dc=ppda,dc=go,dc=ug';

$ldap = ldap_connect($ldapHost, $ldapPort);
if (!$ldap) { echo "FATAL: Could not connect to LDAP\n"; exit(1); }
ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);

if (!@ldap_bind($ldap, $bindDn, $bindPassword)) {
    echo "FATAL: LDAP bind failed: " . ldap_error($ldap) . "\n";
    exit(1);
}
echo "Connected to LDAP\n";

// ====== Fetch Users from LDAP ======
$search = ldap_search($ldap, $baseDn, '(objectClass=user)', [
    'samaccountname', 'userprincipalname', 'displayname', 'title',
    'department', 'manager', 'distinguishedname', 'mail',
]);

if (!$search) { echo "FATAL: LDAP search failed\n"; exit(1); }

$entries = ldap_get_entries($ldap, $search);
echo "Found " . $entries['count'] . " LDAP entries\n";

// Build DN → email map for manager resolution
$dnToEmail = [];
for ($i = 0; $i < $entries['count']; $i++) {
    $dn = strtolower($entries[$i]['distinguishedname'][0] ?? '');
    $email = strtolower($entries[$i]['userprincipalname'][0] ?? '');
    if ($dn && $email) $dnToEmail[$dn] = $email;
}

// Build structured user list, keyed by department
$deptUsers = [];
for ($i = 0; $i < $entries['count']; $i++) {
    $e = $entries[$i];
    $dept = $e['department'][0] ?? null;
    if (!$dept) continue;

    $email = strtolower($e['userprincipalname'][0] ?? '');
    if (!$email) continue;

    $mgrDn = strtolower($e['manager'][0] ?? '');
    $deptUsers[$dept][] = [
        'email' => $email,
        'name'  => $e['displayname'][0] ?? '',
        'title' => $e['title'][0] ?? '',
        'mgrEmail' => $dnToEmail[$mgrDn] ?? null,
    ];
}

echo "Found " . count($deptUsers) . " departments with users\n";

// ====== DB Helpers ======

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
    if ($row) return (int)$row['id'];
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
    echo "    Added user $userId" . ($isLead ? ' as lead' : '') . " to team $teamId\n";
}

function linkTeamToDepartment(PDO $db, int $teamId, int $departmentId): void {
    $r = $db->prepare("SELECT 1 FROM kimai2_departments_teams WHERE department_id = ? AND team_id = ?");
    $r->execute([$departmentId, $teamId]);
    if (!$r->fetch()) {
        $r = $db->prepare("INSERT INTO kimai2_departments_teams (department_id, team_id) VALUES (?, ?)");
        $r->execute([$departmentId, $teamId]);
    }
}

function deriveTeamName(string $title): string {
    $name = preg_replace('/^(Manager|Regional|Senior)\s+/i', '', $title);
    $name = preg_replace('/^Manager\s*[-:]\s*/i', '', $name);
    $name = trim($name);
    if (!str_ends_with($name, 'Team')) $name .= ' Team';
    return $name;
}

// ====== Department Mapping ======
$deptMap = [
    'Strategy Planning And Monitoring'         => 'Strategy and Planning',
    'Performance Monitoring Central Government' => 'Perfomance Monitoring - Central',
    'Performance Monitoring Regional Offices'  => 'Performance Monitoring - Regional Offices',
    "Executive Director's Office"              => 'ED Office',
    'Procurement and Disposal Capacity Building' => 'Procurment Capacity Building',
    'Human Resources and Administration'       => 'HR and Admin',
    'Risk and Audit'                           => 'Internal Audit',
    'Legal and Board Affairs'                  => 'Legal and Board Affairs',
    'Finance'                                  => 'Finance',
    'Library and Documentation'                => 'Library and Documentation',
];

$kimaiDepts = [];
$r = $db->query("SELECT id, name FROM kimai2_departments");
while ($row = $r->fetch(PDO::FETCH_ASSOC)) {
    $kimaiDepts[$row['name']] = (int)$row['id'];
}

// Clear existing team memberships and teams for a clean rebuild
$db->exec("DELETE FROM kimai2_departments_teams");
$db->exec("DELETE FROM kimai2_users_teams");
$db->exec("DELETE FROM kimai2_teams");
echo "Cleared existing teams and memberships\n";

$totalCreated = 0;
$totalAssigned = 0;
$totalSkipped = 0;

foreach ($deptUsers as $ldapDeptName => $users) {
    $kimaiDeptName = $deptMap[$ldapDeptName] ?? null;
    if (!$kimaiDeptName || !isset($kimaiDepts[$kimaiDeptName])) {
        echo "SKIP: No Kimai department for '$ldapDeptName'\n";
        $totalSkipped++;
        continue;
    }
    $deptId = $kimaiDepts[$kimaiDeptName];

    echo "\n=== $ldapDeptName ===\n";

    // Categorize
    $directors = []; $managers = []; $others = [];
    foreach ($users as $u) {
        $t = strtolower($u['title']);
        if (str_contains($t, 'director') || str_contains($t, 'executive')) {
            $directors[] = $u;
        } elseif (str_contains($t, 'manager')) {
            $managers[] = $u;
        } else {
            $others[] = $u;
        }
    }

    // Resolve director IDs
    $directorIds = [];
    foreach ($directors as $d) {
        $uid = getUserId($db, $d['email']);
        if ($uid) { $directorIds[] = $uid; }
        else { echo "  WARN: Director {$d['name']} not in Kimai\n"; }
    }

    if (empty($directorIds)) {
        echo "  (no directors in Kimai)\n";
    }

    // Build managerEmail → teamId map
    $mgrTeamMap = []; // email => teamId
    $mgrIdByEmail = []; // email => userId

    foreach ($managers as $mgr) {
        $mgrId = getUserId($db, $mgr['email']);
        if (!$mgrId) {
            echo "  SKIP: Manager {$mgr['name']} not in Kimai\n";
            continue;
        }

        $teamName = deriveTeamName($mgr['title']);
        $teamId = getOrCreateTeam($db, $teamName);
        addTeamMember($db, $teamId, $mgrId, true);
        linkTeamToDepartment($db, $teamId, $deptId);
        echo "  Team '$teamName' for manager {$mgr['name']}\n";

        $mgrTeamMap[$mgr['email']] = $teamId;
        $mgrIdByEmail[$mgr['email']] = $mgrId;
        $totalCreated++;
    }

    // Assign other staff to their manager's team, or to a general department team
    $generalTeamId = null;
    $unassignedCount = 0;

    foreach ($others as $u) {
        $uid = getUserId($db, $u['email']);
        if (!$uid) continue;

        $assigned = false;

        // Try to find by manager reference
        if ($u['mgrEmail'] && isset($mgrTeamMap[$u['mgrEmail']])) {
            addTeamMember($db, $mgrTeamMap[$u['mgrEmail']], $uid, false);
            $totalAssigned++;
            $assigned = true;
        }

        // If manager has a team but wasn't matched by email, try matching
        // by seeing if any manager's processed title matches
        if (!$assigned && $u['mgrEmail']) {
            $mgrId = getUserId($db, $u['mgrEmail']);
            if ($mgrId) {
                // Find which team this manager belongs to
                $r2 = $db->prepare("SELECT team_id FROM kimai2_users_teams WHERE user_id = ? AND teamlead = 1 LIMIT 1");
                $r2->execute([$mgrId]);
                $row = $r2->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    addTeamMember($db, (int)$row['team_id'], $uid, false);
                    $totalAssigned++;
                    $assigned = true;
                }
            }
        }

        if (!$assigned) {
            // Put in a general department team
            if ($generalTeamId === null) {
                $deptName = $kimaiDeptName;
                $generalTeamId = getOrCreateTeam($db, "$deptName Staff");
                foreach ($directorIds as $did) {
                    addTeamMember($db, $generalTeamId, $did, true);
                }
                linkTeamToDepartment($db, $generalTeamId, $deptId);
                echo "  Created general team '$deptName Staff'\n";
                $totalCreated++;
            }
            addTeamMember($db, $generalTeamId, $uid, false);
            $totalAssigned++;
            $unassignedCount++;
        }
    }

    if ($unassignedCount > 0) {
        echo "  (assigned $unassignedCount staff to general department team)\n";
    }
}

echo "\n=== Assigning Roles ===\n";

$roleUser = serialize(['ROLE_USER']);
$roleTeamlead = serialize(['ROLE_USER', 'ROLE_TEAMLEAD']);

// Only Directors/Executives -> ROLE_TEAMLEAD (grants view_other_timesheet)
$upgraded = $db->exec("UPDATE kimai2_users SET roles = " . $db->quote($roleTeamlead) . "
    WHERE roles = " . $db->quote($roleUser) . " AND enabled = 1 AND id > 1
    AND (LOWER(title) LIKE '%director%' OR LOWER(title) LIKE '%executive%')");
echo "Upgraded " . ($upgraded ?: 0) . " users to ROLE_TEAMLEAD\n";

// Anyone on ROLE_TEAMLEAD who shouldn't be -> downgrade
$downgraded = $db->exec("UPDATE kimai2_users SET roles = " . $db->quote($roleUser) . "
    WHERE roles = " . $db->quote($roleTeamlead) . " AND enabled = 1 AND id > 1
    AND NOT (LOWER(title) LIKE '%director%' OR LOWER(title) LIKE '%executive%')");
echo "Downgraded " . ($downgraded ?: 0) . " users back to ROLE_USER\n";

// ====== Ensure "Leave" Activity Exists ======
$r = $db->prepare("SELECT id FROM kimai2_activities WHERE name = 'Leave'");
$r->execute();
if (!$r->fetch()) {
    // Find the first visible project to link the activity to
    $proj = $db->query("SELECT id FROM kimai2_projects WHERE visible = 1 ORDER BY id ASC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $projectId = $proj ? (int)$proj['id'] : 'NULL';
    $db->exec("INSERT INTO kimai2_activities (name, visible, billable, project_id) VALUES ('Leave', 1, 0, $projectId)");
    echo "Created 'Leave' activity\n";
} else {
    echo "'Leave' activity already exists\n";
}

echo "\n=== DONE ===\n";
echo "Teams created: $totalCreated\n";
echo "Staff assigned: $totalAssigned\n";
echo "Departments skipped: $totalSkipped\n";

ldap_close($ldap);
