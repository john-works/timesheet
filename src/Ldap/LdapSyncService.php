<?php

namespace App\Ldap;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

final class LdapSyncService
{
    private array $messages = [];

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    /**
     * @return array{stats: array, messages: string[], success: bool, error: ?string}
     */
    public function sync(
        string $ldapHost,
        int $ldapPort,
        string $bindDn,
        string $bindPassword,
        string $baseDn,
        bool $dryRun = false,
        bool $skipDisabled = false,
    ): array {
        $this->messages = [];

        $stat = [
            'users_created' => 0,
            'users_updated' => 0,
            'users_skipped' => 0,
        ];

        try {
            $ldap = $this->connectLdap($ldapHost, $ldapPort, $bindDn, $bindPassword);
            if ($ldap === false) {
                return ['stats' => $stat, 'messages' => $this->messages, 'success' => false, 'error' => 'LDAP connection failed'];
            }

            $entries = $this->searchUsers($ldap, $baseDn);
            if ($entries === false) {
                ldap_close($ldap);
                return ['stats' => $stat, 'messages' => $this->messages, 'success' => false, 'error' => 'LDAP search failed'];
            }

            $ldapUsers = $this->parseLdapEntries($entries, $skipDisabled);
            ldap_close($ldap);

            if (empty($ldapUsers)) {
                $this->messages[] = 'No users found in LDAP directory.';
                return ['stats' => $stat, 'messages' => $this->messages, 'success' => true, 'error' => null];
            }

            $this->entityManager->beginTransaction();

            try {
                $stat = $this->syncUsers($ldapUsers, $dryRun, $stat);

                if ($dryRun) {
                    $this->entityManager->rollback();
                    $this->messages[] = 'Dry-run mode: no changes were made.';
                } else {
                    $this->entityManager->commit();
                }
            } catch (\Throwable $e) {
                $this->entityManager->rollback();
                throw $e;
            }

            return ['stats' => $stat, 'messages' => $this->messages, 'success' => true, 'error' => null];
        } catch (\Throwable $e) {
            return ['stats' => $stat, 'messages' => $this->messages, 'success' => false, 'error' => $e->getMessage()];
        }
    }

    private function connectLdap(string $host, int $port, string $bindDn, string $bindPassword): false|\LDAP\Connection
    {
        $ldap = @ldap_connect($host, $port);
        if (!$ldap) {
            $this->messages[] = "Could not connect to LDAP server $host:$port";
            return false;
        }

        ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);

        if (!@ldap_bind($ldap, $bindDn, $bindPassword)) {
            $this->messages[] = 'LDAP bind failed: ' . ldap_error($ldap);
            return false;
        }

