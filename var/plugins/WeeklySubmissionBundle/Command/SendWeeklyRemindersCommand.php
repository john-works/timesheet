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
        $this->setDescription('Send reminder emails to users who have not submitted their weekly timesheet');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Testing: only send to jssekamatte
        $user = $this->userRepository->findOneBy(['username' => 'jssekamatte']);

        if ($user === null) {
            $output->writeln('<error>User jssekamatte not found.</error>');
            return Command::FAILURE;
        }

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $dayOfWeek = (int) $now->format('N'); // 1=Mon, 5=Fri

        // Calculate current week Monday
        $currentWeekStart = $now->modify('monday this week')->setTime(0, 0, 0);

        // Check if user has submitted for the current week
        $submission = $this->repository->findForUserAndWeek($user, $currentWeekStart);

        if ($submission !== null && ($submission->isSubmitted() || $submission->isSupervisorApproved() || $submission->isManagerApproved() || $submission->isHrApproved() || $submission->isApproved())) {
            $output->writeln(sprintf('<info>%s has already submitted for week of %s. Skipping.</info>', $user->getDisplayName(), $currentWeekStart->format('d/m/Y')));
            return Command::SUCCESS;
        }

        // Calculate week date range for the email
        $weekEnd = $currentWeekStart->modify('+4 days');

        try {
            $this->mailer->sendSubmissionReminder($user);
            $output->writeln(sprintf('<info>Reminder sent to %s (%s) for week %s - %s</info>',
                $user->getDisplayName(),
                $user->getEmail(),
                $currentWeekStart->format('d/m/Y'),
                $weekEnd->format('d/m/Y')
            ));
        } catch (\Exception $e) {
            $output->writeln(sprintf('<error>Failed to send to %s: %s</error>', $user->getUserIdentifier(), $e->getMessage()));
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
