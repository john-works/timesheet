<?php

namespace App\Command;

use App\Ldap\LdapSyncService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'kimai:ldap:sync', description: 'Import users from AD/LDAP')]
final class LdapSyncCommand extends Command
{
    public function __construct(
        private readonly LdapSyncService $ldapSyncService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setHelp('Connects to AD/LDAP and imports users. Teams and departments are managed manually by an administrator and are never created by the sync.')
            ->addOption('host', null, InputOption::VALUE_REQUIRED, 'LDAP host', '192.168.33.8')
            ->addOption('port', null, InputOption::VALUE_REQUIRED, 'LDAP port', '389')
            ->addOption('bind-dn', null, InputOption::VALUE_REQUIRED, 'LDAP bind DN', 'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug')
            ->addOption('bind-password', null, InputOption::VALUE_REQUIRED, 'LDAP bind password', 'ppda2016*')
            ->addOption('base-dn', null, InputOption::VALUE_REQUIRED, 'LDAP base DN', 'dc=ppda,dc=go,dc=ug')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Only show what would be imported without making changes')
            ->addOption('skip-disabled', null, InputOption::VALUE_NONE, 'Skip disabled user accounts in AD')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $result = $this->ldapSyncService->sync(
            ldapHost: $input->getOption('host'),
            ldapPort: (int) $input->getOption('port'),
            bindDn: $input->getOption('bind-dn'),
            bindPassword: $input->getOption('bind-password'),
            baseDn: $input->getOption('base-dn'),
            dryRun: $input->getOption('dry-run'),
            skipDisabled: $input->getOption('skip-disabled'),
        );

        foreach ($result['messages'] as $message) {
            $io->writeln($message);
        }

        if (!$result['success']) {
            $io->error('LDAP sync failed: ' . $result['error']);

            return Command::FAILURE;
        }

        $io->success('LDAP sync completed!');
        $this->printStats($io, $result['stats']);

        return Command::SUCCESS;
    }

    private function printStats(SymfonyStyle $io, array $stat): void
    {
        $rows = [
            ['Users created', $stat['users_created']],
            ['Users updated', $stat['users_updated']],
            ['Users skipped', $stat['users_skipped']],
        ];
        $io->table(['Metric', 'Count'], $rows);
    }
}
