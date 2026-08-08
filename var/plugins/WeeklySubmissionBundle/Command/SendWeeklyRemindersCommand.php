<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Repository\UserRepository;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
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
        private readonly WeeklySubmissionRepository $repository,
        private readonly WeeklySubmissionMailer $mailer,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Send reminder emails to users who have not submitted their weekly timesheet')
            ->addOption('dry-run', null, \Symfony\Component\Console\Input\InputOption::VALUE_NONE, 'Show what would be sent without sending emails');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));

        // Calculate current week Monday
        $currentWeekStart = $now->modify('monday this week')->setTime(0, 0, 0);
        $weekEnd = $currentWeekStart->modify('+4 days');

        // Monday reminders target last week's timesheet; other days target the current week
        $dayOfWeek = (int) $now->format('N');
        $targetWeekStart = $dayOfWeek === 1 ? $currentWeekStart->modify('-7 days') : $currentWeekStart;

        // Get all active non-system users
        $allUsers = $this->userRepository->findAll();
        $dryRun = $input->getOption('dry-run');
        $reminded = 0;
        $errors = 0;
        $skipped = 0;
        $alreadySubmitted = 0;

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
            '/^svc-/',
            '/^zabbix/',
        ];

        foreach ($allUsers as $user) {
            // Skip system accounts and disabled users
            if ($user->isSystemAccount() || !$user->isEnabled()) {
                continue;
            }

            // Skip service accounts
            $username = $user->getUserIdentifier();
            foreach ($servicePatterns as $pattern) {
                if (preg_match($pattern, $username)) {
                    $skipped++;
                    continue 2;
                }
            }

            // Skip users with no email
            if (empty($user->getEmail())) {
                $skipped++;
                continue;
            }

            // Check if user has submitted for the target week
            $submission = $this->repository->findForUserAndWeek($user, $targetWeekStart);

            if ($submission !== null && (
                $submission->isSubmitted()
                || $submission->isSupervisorApproved()
                || $submission->isApproved()
            )) {
                $alreadySubmitted++;
                continue;
            }

            if ($dryRun) {
                $output->writeln(sprintf('<info>[DRY-RUN] Would send reminder to %s (%s)</info>',
                    $user->getDisplayName(), $user->getEmail()));
                $reminded++;
                continue;
            }

            try {
                $this->mailer->sendSubmissionReminder($user, $targetWeekStart);
                $output->writeln(sprintf('<info>Reminder sent to %s (%s)</info>',
                    $user->getDisplayName(), $user->getEmail()));
                $reminded++;
            } catch (\Exception $e) {
                $output->writeln(sprintf('<error>Failed to send to %s: %s</error>',
                    $user->getUserIdentifier(), $e->getMessage()));
                $errors++;
            }
        }

        $label = $dryRun ? 'Would remind' : 'Reminded';
        $output->writeln(sprintf('<info>Done. %s: %d, Already submitted: %d, Skipped (service): %d, Errors: %d</info>', $label,
            $reminded, $alreadySubmitted, $skipped, $errors));

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
