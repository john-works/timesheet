<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'kimai:auth:migrate-ldap', description: 'Migrate users to LDAP authentication, except specified internal users')]
final class MigrateAuthCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setHelp('Sets all users to LDAP authentication (auth=ldap) except for specified internal users (auth=kimai). The default internal user is "userman".')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Preview changes without saving')
            ->addOption('exclude', null, InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY, 'Usernames to exclude from LDAP migration (stays as-is)', ['userman'])
            ->addOption('internal', null, InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY, 'Usernames to set to internal (kimai) auth', ['userman'])
            ->addOption('password', null, InputOption::VALUE_REQUIRED, 'Password to set for internal auth users')
            ->addOption('force', null, InputOption::VALUE_NONE, 'Skip confirmation prompt')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = $input->getOption('dry-run');
        $excludedUsernames = array_map('strtolower', $input->getOption('exclude'));
        $internalUsernames = array_map('strtolower', $input->getOption('internal'));
        $password = $input->getOption('password');

        $users = $this->userRepository->findAll();
        $changes = [];

        foreach ($users as $user) {
            $username = strtolower($user->getUserIdentifier());
            $currentAuth = $user->getAuth();

            $isInternal = $this->matchesAny($username, $internalUsernames);
            $isExcluded = $this->matchesAny($username, $excludedUsernames);

            if ($isInternal) {
                if ($currentAuth !== User::AUTH_INTERNAL) {
                    $changes[] = [
                        'user' => $user,
                        'username' => $user->getUserIdentifier(),
                        'from' => $currentAuth ?? 'none',
                        'to' => User::AUTH_INTERNAL,
                        'needs_password' => true,
                    ];
                }
            } elseif (!$isExcluded) {
                if ($currentAuth !== User::AUTH_LDAP) {
                    $changes[] = [
                        'user' => $user,
                        'username' => $user->getUserIdentifier(),
                        'from' => $currentAuth ?? 'none',
                        'to' => User::AUTH_LDAP,
                        'needs_password' => false,
                    ];
                }
            }
        }

        if (empty($changes)) {
            $io->success('All users already have the correct authentication method. No changes needed.');

            return Command::SUCCESS;
        }

        $io->title('Authentication Migration Preview');
        $io->table(
            ['Username', 'Current Auth', 'New Auth'],
            array_map(fn ($c) => [$c['username'], $c['from'], $c['to']], $changes)
        );

        if ($dryRun) {
            $io->note('Dry-run mode: no changes were made.');
            return Command::SUCCESS;
        }

        $force = $input->getOption('force');

        if (!$force && !$io->confirm(\sprintf('Apply %d changes?', \count($changes)), false)) {
            $io->warning('Aborted.');
            return Command::SUCCESS;
        }

        foreach ($changes as $change) {
            $user = $change['user'];
            $user->setAuth($change['to']);

            if ($change['needs_password'] && $password !== null) {
                $hashed = $this->passwordHasher->hashPassword($user, $password);
                $user->setPassword($hashed);
            }

            $this->entityManager->persist($user);
        }

        $this->entityManager->flush();

        $stats = [];
        foreach ($changes as $change) {
            $key = $change['to'];
            $stats[$key] = ($stats[$key] ?? 0) + 1;
        }

        $summary = [];
        foreach ($stats as $auth => $count) {
            $summary[] = \sprintf('%d → %s', $count, $auth);
        }
        $io->success('Migration complete! ' . implode(', ', $summary));

        $internalCount = \count(array_filter($changes, fn ($c) => $c['needs_password']));
        if ($internalCount > 0 && $password === null) {
            $io->warning(\sprintf(
                '%d user(s) converted to internal auth but no password was set. Use "kimai:user:change-password" to set one.',
                $internalCount
            ));
        }

        return Command::SUCCESS;
    }

    /**
     * Check if a username matches any in a list (exact or prefix match).
     *
     * @param string   $username
     * @param string[] $candidates
     */
    private function matchesAny(string $username, array $candidates): bool
    {
        foreach ($candidates as $candidate) {
            if ($username === $candidate || str_starts_with($username, $candidate . '@')) {
                return true;
            }
        }

        return false;
    }
}
