<?php

namespace App\Command;

use App\Entity\User;
use App\Mail\KimaiMailer;
use App\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

#[AsCommand(name: 'kimai:timesheet:reminder', description: 'Send timesheet submission reminder to all active staff')]
final class TimesheetReminderCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly KimaiMailer $mailer
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::OPTIONAL, 'Send reminder only to this email address');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        if ($email !== null && \is_string($email)) {
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if ($user === null) {
                $io->error(\sprintf('User with email "%s" not found.', $email));
                return Command::FAILURE;
            }
            $users = [$user];
        } else {
            $users = $this->userRepository->findBy(['enabled' => true]);
        }

        if (\count($users) === 0) {
            $io->warning('No active users found.');
            return Command::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($users as $user) {
            if (!$user->isEnabled() || $user->getEmail() === null || $user->getEmail() === '') {
                $skipped++;
                continue;
            }

            $message = (new Email())
                ->subject('Timesheet Submission Reminder')
                ->to(new Address($user->getEmail(), $user->getDisplayName() ?? ''))
                ->replyTo('noreply@timesheet.ppda.go.ug')
                ->html(
                    sprintf(
                        '<p>Dear %s,</p>
                         <p>This is a reminder to submit your timesheet for this week.</p>
                         <p>Please ensure all your timesheet entries are submitted by <strong>Friday 4:00 PM</strong>.</p>
                         <p>Thank you.</p>',
                        htmlspecialchars($user->getDisplayName() ?? $user->getUserIdentifier())
                    )
                );

            try {
                $this->mailer->sendToUser($user, $message);
                $sent++;
            } catch (\Exception $e) {
                $io->error(\sprintf('Failed to send email to %s: %s', $user->getEmail(), $e->getMessage()));
            }
        }

        $io->success(\sprintf('Sent %d reminder(s), %d skipped.', $sent, $skipped));

        return Command::SUCCESS;
    }
}
