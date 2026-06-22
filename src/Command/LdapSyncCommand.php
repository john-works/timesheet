<?php

namespace App\Command;

use App\Entity\Department;
use App\Entity\Team;
use App\Entity\User;
use App\Repository\DepartmentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'kimai:ldap:sync', description: 'Import users from AD/LDAP with departments and units')]
final class LdapSyncCommand extends Command
{
    private string $ldapHost;
    private int $ldapPort;
    private string $bindDn;
    private string $bindPassword;
    private string $baseDn;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly DepartmentRepository $departmentRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setHelp('Connects to AD/LDAP, imports users, creates departments from AD department attribute and teams from AD OUs/units, assigns users to teams, and sets team leads from AD manager attribute.')
            ->addOption('host', null, InputOption::VALUE_REQUIRED, 'LDAP host', '192.168.33.8')
            ->addOption('port', null, InputOption::VALUE_REQUIRED, 'LDAP port', '389')
            ->addOption('bind-dn', null, InputOption::VALUE_REQUIRED, 'LDAP bind DN', 'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug')
            ->addOption('bind-password', null, InputOption::VALUE_REQUIRED, 'LDAP bind password', 'ppda2016*')
            ->addOption('base-dn', null, InputOption::VALUE_REQUIRED, 'LDAP base DN', 'dc=ppda,dc=go,dc=ug')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Only show what would be imported without making changes')
            ->addOption('skip-disabled', null, InputOption::VALUE_NONE, 'Skip disabled user accounts in AD')
            ->addOption('clean', null, InputOption::VALUE_NONE, 'Remove all existing LDAP-synced teams and departments before import')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = $input->getOption('dry-run');

        $this->ldapHost = $input->getOption('host');
        $this->ldapPort = (int) $input->getOption('port');
        $this->bindDn = $input->getOption('bind-dn');
        $this->bindPassword = $input->getOption('bind-password');
        $this->baseDn = $input->getOption('base-dn');

        $ldap = $this->connectLdap($io);
        if ($ldap === false) {
            return Command::FAILURE;
        }

        $entries = $this->searchUsers($ldap, $io);
        if ($entries === false) {
            ldap_close($ldap);
            return Command::FAILURE;
        }

        $ldapUsers = $this->parseLdapEntries($entries, $input, $io);
        ldap_close($ldap);

        if (empty($ldapUsers)) {
            $io->warning('No users found in LDAP directory.');
            return Command::SUCCESS;
        }

        $stat = [
            'departments_created' => 0,
            'teams_created' => 0,
            'users_created' => 0,
            'users_updated' => 0,
            'users_skipped' => 0,
            'teamleads_set' => 0,
        ];

        $this->entityManager->beginTransaction();

        try {
            if (!$dryRun && $input->getOption('clean')) {
                $this->cleanExisting($io);
            }

            $stat = $this->sync($ldapUsers, $dryRun, $io, $stat);

            if ($dryRun) {
                $this->entityManager->rollback();
                $io->note('Dry-run mode: no changes were made.');
            } else {
                $this->entityManager->commit();
            }
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            $io->error('Sync failed: ' . $e->getMessage());

            return Command::FAILURE;
        }

        $io->success('LDAP sync completed!');
        $this->printStats($io, $stat);

