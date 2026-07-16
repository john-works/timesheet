<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Repository\UserRepository;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'kimai:weekly:send-test-reminder')]
class SendTestReminderCommand extends Command
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
        $this->setDescription('Send a test Timesheet Submission Reminder email to jssekamatte');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $user = $this->userRepository->findOneBy(['username' => 'jssekamatte']);

        if ($user === null) {
            $output->writeln('<error>User jssekamatte not found.</error>');
            return Command::FAILURE;
        }

        $this->mailer->sendSubmissionReminder($user);

        $output->writeln(sprintf('<info>Reminder email sent to %s (%s)</info>', $user->getDisplayName(), $user->getEmail()));

        return Command::SUCCESS;
    }
}
