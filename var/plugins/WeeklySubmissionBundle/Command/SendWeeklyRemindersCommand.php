<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Repository\UserRepository;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'kimai:weekly:send-reminders')]
class SendWeeklyRemindersCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly WeeklySubmissionMailer $mailer,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Send timesheet submission reminder emails to all active users');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $users = $this->userRepository->findBy(['enabled' => true]);
        $sent = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($users as $user) {
            if (empty($user->getDepartments())) {
                $skipped++;
                $output->writeln(sprintf('<comment>Skipped %s (no department)</comment>', $user->getUserIdentifier()));
                continue;
            }

            try {
                $this->mailer->sendSubmissionReminder($user);
                $sent++;
                $output->writeln(sprintf('<info>Sent to %s (%s)</info>', $user->getDisplayName(), $user->getEmail()));
            } catch (\Exception $e) {
                $failed++;
                $output->writeln(sprintf('<error>Failed to send to %s: %s</error>', $user->getUserIdentifier(), $e->getMessage()));
            }
        }

        $output->writeln(sprintf('<info>Done. Sent: %d, Failed: %d, Skipped (no dept): %d</info>', $sent, $failed, $skipped));

        return Command::SUCCESS;
    }
}
