<?php

namespace App\Command;

use Exception;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'migrate:refresh', description: 'Drop all tables and re-run all migrations')]
class MigrateRefreshCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$input->isInteractive()) {
            $io->error('This command must be run interactively or use -n to skip confirmation.');
            return Command::FAILURE;
        }

        $io->warning('This will DROP ALL TABLES and re-run all migrations!');

        $io->section('Dropping schema...');
        try {
            $command = $this->getApplication()->find('doctrine:schema:drop');
            $command->run(new ArrayInput(['--force' => true, '--full-database' => true]), $output);
        } catch (Exception $ex) {
            $io->error('Failed to drop schema: ' . $ex->getMessage());
            return Command::FAILURE;
        }

        $io->section('Dropping migration tracking tables...');
        foreach (['migration_versions', 'kimai2_sessions', 'doctrine_migration_versions'] as $table) {
            try {
                $command = $this->getApplication()->find('dbal:run-sql');
                $command->run(new ArrayInput(['sql' => \sprintf('DROP TABLE IF EXISTS %s', $table)]), $output);
            } catch (Exception $ex) {
                $io->warning('Could not drop table ' . $table . ': ' . $ex->getMessage());
            }
        }

        $io->section('Running migrations...');
        try {
            $command = $this->getApplication()->find('doctrine:migrations:migrate');
            $cmdInput = new ArrayInput([]);
            $cmdInput->setInteractive(false);
            $command->run($cmdInput, $output);
        } catch (Exception $ex) {
            $io->error('Failed to run migrations: ' . $ex->getMessage());
            return Command::FAILURE;
        }

        $io->success('Database refreshed successfully.');

        return Command::SUCCESS;
    }
}
