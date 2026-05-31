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

#[IsGranted('IS_AUTHENTICATED_REMEMBERED')]
final class SupervisorController extends AbstractController
{
    public function __construct(
        private readonly WeeklySubmissionRepository $repository,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly TimesheetRepository $timesheetRepository
    )
    {
    }

    #[Route('/supervisor/pending', name: 'weekly_submission_supervisor_pending', methods: ['GET'])]
    public function pending(#[CurrentUser] User $user): Response
    {
        $submissions = $this->repository->findPendingForSupervisor($user);

        return $this->render('@WeeklySubmission/supervisor/pending.html.twig', [
            'submissions' => $submissions,
        ]);
    }

    #[Route('/supervisor/history', name: 'weekly_submission_supervisor_history', methods: ['GET'])]
    public function history(#[CurrentUser] User $user): Response
    {
        $submissions = $this->repository->findHistoryForSupervisor($user);

        return $this->render('@WeeklySubmission/supervisor/history.html.twig', [
            'submissions' => $submissions,
        ]);
    }

    #[Route('/supervisor/{id}/view', name: 'weekly_submission_supervisor_view', methods: ['GET'])]
    public function view(int $id, #[CurrentUser] User $user): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null || !$this->canViewSubmission($submission, $user)) {
            throw $this->createNotFoundException('Submission not found.');
        }

        $weekStart = $submission->getWeekStart();
        $weekEnd = $weekStart->modify('+7 days');

        $query = new TimesheetQuery();
        $query->setCurrentUser($user);
        $query->setBegin($weekStart);
        $query->setEnd($weekEnd);
        $query->setUser($submission->getUser());

        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);

        return $this->render('@WeeklySubmission/supervisor/view.html.twig', [
            'submission' => $submission,
            'timesheets' => $timesheets,
            'weekStart' => $weekStart,
            'weekEnd' => $submission->getWeekEnd(),
        ]);
    }

    #[Route('/supervisor/{id}/view-modal', name: 'weekly_submission_supervisor_view_modal', methods: ['GET'])]
    public function viewModal(int $id, #[CurrentUser] User $user): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null || !$this->canViewSubmission($submission, $user)) {
            throw $this->createNotFoundException('Submission not found.');
        }

        $weekStart = $submission->getWeekStart();
        $weekEnd = $weekStart->modify('+7 days');

        $query = new TimesheetQuery();
        $query->setCurrentUser($user);
        $query->setBegin($weekStart);
        $query->setEnd($weekEnd);
        $query->setUser($submission->getUser());

        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);

        return $this->render('@WeeklySubmission/supervisor/view_modal.html.twig', [
            'submission' => $submission,
            'timesheets' => $timesheets,
            'weekStart' => $weekStart,
            'weekEnd' => $submission->getWeekEnd(),
        ]);
    }

    #[Route('/supervisor/{id}/approve', name: 'weekly_submission_supervisor_approve', methods: ['POST'])]
    public function approve(int $id, #[CurrentUser] User $user, Request $request): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null) {
            $this->addFlash('error', 'Submission not found.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if ($submission->isApproved()) {
            $this->addFlash('success', sprintf(
                'Weekly submission for %s (%s) was already approved.',
                $submission->getUser()->getDisplayName(),
                $submission->getWeekStart()->format('d/m/Y')
            ));
            return $this->redirectToRoute('weekly_submission_supervisor_history');
        }

        if (!$submission->isSubmitted()) {
            $this->addFlash('error', 'Submission not found or already processed.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if (!$this->canActOnSubmission($submission, $user)) {
            $this->addFlash('error', 'You are not authorized to approve this submission.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $submission->setStatus(WeeklySubmission::STATUS_APPROVED);
        $submission->setApprovedBy($user);
        $submission->setApprovedAt(new \DateTimeImmutable());
        $submission->setSupervisorNotes($request->request->get('notes'));

        $this->entityManager->persist($submission);
        $this->entityManager->flush();

        try {
            $this->mailer->sendApprovedNotification($submission);
        } catch (\Exception $e) {
        }

        $this->addFlash('success', sprintf(
            'Weekly submission for %s (%s) has been approved!',
            $submission->getUser()->getDisplayName(),
            $submission->getWeekStart()->format('d/m/Y')
        ));
        return $this->redirectToRoute('weekly_submission_supervisor_history');
    }

    #[Route('/supervisor/{id}/reject', name: 'weekly_submission_supervisor_reject', methods: ['POST'])]
    public function reject(int $id, #[CurrentUser] User $user, Request $request): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null) {
            $this->addFlash('error', 'Submission not found.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if ($submission->isRejected()) {
            $this->addFlash('warning', sprintf(
                'Weekly submission for %s (%s) was already rejected.',
                $submission->getUser()->getDisplayName(),
                $submission->getWeekStart()->format('d/m/Y')
            ));
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if (!$submission->isSubmitted()) {
            $this->addFlash('error', 'Submission not found or already processed.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if (!$this->canActOnSubmission($submission, $user)) {
            $this->addFlash('error', 'You are not authorized to reject this submission.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $notes = $request->request->get('notes', '');
        if (empty($notes)) {
            $this->addFlash('error', 'Please provide a reason for rejection.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $submission->setStatus(WeeklySubmission::STATUS_REJECTED);
        $submission->setApprovedBy($user);
        $submission->setApprovedAt(new \DateTimeImmutable());
        $submission->setSupervisorNotes($notes);

        $this->entityManager->persist($submission);
        $this->entityManager->flush();

        try {
            $this->mailer->sendRejectedNotification($submission);
        } catch (\Exception $e) {
        }

        $this->addFlash('warning', sprintf(
            'Weekly submission for %s (%s) has been rejected. The employee can revise and resubmit.',
            $submission->getUser()->getDisplayName(),
            $submission->getWeekStart()->format('d/m/Y')
        ));
        return $this->redirectToRoute('weekly_submission_supervisor_pending');
    }

    private function canViewSubmission(WeeklySubmission $submission, User $user): bool
    {
        if ($this->isGranted('view_other_timesheet')) {
            return true;
        }

        $userIds = $this->repository->getSupervisedUserIds($user);

        return in_array($submission->getUser()->getId(), $userIds, true);
    }

    private function canActOnSubmission(WeeklySubmission $submission, User $user): bool
    {
        $userIds = $this->repository->getSupervisedUserIds($user);

        return in_array($submission->getUser()->getId(), $userIds, true);
    }
}
