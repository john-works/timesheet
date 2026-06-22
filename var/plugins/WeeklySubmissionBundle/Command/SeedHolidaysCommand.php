<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use KimaiPlugin\WeeklySubmissionBundle\Entity\PublicHoliday;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputOption;

#[AsCommand(name: 'kimai:seed-holidays')]
class SeedHolidaysCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Seed Ugandan public holidays from 2026 through 2045')
            ->addOption('year', 'y', InputOption::VALUE_OPTIONAL, 'Seed only a specific year (e.g. 2030)')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Only show what would be created');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $startYear = 2026;
        $endYear = 2045;
        $specificYear = $input->getOption('year');
        $dryRun = $input->getOption('dry-run');

        if ($specificYear !== null) {
            $startYear = (int) $specificYear;
            $endYear = (int) $specificYear;
        }

        $fixedHolidays = [
            ['name' => 'New Year\'s Day', 'month' => 1, 'day' => 1],
            ['name' => 'NRM Liberation Day', 'month' => 1, 'day' => 26],
            ['name' => 'Archbishop Janani Luwum Day', 'month' => 2, 'day' => 16],
            ['name' => 'International Women\'s Day', 'month' => 3, 'day' => 8],
            ['name' => 'Labour Day', 'month' => 5, 'day' => 1],
            ['name' => 'Martyrs\' Day', 'month' => 6, 'day' => 3],
            ['name' => 'National Heroes Day', 'month' => 6, 'day' => 9],
            ['name' => 'Independence Day', 'month' => 10, 'day' => 9],
            ['name' => 'Christmas Day', 'month' => 12, 'day' => 25],
            ['name' => 'Boxing Day', 'month' => 12, 'day' => 26],
        ];

        $totalCreated = 0;
        $totalSkipped = 0;

        for ($year = $startYear; $year <= $endYear; $year++) {
            $output->writeln(sprintf('<info>Year %d</info>', $year));

            // Fixed-date holidays
            foreach ($fixedHolidays as $holiday) {
                $result = $this->createIfNotExists($year, $holiday['month'], $holiday['day'], $holiday['name'], $dryRun);
                if ($result === 'created') {
                    $totalCreated++;
                    $output->writeln(sprintf('  + %s', $holiday['name']));
                } elseif ($result === 'skipped') {
                    $totalSkipped++;
                }
            }

            // Easter-based holidays
            $easterDays = easter_days($year);
            $easter = new \DateTimeImmutable(sprintf('%d-03-21', $year));
            $easter = $easter->modify(sprintf('+%d days', $easterDays));

            $goodFriday = $easter->modify('-2 days');
            $easterMonday = $easter->modify('+1 day');

            $result = $this->createIfNotExistsDt($goodFriday, 'Good Friday', $dryRun);
            if ($result === 'created') {
                $totalCreated++;
                $output->writeln(sprintf('  + Good Friday (%s)', $goodFriday->format('j M')));
            } elseif ($result === 'skipped') {
                $totalSkipped++;
            }

            $result = $this->createIfNotExistsDt($easterMonday, 'Easter Monday', $dryRun);
            if ($result === 'created') {
                $totalCreated++;
                $output->writeln(sprintf('  + Easter Monday (%s)', $easterMonday->format('j M')));
            } elseif ($result === 'skipped') {
                $totalSkipped++;
            }
        }

        if (!$dryRun) {
            $this->entityManager->flush();
        }

        if ($dryRun) {
            $output->writeln(sprintf('<comment>Dry run: %d holidays would be created</comment>', $totalCreated));
        } else {
            $output->writeln(sprintf('<info>Done: %d created, %d already existed</info>', $totalCreated, $totalSkipped));
        }

        return Command::SUCCESS;
    }

    private function createIfNotExists(int $year, int $month, int $day, string $name, bool $dryRun): string
    {
        $date = new \DateTimeImmutable(sprintf('%d-%02d-%02d', $year, $month, $day));
        return $this->createIfNotExistsDt($date, $name, $dryRun);
    }

    private function createIfNotExistsDt(\DateTimeImmutable $date, string $name, bool $dryRun): string
    {
        $existing = $this->entityManager->getRepository(PublicHoliday::class)->findOneBy([
            'holidayDate' => $date,
        ]);

        if ($existing !== null) {
            return 'skipped';
        }

        if (!$dryRun) {
            $holiday = new PublicHoliday($date, $name);
            $this->entityManager->persist($holiday);
        }

        return 'created';
    }
}
