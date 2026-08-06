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
            ->subject(sprintf('Weekly submission from %s (%s - %s)', $submission->getUser()->getDisplayName(), $start, $end))
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
            ->subject(sprintf('Supervisor approved: %s (%s - %s) awaiting your decision', $submission->getUser()->getDisplayName(), $start, $end))
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
            ->subject(sprintf('Your weekly submission (%s - %s) was approved', $start, $end))
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
            ->subject(sprintf('Your weekly submission (%s - %s) has been fully approved', $start, $end))
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
            ->subject(sprintf('Your weekly submission (%s - %s) needs attention', $start, $end))
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
            ->subject(sprintf('Manager requires changes to %s\'s weekly submission (%s - %s)', $submission->getUser()->getDisplayName(), $start, $end))
            ->html($html);

        $this->mailer->sendToUser($supervisor, $email);
    }

    public function sendOvertimeToManagerHrNotification(WeeklySubmission $submission, User $managerHr): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/overtime_to_manager_hr.html.twig', [
            'submission' => $submission,
            'staff' => $submission->getUser(),
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('Overtime approval required: %s (%s - %s) - %d overtime hours', $submission->getUser()->getDisplayName(), $start, $end, $submission->getOvertimeHours()))
            ->html($html);

        $this->mailer->sendToUser($managerHr, $email);
    }

    public function sendManagerHrApprovedNotification(WeeklySubmission $submission): void
    {
        $start = $submission->getWeekStart()->format('Y-m-d');
        $end = $submission->getWeekEnd()->format('Y-m-d');

        $html = $this->twig->render('@WeeklySubmission/emails/manager_hr_approved.html.twig', [
            'submission' => $submission,
            'weekStart' => $start,
            'weekEnd' => $end,
        ]);

        $email = (new Email())
            ->subject(sprintf('Manager HR approved your overtime submission (%s - %s) - pending HR final approval', $start, $end))
            ->html($html);

        $this->mailer->sendToUser($submission->getUser(), $email);
    }

    public function sendSubmissionReminder(User $user, ?\DateTimeImmutable $weekStart = null): void
    {
        if ($weekStart === null) {
            $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
            $weekStart = $now->modify('monday this week')->setTime(0, 0, 0);
        }
        $weekEnd = $weekStart->modify('+4 days');

        $html = $this->twig->render('@WeeklySubmission/emails/submission_reminder.html.twig', [
            'user' => $user,
            'weekStart' => $weekStart->format('d M Y'),
            'weekEnd' => $weekEnd->format('d M Y'),
        ]);

        $email = (new Email())
            ->subject('Timesheet Submission Reminder - Week of ' . $weekStart->format('d M Y'))
            ->replyTo('noreply@timesheet.ppda.go.ug')
            ->html($html);

        $this->mailer->sendToUser($user, $email);
    }

    public function sendApprovalReminder(User $supervisor, array $staffList, string $weekStart, string $weekEnd): void
    {
        $html = $this->twig->render('@WeeklySubmission/emails/approval_reminder.html.twig', [
            'supervisor' => $supervisor,
            'submissions' => $staffList,
            'weekStart' => $weekStart,
            'weekEnd' => $weekEnd,
        ]);

        $email = (new Email())
            ->subject(sprintf('Approval Reminder - %d pending submission(s) for week %s - %s', count($staffList), $weekStart, $weekEnd))
            ->html($html);

        $this->mailer->sendToUser($supervisor, $email);
    }

    public function sendBatchSubmittedNotification(User $staff, int $weekCount, User $supervisor): void
    {
        $html = $this->twig->render('@WeeklySubmission/emails/submitted.html.twig', [
            'staff' => $staff,
            'weekCount' => $weekCount,
            'isBatch' => true,
        ]);

        $email = (new Email())
            ->subject(sprintf('%s submitted %d weekly timesheet(s)', $staff->getDisplayName(), $weekCount))
            ->html($html);

        $this->mailer->sendToUser($supervisor, $email);
    }
}
