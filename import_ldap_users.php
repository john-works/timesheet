<?php
/**
 * Import users from LDAP into Kimai's timesheet DB.
 *
 * Usage: php import_ldap_users.php
 *
 * - Detects service accounts by common AD naming patterns and marks them disabled
 * - Truncates long titles to fit varchar(50)
 * - Falls back from mail to userprincipalname if needed
 */

// ====== DB Connection (matching .env) ======
$db = new PDO(
    'mysql:host=127.0.0.1;dbname=timesheet;charset=utf8mb4',
    'timesheet',
    'ppda2022*'
);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

// Patterns indicating a service/technical account (case-insensitive match on username)
$servicePatterns = [
    '/^ad_/',
    '/^sccm/',
    '/^itadmin/',
    '/^itop_/',
    '/^itoptest/',
    '/^edmsadmin/',
    '/^solomonadmin/',
    '/^appserver/',
    '/^mailbackup/',
    '/^mail$/',
    '/^vpn$/',
    '/^share$/',
    '/^quarantine$/',
    '/^kaspersky/',
    '/^mruser$/',
    '/^knowbe4/',
];

function isServiceAccount(string $username): bool
{
    global $servicePatterns;
    foreach ($servicePatterns as $pattern) {
        if (preg_match($pattern, $username)) {
            return true;
        }
    }
    return false;
}

// ====== Fetch Users from LDAP ======
$search = ldap_search($ldap, $baseDn, '(objectClass=user)', [
    'samaccountname',
    'userprincipalname',
    'displayname',
    'title',
    'department',
    'mail',
    'manager',
    'distinguishedname',
]);

if (!$search) {
    echo "FATAL: LDAP search failed: " . ldap_error($ldap) . "\n";
    exit(1);
}

$entries = ldap_get_entries($ldap, $search);
echo "Found " . $entries['count'] . " LDAP user entries\n";

// Pre-fetch existing usernames and emails
$existingUsers = [];
$r = $db->query("SELECT LOWER(username) AS username, LOWER(email) AS email, id FROM kimai2_users");
while ($row = $r->fetch(PDO::FETCH_ASSOC)) {
    $existingUsers['username'][$row['username']] = (int)$row['id'];
    $existingUsers['email'][$row['email']] = (int)$row['id'];
}

$created = 0;
$createdService = 0;
$skipped = 0;
$errors = 0;

foreach ($entries as $i => $e) {
    if ($i === 'count') continue;

    $username = strtolower(trim($e['samaccountname'][0] ?? ''));
    $email = strtolower(trim($e['mail'][0] ?? $e['userprincipalname'][0] ?? ''));
    $displayName = $e['displayname'][0] ?? '';
    $title = $e['title'][0] ?? '';

    if (empty($username) || empty($email)) {
        echo "  SKIP: missing username or email for entry $i\n";
        $skipped++;
        continue;
    }

    // Check if user already exists
    if (isset($existingUsers['username'][$username])) {
        echo "  SKIP: $username ($email) already exists (ID {$existingUsers['username'][$username]})\n";
        $skipped++;
        continue;
    }

    if (isset($existingUsers['email'][$email])) {
        echo "  SKIP: $username ($email) already exists by email (ID {$existingUsers['email'][$email]})\n";
        $skipped++;
        continue;
    }

    // Truncate title if too long for varchar(50)
    if (mb_strlen($title) > 50) {
        $title = mb_substr($title, 0, 50);
    }

    // Detect service accounts
    $isService = isServiceAccount($username);

    // Create the user
    try {
        $now = date('Y-m-d H:i:s');
        $enabled = $isService ? 0 : 1;
        $stmt = $db->prepare(
            "INSERT INTO kimai2_users 
             (username, email, alias, title, auth, enabled, password, roles, registration_date, system_account) 
             VALUES (?, ?, ?, ?, 'ldap', ?, '', 'a:1:{i:0;s:9:\"ROLE_USER\";}', ?, ?)"
        );
        $stmt->execute([$username, $email, $displayName, $title, $enabled, $now, $isService ? 1 : 0]);
        $userId = (int)$db->lastInsertId();

        if ($isService) {
            echo "  CREATED (disabled service account): $username ($email) — ID $userId\n";
            $createdService++;
        } else {
            echo "  CREATED: $username ($email) — ID $userId\n";
        }
        $created++;
    } catch (\Exception $ex) {
        echo "  ERROR: $username ($email) — " . $ex->getMessage() . "\n";
        $errors++;
    }
}

echo "\n=== DONE ===\n";
echo "Created: $created ($createdService service accounts disabled)\n";
echo "Skipped: $skipped\n";
echo "Errors: $errors\n";

ldap_close($ldap);