        return Command::SUCCESS;
    }

    private function connectLdap(SymfonyStyle $io): false|\LDAP\Connection
    {
        $ldap = @ldap_connect($this->ldapHost, $this->ldapPort);
        if (!$ldap) {
            $io->error("Could not connect to LDAP server {$this->ldapHost}:{$this->ldapPort}");

            return false;
        }

        ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);

        if (!@ldap_bind($ldap, $this->bindDn, $this->bindPassword)) {
            $io->error('LDAP bind failed: ' . ldap_error($ldap));

            return false;
        }

        $io->info("Connected to LDAP {$this->ldapHost}:{$this->ldapPort}");

        return $ldap;
    }

    private function searchUsers(\LDAP\Connection $ldap, SymfonyStyle $io): array|false
    {
        $search = @ldap_search($ldap, $this->baseDn, '(objectClass=user)', [
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
            $io->error('LDAP search failed: ' . ldap_error($ldap));

            return false;
        }

        $entries = ldap_get_entries($ldap, $search);
        $io->info('Found ' . $entries['count'] . ' LDAP user entries');

        return $entries;
    }

    /**
     * @return list<array{samaccountname: string, mail: string, displayname: string, title: string, department: string, company: string, manager: string, distinguishedname: string, unit: string, ous: list<string>, enabled: bool}>
     */
    private function parseLdapEntries(array $entries, InputInterface $input, SymfonyStyle $io): array
    {
        $skipDisabled = $input->getOption('skip-disabled');
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
                $io->writeln("  SKIP (disabled): $username");
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
     * Extract OUs from a distinguished name.
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

    /**
     * Extract the team name from the OU path.
     * Uses the most specific (deepest) OU as the team name.
     * E.g., "Departments > Strategy and Planning > ICT Unit" → "ICT Unit"
     *        "Departments > HR and Admin" → "HR and Admin"
     *        "Disabled > Users" → ""
     */
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
    private function sync(array $ldapUsers, bool $dryRun, SymfonyStyle $io, array $stat): array
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

        $departmentMap = [];
        $units = [];

        foreach ($ldapUsers as $ldapUser) {
            $email = $ldapUser['mail'];
            $username = $email;
            $io->writeln('Processing: ' . $username);
            $departmentName = $ldapUser['department'];
            $unitName = $ldapUser['unit'];

            $existingUser = $usersByUsername[$username] ?? $usersByEmail[$email] ?? $usersByUsername[strtolower($ldapUser['samaccountname'])] ?? null;

            if ($existingUser !== null && $existingUser->getAuth() !== 'ldap') {
                $io->writeln("  SKIP (not an LDAP user): $username");
                $stat['users_skipped']++;
                continue;
            }

            if ($existingUser === null) {
                if ($dryRun) {
                    $io->writeln("  WOULD CREATE: $username ($email, unit: $unitName)");
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
                if ($departmentName !== '') {
                    $user->setPreferenceValue('ad_department', $departmentName);
                }
                if (!empty($ldapUser['ous'])) {
                    $user->setPreferenceValue('ad_ou', implode(' > ', $ldapUser['ous']));
                }
                if ($unitName !== '') {
                    $user->setPreferenceValue('ad_unit', $unitName);
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
                $io->writeln("  CREATED: $username (ID {$user->getId()})");
            } else {
                if ($dryRun) {
                    $io->writeln("  WOULD UPDATE: $username");
                    continue;
                }

                $user = $existingUser;
                $user->setAlias($ldapUser['displayname'] ?: null);
                $user->setTitle($ldapUser['title'] ?: null);
                $user->setEnabled($ldapUser['enabled']);
                $user->setPreferenceValue('ldap_dn', $ldapUser['distinguishedname']);
                if ($departmentName !== '') {
                    $user->setPreferenceValue('ad_department', $departmentName);
                }
                if (!empty($ldapUser['ous'])) {
                    $user->setPreferenceValue('ad_ou', implode(' > ', $ldapUser['ous']));
                }
                if ($unitName !== '') {
                    $user->setPreferenceValue('ad_unit', $unitName);
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
                $io->writeln("  UPDATED: $username");
            }

            if ($ldapUser['distinguishedname'] !== '') {
                $usersByDn[strtolower($ldapUser['distinguishedname'])] = $user;
            }

            if ($departmentName !== '' && !isset($departmentMap[$departmentName])) {
                $department = $this->departmentRepository->findOneBy(['name' => $departmentName]);
                if ($department === null && !$dryRun) {
                    $department = new Department($departmentName);
                    $department->setVisible(true);
                    $department->setCountry('UG');
                    $department->setTimezone('Africa/Kampala');
                    if ($ldapUser['company'] !== '') {
                        $department->setCompany($ldapUser['company']);
                    }
                    $this->entityManager->persist($department);
                    $this->entityManager->flush();
                    $stat['departments_created']++;
                    $io->writeln("  CREATED DEPARTMENT: $departmentName");
                }
                if ($department !== null) {
                    $departmentMap[$departmentName] = $department;
                }
            }

            if ($unitName !== '') {
                $unitKey = $departmentName . '::' . $unitName;
                if (!isset($units[$unitKey])) {
                    if ($departmentName !== '') {
                        $teamName = "$unitName ($departmentName)";
                    } else {
                        continue;
                    }
                    $units[$unitKey] = [
                        'department' => $departmentName,
                        'unit' => $unitName,
                        'teamName' => $teamName,
                        'users' => [],
                        'managerDn' => null,
                    ];
                }
                $units[$unitKey]['users'][] = $username;
                if ($ldapUser['manager'] !== '' && $units[$unitKey]['managerDn'] === null) {
                    $units[$unitKey]['managerDn'] = $ldapUser['manager'];
                }
            }
        }

        if ($dryRun) {
            $io->writeln('');
            $io->note('Would create teams for each unit:');
            foreach ($units as $unitKey => $unitInfo) {
                $io->writeln("  {$unitInfo['teamName']}");
            }
            $stat['teams_created'] = \count($units);

            return $stat;
        }

        foreach ($units as $unitKey => $unitInfo) {
            $teamName = $unitInfo['teamName'];
            $department = $unitInfo['department'] !== '' ? ($departmentMap[$unitInfo['department']] ?? null) : null;

            $existingTeam = $this->entityManager->getRepository(Team::class)->findOneBy(['name' => $teamName]);
            if ($existingTeam !== null) {
                $team = $existingTeam;
                $io->writeln("  FOUND EXISTING TEAM: $teamName");
            } else {
                $team = new Team($teamName);
                $this->entityManager->persist($team);
                $stat['teams_created']++;
                $io->writeln("  CREATED TEAM: $teamName");
            }

            if ($department !== null && !$department->getTeams()->contains($team)) {
                $department->addTeam($team);
                $this->entityManager->persist($department);
            }

            foreach ($unitInfo['users'] as $uname) {
                $u = $usersByUsername[$uname] ?? null;
                if ($u !== null && !$team->hasUser($u)) {
                    $team->addUser($u);
                    $io->writeln("  ADDED $uname TO $teamName");
                }
            }

            if ($unitInfo['managerDn'] !== null) {
                $managerDn = strtolower($unitInfo['managerDn']);
                $manager = $usersByDn[$managerDn] ?? null;
                if ($manager !== null && !$team->isTeamlead($manager)) {
                    $team->addTeamlead($manager);
                    $stat['teamleads_set']++;
                    $io->writeln("  SET TEAM LEAD: {$manager->getUserIdentifier()} FOR $teamName");
                } else {
                    $io->writeln("  WARNING: Manager DN not found in imported users: {$unitInfo['managerDn']}");
                }
            }

            $this->entityManager->persist($team);
            $this->entityManager->flush();
        }

        return $stat;
    }

    private function cleanExisting(SymfonyStyle $io): void
    {
        $teams = $this->entityManager->getRepository(Team::class)->findBy([], ['id' => 'ASC']);
        foreach ($teams as $team) {
            foreach ($team->getDepartments() as $dept) {
                $dept->removeTeam($team);
            }
            $this->entityManager->remove($team);
        }

        $departments = $this->departmentRepository->findAll();
        foreach ($departments as $dept) {
            $this->entityManager->remove($dept);
        }

        $this->entityManager->flush();
        $io->info('Removed all existing teams and departments.');
    }

    /**
     * @param array{departments_created: int, teams_created: int, users_created: int, users_updated: int, users_skipped: int, teamleads_set: int} $stat
     */
    private function printStats(SymfonyStyle $io, array $stat): void
    {
        $rows = [
            ['Users created', $stat['users_created']],
            ['Users updated', $stat['users_updated']],
            ['Users skipped', $stat['users_skipped']],
            ['Departments created', $stat['departments_created']],
            ['Teams created', $stat['teams_created']],
            ['Team leads set', $stat['teamleads_set']],
        ];
        $io->table(['Metric', 'Count'], $rows);
    }
}