        $this->messages[] = "Connected to LDAP $host:$port";
        return $ldap;
    }

    private function searchUsers(\LDAP\Connection $ldap, string $baseDn): array|false
    {
        $search = @ldap_search($ldap, $baseDn, '(objectClass=user)', [
            'samaccountname',
            'userprincipalname',
            'displayname',
            'title',
            'department',
            'company',
            'mail',
            'manager',
            'distinguishedname',
            'whencreated',
            'useraccountcontrol',
        ]);

        if (!$search) {
            $this->messages[] = 'LDAP search failed: ' . ldap_error($ldap);
            return false;
        }

        $entries = ldap_get_entries($ldap, $search);
        $this->messages[] = 'Found ' . $entries['count'] . ' LDAP user entries';
        return $entries;
    }

    /**
     * @return list<array{samaccountname: string, mail: string, displayname: string, title: string, department: string, company: string, manager: string, distinguishedname: string, unit: string, ous: list<string>, enabled: bool}>
     */
    private function parseLdapEntries(array $entries, bool $skipDisabled): array
    {
        $users = [];

        foreach ($entries as $i => $e) {
            if ($i === 'count') {
                continue;
            }

            $username = strtolower(trim($e['samaccountname'][0] ?? ''));
            $email = strtolower(trim($e['mail'][0] ?? $e['userprincipalname'][0] ?? ''));

            if (empty($username) || empty($email)) {
                continue;
            }

            $uac = (int) ($e['useraccountcontrol'][0] ?? 0);
            $enabled = !($uac & 2);

            if ($skipDisabled && !$enabled) {
                $this->messages[] = "  SKIP (disabled): $username";
                continue;
            }

            $dn = $e['distinguishedname'][0] ?? '';
            $ous = $this->parseOUs($dn);
            $unit = $this->extractUnit($ous);

            $users[] = [
                'samaccountname' => $username,
                'mail' => $email,
                'displayname' => $e['displayname'][0] ?? '',
                'title' => mb_substr($e['title'][0] ?? '', 0, 50),
                'department' => $e['department'][0] ?? '',
                'company' => $e['company'][0] ?? '',
                'manager' => $e['manager'][0] ?? '',
                'distinguishedname' => $dn,
                'unit' => $unit,
                'ous' => $ous,
                'enabled' => $enabled,
            ];
        }

        return $users;
    }

    /**
     * @return list<string>
     */
    private function parseOUs(string $dn): array
    {
        $ous = [];
        $parts = explode(',', $dn);
        foreach ($parts as $part) {
            $part = trim($part);
            if (stripos($part, 'OU=') === 0) {
                $ous[] = substr($part, 3);
            }
        }

        return array_reverse($ous);
    }

    private function extractUnit(array $ous): string
    {
        if (empty($ous)) {
            return '';
        }

        $skipOus = ['disabled', 'service accounts', 'super users', 'users'];

        $firstLower = strtolower($ous[0]);
        if (\in_array($firstLower, $skipOus, true)) {
            return '';
        }

        if (\count($ous) === 1) {
            if (\in_array($firstLower, $skipOus, true)) {
                return '';
            }
            return $ous[0];
        }

        if (\count($ous) >= 2 && strtolower($ous[0]) === 'departments') {
            $last = end($ous);
            if (strtolower($last) !== 'departments') {
                return $last;
            }
            return $ous[1];
        }

        return $ous[\count($ous) - 1];
    }

    /**
     * @param list<array{samaccountname: string, mail: string, displayname: string, title: string, department: string, company: string, manager: string, distinguishedname: string, unit: string, ous: list<string>, enabled: bool}> $ldapUsers
     */
    private function syncUsers(array $ldapUsers, bool $dryRun, array $stat): array
    {
        $existingUsers = $this->userRepository->findAll();
        $usersByUsername = [];
        $usersByEmail = [];
        $usersByDn = [];
        foreach ($existingUsers as $user) {
            $usersByUsername[strtolower($user->getUserIdentifier())] = $user;
            if ($user->getEmail() !== null) {
                $usersByEmail[strtolower($user->getEmail())] = $user;
            }
            $dn = $user->getPreferenceValue('ldap_dn');
            if ($dn !== null) {
                $usersByDn[strtolower($dn)] = $user;
            }
        }

        foreach ($ldapUsers as $ldapUser) {
            $email = $ldapUser['mail'];
            $username = $email;
            $this->messages[] = 'Processing: ' . $username;

            $existingUser = $usersByUsername[$username] ?? $usersByEmail[$email] ?? $usersByUsername[strtolower($ldapUser['samaccountname'])] ?? null;

            if ($existingUser !== null && $existingUser->getAuth() !== 'ldap') {
                $this->messages[] = "  SKIP (not an LDAP user): $username";
                $stat['users_skipped']++;
                continue;
            }

            if ($existingUser === null) {
                if ($dryRun) {
                    $this->messages[] = "  WOULD CREATE: $username ($email)";
                    continue;
                }

                $user = new User();
                $user->setUserIdentifier($username);
                $user->setEmail($email);
                $user->setPassword('');
                $user->setAuth(User::AUTH_LDAP);
                $user->setEnabled($ldapUser['enabled']);
                $user->setAlias($ldapUser['displayname'] ?: null);
                $user->setTitle($ldapUser['title'] ?: null);
                $user->setRoles([User::DEFAULT_ROLE]);

                $user->setPreferenceValue('ldap_dn', $ldapUser['distinguishedname']);
                if ($ldapUser['department'] !== '') {
                    $user->setPreferenceValue('ad_department', $ldapUser['department']);
                }
                if (!empty($ldapUser['ous'])) {
                    $user->setPreferenceValue('ad_ou', implode(' > ', $ldapUser['ous']));
                }
                if ($ldapUser['unit'] !== '') {
                    $user->setPreferenceValue('ad_unit', $ldapUser['unit']);
                }
                if ($ldapUser['company'] !== '') {
                    $user->setPreferenceValue('ad_company', $ldapUser['company']);
                }
                if ($ldapUser['manager'] !== '') {
                    $user->setPreferenceValue('ad_manager', $ldapUser['manager']);
                }

                $this->entityManager->persist($user);
                $this->entityManager->flush();
                $this->entityManager->refresh($user);
                $usersByUsername[strtolower($user->getUserIdentifier())] = $user;
                $usersByDn[strtolower($ldapUser['distinguishedname'])] = $user;
                $stat['users_created']++;
                $this->messages[] = "  CREATED: $username (ID {$user->getId()})";
            } else {
                if ($dryRun) {
                    $this->messages[] = "  WOULD UPDATE: $username";
                    continue;
                }

                $user = $existingUser;
                $user->setAlias($ldapUser['displayname'] ?: null);
                $user->setTitle($ldapUser['title'] ?: null);
                $user->setEnabled($ldapUser['enabled']);
                $user->setPreferenceValue('ldap_dn', $ldapUser['distinguishedname']);
                if ($ldapUser['department'] !== '') {
                    $user->setPreferenceValue('ad_department', $ldapUser['department']);
                }
                if (!empty($ldapUser['ous'])) {
                    $user->setPreferenceValue('ad_ou', implode(' > ', $ldapUser['ous']));
                }
                if ($ldapUser['unit'] !== '') {
                    $user->setPreferenceValue('ad_unit', $ldapUser['unit']);
                }
                if ($ldapUser['company'] !== '') {
                    $user->setPreferenceValue('ad_company', $ldapUser['company']);
                }
                if ($ldapUser['manager'] !== '') {
                    $user->setPreferenceValue('ad_manager', $ldapUser['manager']);
                }
                $this->entityManager->persist($user);
                $this->entityManager->flush();
                $stat['users_updated']++;
                $this->messages[] = "  UPDATED: $username";
            }
        }

        return $stat;
    }
}
