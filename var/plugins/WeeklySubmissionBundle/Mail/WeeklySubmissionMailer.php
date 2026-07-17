<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Mail;

use App\Entity\User;
use App\Mail\KimaiMailer;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class WeeklySubmissionMailer
{
    public function __construct(
        private readonly KimaiMailer $mailer,
        private readonly Environment $twig
    )
    {
    }

    public function sendSubmittedNotification(WeeklySubmission $submission, User $supervisor): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/submitted.html.twig', [
            'submission' => $submission,
            'staff' => $submission->getUser(),
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Weekly submission from %s (%s - %s)', $submission->getUser()->getDisplayName(), $start, $end))
            ->html($html);

        $this->mailer->sendToUser($supervisor, $email);
    }

    public function sendSupervisorApprovedNotification(WeeklySubmission $submission, User $nextApprover): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/supervisor_approved.html.twig', [
            'submission' => $submission,
            'staff' => $submission->getUser(),
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Supervisor approved: %s (%s - %s) awaiting your decision', $submission->getUser()->getDisplayName(), $start, $end))
            ->html($html);

        $this->mailer->sendToUser($nextApprover, $email);
    }

    public function sendApprovedNotification(WeeklySubmission $submission): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/approved.html.twig', [
            'submission' => $submission,
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Your weekly submission (%s - %s) was approved', $start, $end))
            ->html($html);

        $this->mailer->sendToUser($submission->getUser(), $email);
    }

    public function sendFinalApprovedNotification(WeeklySubmission $submission, User $manager): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/final_approved.html.twig', [
            'submission' => $submission,
            'manager' => $manager,
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Your weekly submission (%s - %s) has been fully approved', $start, $end))
            ->html($html);

        $this->mailer->sendToUser($submission->getUser(), $email);
    }

    public function sendRejectedNotification(WeeklySubmission $submission): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/rejected.html.twig', [
            'submission' => $submission,
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Your weekly submission (%s - %s) needs attention', $start, $end))
            ->html($html);

        $this->mailer->sendToUser($submission->getUser(), $email);
    }

    public function sendManagerRejectedNotification(WeeklySubmission $submission, User $supervisor): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/rejected.html.twig', [
            'submission' => $submission,
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('[Timesheet] Manager requires changes to %s\'s weekly submission (%s - %s)', $submission->getUser()->getDisplayName(), $start, $end))
            ->html($html);

        $this->mailer->sendToUser($supervisor, $email);
    }

    public function sendSubmissionReminder(User $user): void
    {
        $email = (new Email())
            ->subject('Timesheet Submission Reminder')
            ->to(new \Symfony\Component\Mime\Address($user->getEmail(), $user->getDisplayName() ?? ''))
            ->replyTo('noreply@timesheet.ppda.go.ug')
            ->html(
                sprintf(
                    '<p>Dear %s,</p>
                     <p>This is a reminder to submit your timesheet for this week.</p>
                     <p>Please ensure all your timesheet entries are submitted by <strong>Thursday 4:00 PM</strong>to <strong>Saturday 7:00 PM.</p>
                     <p>Thank you.</p>',
                    htmlspecialchars($user->getDisplayName() ?? $user->getUserIdentifier())
                )
            );

        $this->mailer->sendToUser($user, $email);
    }
}
