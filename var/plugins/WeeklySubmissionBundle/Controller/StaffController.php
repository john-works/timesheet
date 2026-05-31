<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\User;
use App\Repository\TimesheetRepository;
use App\Repository\Query\TimesheetQuery;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[IsGranted('view_own_timesheet')]
final class StaffController extends AbstractController
{
    public function __construct(
        private readonly WeeklySubmissionRepository $repository,
        private readonly TimesheetRepository $timesheetRepository,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly EntityManagerInterface $entityManager
    )
    {
    }

    #[Route('/my-weekly', name: 'weekly_submission_staff', methods: ['GET'])]
    public function index(#[CurrentUser] User $user): Response
    {
        $weekStart = $this->getCurrentWeekStart();
        $submission = $this->repository->findForUserAndWeek($user, $weekStart);

        if ($submission === null) {
            $submission = new WeeklySubmission($user, $weekStart);
        }

        $totalDuration = $this->calculateWeekDuration($user, $weekStart);
        $submission->setTotalDuration($totalDuration);

        $history = $this->repository->findHistoryForUser($user);

        return $this->render('@WeeklySubmission/staff/index.html.twig', [
            'submission' => $submission,
            'weekStart' => $weekStart,
            'weekEnd' => $weekStart->modify('+6 days'),
            'totalDuration' => $totalDuration,
            'history' => $history,
            'supervisor' => $user->getSupervisor(),
        ]);
    }

    #[Route('/my-weekly/submit', name: 'weekly_submission_staff_submit', methods: ['POST'])]
    public function submit(#[CurrentUser] User $user, Request $request): Response
    {
        $weekStart = $this->getCurrentWeekStart();
        $submission = $this->repository->findForUserAndWeek($user, $weekStart);

        if ($submission === null) {
            $submission = new WeeklySubmission($user, $weekStart);
        }

        if (!$submission->isDraft() && !$submission->isRejected()) {
            $this->addFlash('error', 'This week has already been submitted.');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        $totalDuration = $this->calculateWeekDuration($user, $weekStart);
        $submission->setTotalDuration($totalDuration);
        $submission->setStatus(WeeklySubmission::STATUS_SUBMITTED);
        $submission->setSubmittedAt(new \DateTimeImmutable());
        $submission->setApprovedBy(null);
        $submission->setApprovedAt(null);
        $submission->setSupervisorNotes(null);

        $this->entityManager->persist($submission);
        $this->entityManager->flush();

        $supervisor = $user->getSupervisor();
        if ($supervisor !== null) {
            try {
                $this->mailer->sendSubmittedNotification($submission, $supervisor);
            } catch (\Exception $e) {
                // email sending is best-effort
            }
        }

        $this->addFlash('success', 'Weekly timesheet submitted successfully.');
        return $this->redirectToRoute('weekly_submission_staff');
    }

    private function getCurrentWeekStart(): \DateTimeImmutable
    {
        $now = new \DateTimeImmutable();
        $dayOfWeek = (int) $now->format('N'); // 1=Mon, 7=Sun
        $daysToSubtract = $dayOfWeek - 1; // go back to Monday
        return $now->modify("-{$daysToSubtract} days")->setTime(0, 0, 0);
    }

    private function calculateWeekDuration(User $user, \DateTimeImmutable $weekStart): int
    {
        $weekEnd = $weekStart->modify('+7 days');

        $query = new TimesheetQuery();
        $query->setCurrentUser($user);
        $query->setBegin($weekStart);
        $query->setEnd($weekEnd);
        $query->setUser($user);

        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);
        $total = 0;
        foreach ($timesheets as $ts) {
            $total += $ts->getDuration() ?? 0;
        }

        return $total;
    }
}
