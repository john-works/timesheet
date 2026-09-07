<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\TimesheetRepository;
use App\Repository\UserRepository;
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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[IsGranted('IS_AUTHENTICATED_REMEMBERED')]
final class SupervisorController extends AbstractController
{
    public function __construct(
        private readonly WeeklySubmissionRepository $repository,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly TimesheetRepository $timesheetRepository,
        private readonly UserRepository $userRepository
    )
    {
    }

    #[Route('/supervisor/bell', name: 'weekly_submission_supervisor_bell', methods: ['GET'])]
    public function notificationBell(#[CurrentUser] User $user): Response
    {
        $result = $this->repository->countPendingNotifications($user);
        return $this->render('@WeeklySubmission/supervisor/notification_bell.html.twig', $result);
    }

    #[Route('/supervisor/pending', name: 'weekly_submission_supervisor_pending', methods: ['GET'])]
    public function pending(#[CurrentUser] User $user): Response
    {
        $submissions = $this->repository->findPendingForSupervisor($user);
        $actableIds = [];
        foreach ($submissions as $submission) {
            if ($this->canActOnSubmission($submission, $user)) {
                $actableIds[] = $submission->getId();
            }
            $submission->setCurrentApprover($submission->getReassignedTo() ?? $submission->getUser()->getSupervisor());
        }
        $groupedSubmissions = $this->groupSubmissionsByUser($submissions, $actableIds);

        $managerSubmissions = $this->repository->findSupervisorApprovedForManager($user);
        $managerActableIds = [];
        foreach ($managerSubmissions as $submission) {
            if ($this->canActAsManager($submission, $user)) {
                $managerActableIds[] = $submission->getId();
            }
            $submission->setCurrentApprover($submission->getReassignedTo() ?? $this->repository->getNextApprover($submission->getUser()));
        }
        $groupedManagerSubmissions = $this->groupSubmissionsByUser($managerSubmissions, $managerActableIds);

        $departmentUsersMap = [];
        $allSubmissions = array_merge($submissions, $managerSubmissions);
        foreach ($allSubmissions as $submission) {
            $staffUser = $submission->getUser();
            $deptUserIds = $this->repository->getDepartmentUserIds($staffUser);
            if (!empty($deptUserIds)) {
                $departmentUsersMap[$submission->getId()] = $this->userRepository->findBy(['id' => $deptUserIds], ['username' => 'ASC']);
            } else {
                $departmentUsersMap[$submission->getId()] = [];
            }
        }

        return $this->render('@WeeklySubmission/supervisor/pending.html.twig', [
            'groupedSubmissions' => $groupedSubmissions,
            'groupedManagerSubmissions' => $groupedManagerSubmissions,
            'departmentUsersMap' => $departmentUsersMap,
            'isAdmin' => $this->isGranted('ROLE_ADMIN'),
        ]);
    }

    #[Route('/supervisor/history', name: 'weekly_submission_supervisor_history', methods: ['GET'])]
    public function history(#[CurrentUser] User $user): Response
    {
        $submissions = $this->repository->findHistoryForSupervisor($user);

        foreach ($submissions as $submission) {
            if ($submission->isSubmitted()) {
                $submission->setCurrentApprover($submission->getUser()->getSupervisor());
            } elseif ($submission->isSupervisorApproved()) {
                $submission->setCurrentApprover($this->repository->getNextApprover($submission->getUser()));
            } elseif ($submission->isApproved()) {
                $submission->setCurrentApprover($submission->getUser());
            } elseif ($submission->isRejected()) {
                $submission->setCurrentApprover($submission->getUser());
            }
        }

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

        $query = new TimesheetQuery();
        $query->setBegin($weekStart);
        $query->setEnd($weekStart->modify('+4 days'));
        $query->setUser($submission->getUser());

        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);

        $weekdayTotal = array_reduce($timesheets, fn($carry, $ts) => $carry + ($ts->getDuration() ?? 0), 0);

        return $this->render('@WeeklySubmission/supervisor/view.html.twig', [
            'submission' => $submission,
            'timesheets' => $timesheets,
            'weekStart' => $weekStart,
            'weekEnd' => $weekStart->modify('+4 days'),
            'totalDuration' => $weekdayTotal,
            'canAct' => $this->canActOnSubmission($submission, $user),
            'canActManager' => $this->canActAsManager($submission, $user),
        ]);
    }

    #[Route('/supervisor/{id}/view-modal', name: 'weekly_submission_supervisor_view_modal', methods: ['GET'])]
    public function viewModal(int $id, #[CurrentUser] User $user, Request $request): Response
    {
        $idsParam = $request->query->get('ids');
        $ids = [];
        if ($idsParam) {
            $ids = array_map('intval', is_array($idsParam) ? $idsParam : explode(',', $idsParam));
        }
        if (empty($ids)) {
            $ids = [$id];
        }

        $allTimesheets = [];
        $firstSubmission = null;
        $totalDuration = 0;

        foreach ($ids as $sid) {
            $submission = $this->repository->find($sid);
            if ($submission === null || !$this->canViewSubmission($submission, $user)) {
                continue;
            }
            if ($firstSubmission === null) {
                $firstSubmission = $submission;
            }

            $weekStart = $submission->getWeekStart();
            $query = new TimesheetQuery();
            $query->setBegin($weekStart);
            $query->setEnd($weekStart->modify('+4 days'));
            $query->setUser($submission->getUser());

            $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);
            $weekDuration = array_reduce($timesheets, fn($carry, $ts) => $carry + ($ts->getDuration() ?? 0), 0);

            $allTimesheets[] = [
                'submission' => $submission,
                'weekStart' => $weekStart,
                'weekEnd' => $weekStart->modify('+4 days'),
                'timesheets' => $timesheets,
                'totalDuration' => $weekDuration,
            ];
            $totalDuration += $weekDuration;
        }

        if ($firstSubmission === null) {
            throw $this->createNotFoundException('Submission not found.');
        }

        return $this->render('@WeeklySubmission/supervisor/view_modal.html.twig', [
            'submission' => $firstSubmission,
            'weekData' => $allTimesheets,
            'totalDuration' => $totalDuration,
            'canAct' => $this->canActOnSubmission($firstSubmission, $user),
            'canActManager' => $this->canActAsManager($firstSubmission, $user),
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

        if (!$submission->isSubmitted() && !$submission->isSupervisorApproved()) {
            $this->addFlash('error', 'Submission not found or already processed.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        // Check if this is a direct supervisor approving (first stage) or manager/director (final stage)
        $isSupervisor = $this->canActOnSubmission($submission, $user);
        $isManager = $this->canActAsManager($submission, $user);

        if (!$isSupervisor && !$isManager) {
            $this->addFlash('error', 'You are not authorized to approve this submission.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        // If user is a direct supervisor (first stage approval)
        if ($isSupervisor && $submission->isSubmitted()) {
            $nextApprover = $this->repository->getNextApprover($submission->getUser());

            $submission->setApprovedBy($user);
            $submission->setApprovedAt(new \DateTimeImmutable());
            $submission->setSupervisorNotes($request->request->get('notes'));
            $submission->setReassignedTo(null);
            $this->restoreOriginalSupervisor($submission);

            if ($nextApprover === null) {
                // No next approver - single-level workflow
                $submission->setStatus(WeeklySubmission::STATUS_APPROVED);

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
            } else {
                // Forward to next approver (multi-level workflow)
                $submission->setStatus(WeeklySubmission::STATUS_SUPERVISOR_APPROVED);

                $this->entityManager->persist($submission);
                $this->entityManager->flush();

                try {
                    $this->mailer->sendSupervisorApprovedNotification($submission, $nextApprover);
                } catch (\Exception $e) {
                }

                $this->addFlash('success', sprintf(
                    'Weekly submission for %s (%s) has been approved by supervisor and forwarded to the next approver.',
                    $submission->getUser()->getDisplayName(),
                    $submission->getWeekStart()->format('d/m/Y')
                ));
            }

            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        // If user is a manager/director (second stage approval)
        if ($isManager && $submission->isSupervisorApproved()) {
            $submission->setStatus(WeeklySubmission::STATUS_APPROVED);
            $submission->setManagerApprovedBy($user);
            $submission->setManagerApprovedAt(new \DateTimeImmutable());
            $submission->setManagerNotes($request->request->get('notes'));
            $submission->setReassignedTo(null);
            $this->restoreOriginalSupervisor($submission);

            $this->entityManager->persist($submission);
            $this->entityManager->flush();

            try {
                $this->mailer->sendFinalApprovedNotification($submission, $user);
            } catch (\Exception $e) {
            }

            $this->addFlash('success', sprintf(
                'Weekly submission for %s (%s) has been fully approved!',
                $submission->getUser()->getDisplayName(),
                $submission->getWeekStart()->format('d/m/Y')
            ));
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $this->addFlash('error', 'Cannot process approval at this stage.');
        return $this->redirectToRoute('weekly_submission_supervisor_pending');
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

        if (!$submission->isSubmitted() && !$submission->isSupervisorApproved()) {
            $this->addFlash('error', 'Submission not found or already processed.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $isSupervisor = $this->canActOnSubmission($submission, $user);
        $isManager = $this->canActAsManager($submission, $user);

        if (!$isSupervisor && !$isManager) {
            $this->addFlash('error', 'You are not authorized to reject this submission.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $notes = $request->request->get('notes', '');
        if (empty($notes)) {
            $this->addFlash('error', 'Please provide a reason for rejection.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $submission->setStatus(WeeklySubmission::STATUS_REJECTED);

        if ($isSupervisor) {
            $submission->setApprovedBy($user);
            $submission->setApprovedAt(new \DateTimeImmutable());
            $submission->setSupervisorNotes($notes);
        } else {
            $submission->setManagerApprovedBy($user);
            $submission->setManagerApprovedAt(new \DateTimeImmutable());
            $submission->setManagerNotes($notes);
        }

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

    #[Route('/supervisor/{id}/reassign', name: 'weekly_submission_supervisor_reassign', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function reassign(int $id, #[CurrentUser] User $user, Request $request): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null) {
            $this->addFlash('error', 'Submission not found.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if (!$submission->isSubmitted() && !$submission->isSupervisorApproved()) {
            $this->addFlash('error', 'Submission cannot be reassigned in its current state.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $newSupervisorId = $request->request->get('new_supervisor_id');
        $newSupervisor = $this->userRepository->find($newSupervisorId);

        if ($newSupervisor === null || !$newSupervisor->isEnabled()) {
            $this->addFlash('error', 'Invalid supervisor selected.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $staffUser = $submission->getUser();
        $oldSupervisor = $staffUser->getSupervisor();
        $previousReassigned = $submission->getReassignedTo();

        $deptUserIds = $this->repository->getDepartmentUserIds($staffUser);
        if (!in_array((int) $newSupervisorId, $deptUserIds, true)) {
            $this->addFlash('error', 'Selected user is not in the same department as the staff member.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        if ($submission->getOriginalSupervisor() === null) {
            $submission->setOriginalSupervisor($oldSupervisor);
        }

        $submission->setReassignedTo($newSupervisor);

        $this->entityManager->persist($submission);
        $this->entityManager->flush();

        $this->addFlash('success', sprintf(
            'Submission for %s (%s) reassigned from %s to %s.',
            $staffUser->getDisplayName(),
            $submission->getWeekStart()->format('d/m/Y'),
            $previousReassigned?->getDisplayName() ?? $oldSupervisor?->getDisplayName() ?? 'none',
            $newSupervisor->getDisplayName()
        ));

        return $this->redirectToRoute('weekly_submission_supervisor_pending');
    }

    #[Route('/supervisor/weekly-report', name: 'weekly_submission_supervisor_weekly_report', methods: ['GET'])]
    public function weeklyReport(#[CurrentUser] User $user, Request $request): Response
    {
        $dateStr = $request->query->get('date', (new \DateTimeImmutable())->format('Y-m-d'));
        $selectedDate = new \DateTimeImmutable($dateStr);
        $dayOfWeek = (int) $selectedDate->format('N');
        $weekStart = $selectedDate->modify('-' . ($dayOfWeek - 1) . ' days')->setTime(0, 0, 0);
        $weekEnd = $weekStart->modify('+7 days');

        $userIds = $this->repository->getViewableUserIds($user);
        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $user->getId()));

        $timesheets = [];
        if (!empty($userIds)) {
            $qb = $this->entityManager->createQueryBuilder();
            $timesheets = $qb->select('t', 'u')
                ->from(Timesheet::class, 't')
                ->join('t.user', 'u')
                ->where($qb->expr()->in('t.user', ':userIds'))
                ->andWhere('t.begin >= :weekStart')
                ->andWhere('t.begin < :weekEnd')
                ->setParameter('userIds', $userIds)
                ->setParameter('weekStart', $weekStart)
                ->setParameter('weekEnd', $weekEnd)
                ->orderBy('u.displayName', 'ASC')
                ->addOrderBy('t.begin', 'ASC')
                ->getQuery()
                ->getResult();
        }

        $data = [];
        foreach ($timesheets as $ts) {
            $uid = $ts->getUser()->getId();
            $day = (int) $ts->getBegin()->format('N');
            if ($day > 5) {
                continue;
            }
            if (!isset($data[$uid])) {
                $data[$uid] = [
                    'user' => $ts->getUser(),
                    'days' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
                    'total' => 0,
                ];
            }
            $dur = $ts->getDuration() ?? 0;
            $data[$uid]['days'][$day] += $dur;
            $data[$uid]['total'] += $dur;
        }

        $columnTotals = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        $grandTotal = 0;
        foreach ($data as $entry) {
            foreach ($entry['days'] as $day => $dur) {
                $columnTotals[$day] += $dur;
            }
            $grandTotal += $entry['total'];
        }

        return $this->render('@WeeklySubmission/supervisor/weekly_report.html.twig', [
            'data' => $data,
            'columnTotals' => $columnTotals,
            'grandTotal' => $grandTotal,
            'weekStart' => $weekStart,
            'weekEnd' => $weekStart->modify('+4 days'),
            'selectedDate' => $selectedDate,
        ]);
    }

    #[Route('/supervisor/monthly-report', name: 'weekly_submission_supervisor_monthly_report', methods: ['GET'])]
    public function monthlyReport(#[CurrentUser] User $user, Request $request): Response
    {
        $monthStr = $request->query->get('month', (new \DateTimeImmutable())->format('Y-m'));
        $monthStart = new \DateTimeImmutable($monthStr . '-01 00:00:00');
        $monthEnd = $monthStart->modify('+1 month');

        $userIds = $this->repository->getViewableUserIds($user);
        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $user->getId()));

        $timesheets = [];
        if (!empty($userIds)) {
            $qb = $this->entityManager->createQueryBuilder();
            $timesheets = $qb->select('t', 'u')
                ->from(Timesheet::class, 't')
                ->join('t.user', 'u')
                ->where($qb->expr()->in('t.user', ':userIds'))
                ->andWhere('t.begin >= :monthStart')
                ->andWhere('t.begin < :monthEnd')
                ->setParameter('userIds', $userIds)
                ->setParameter('monthStart', $monthStart)
                ->setParameter('monthEnd', $monthEnd)
                ->orderBy('u.displayName', 'ASC')
                ->addOrderBy('t.begin', 'ASC')
                ->getQuery()
                ->getResult();
        }

        $data = [];
        foreach ($timesheets as $ts) {
            $uid = $ts->getUser()->getId();
            $dayOfWeek = (int) $ts->getBegin()->format('N');
            if ($dayOfWeek > 5) {
                continue;
            }
            $isoWeek = (int) $ts->getBegin()->format('W');
            if (!isset($data[$uid])) {
                $data[$uid] = [
                    'user' => $ts->getUser(),
                    'weeks' => [],
                    'total' => 0,
                ];
            }
            if (!isset($data[$uid]['weeks'][$isoWeek])) {
                $data[$uid]['weeks'][$isoWeek] = 0;
            }
            $dur = $ts->getDuration() ?? 0;
            $data[$uid]['weeks'][$isoWeek] += $dur;
            $data[$uid]['total'] += $dur;
        }

        $allWeeks = [];
        foreach ($data as $entry) {
            $allWeeks = array_unique(array_merge($allWeeks, array_keys($entry['weeks'])));
        }
        sort($allWeeks);

        $columnTotals = [];
        $grandTotal = 0;
        foreach ($data as $entry) {
            foreach ($allWeeks as $week) {
                $dur = $entry['weeks'][$week] ?? 0;
                $columnTotals[$week] = ($columnTotals[$week] ?? 0) + $dur;
            }
            $grandTotal += $entry['total'];
        }

        return $this->render('@WeeklySubmission/supervisor/monthly_report.html.twig', [
            'data' => $data,
            'allWeeks' => $allWeeks,
            'columnTotals' => $columnTotals,
            'grandTotal' => $grandTotal,
            'monthStart' => $monthStart,
            'monthEnd' => $monthEnd,
            'selectedMonth' => $monthStr,
        ]);
    }

    private function canViewSubmission(WeeklySubmission $submission, User $user): bool
    {
        // Before the supervisor approves, only the direct supervisor (or the
        // user the submission was reassigned to) may view it. The configured
        // Step 2 approver may also view the supervisee's timesheet, so all
        // approvers in the approval flow can see it before acting.
        if ($submission->isSubmitted()) {
            if ($this->isGranted('ROLE_ADMIN')) {
                return true;
            }

            // ED can view all department directors' submissions
            if ($this->repository->isEdUser($user) && $submission->getUser()->isDirector()) {
                return true;
            }

            if ($submission->getReassignedTo() !== null) {
                return $submission->getReassignedTo()->getId() === $user->getId();
            }

            $supervisor = $submission->getUser()->getSupervisor();
            if ($supervisor !== null && $supervisor->getId() === $user->getId()) {
                return true;
            }

            $step2 = $submission->getUser()->getStep2Approver();

            return $step2 !== null && $step2->getId() === $user->getId();
        }

        if ($this->isGranted('view_other_timesheet')) {
            return true;
        }

        if ($submission->getReassignedTo() !== null) {
            return $submission->getReassignedTo()->getId() === $user->getId();
        }

        // ED can view all department directors' submissions
        if ($this->repository->isEdUser($user) && $submission->getUser()->isDirector()) {
            return true;
        }

        $userIds = $this->repository->getViewableUserIds($user);

        if (in_array($submission->getUser()->getId(), $userIds, true)) {
            return true;
        }

        $managedIds = $this->repository->getManagedUserIds($user);
        if (in_array($submission->getUser()->getId(), $managedIds, true)) {
            return true;
        }

        $directorManagedIds = $this->repository->getDirectorManagedUserIds($user);

        return in_array($submission->getUser()->getId(), $directorManagedIds, true);
    }

    private function canActOnSubmission(WeeklySubmission $submission, User $user): bool
    {
        // Supervisor can only act on submissions in 'submitted' status (first stage)
        if (!$submission->isSubmitted()) {
            return false;
        }

        if ($submission->getReassignedTo() !== null) {
            return $submission->getReassignedTo()->getId() === $user->getId();
        }

        // Step 1 approver is configured on the admin "User Approval Rights" screen
        $step1 = $submission->getUser()->getSupervisor();

        return $step1 !== null && $step1->getId() === $user->getId();
    }

    private function canActAsManager(WeeklySubmission $submission, User $user): bool
    {
        // Manager/Director can only act on submissions in 'supervisor_approved' status (second stage)
        if (!$submission->isSupervisorApproved()) {
            return false;
        }

        if ($submission->getReassignedTo() !== null) {
            return $submission->getReassignedTo()->getId() === $user->getId();
        }

        // Only two-step workflows route through a Step 2 approver
        if (!$submission->getUser()->hasTwoStepWorkflow()) {
            return false;
        }

        // Step 2 approver is configured on the admin "User Approval Rights" screen
        $step2 = $submission->getUser()->getStep2Approver();
        if ($step2 === null) {
            return false;
        }

        // A user must never approve both Step 1 and Step 2
        $step1 = $submission->getUser()->getSupervisor();
        if ($step1 !== null && $step1->getId() === $step2->getId()) {
            return false;
        }

        return $step2->getId() === $user->getId();
    }

    private function restoreOriginalSupervisor(WeeklySubmission $submission): void
    {
        $originalSupervisor = $submission->getOriginalSupervisor();
        if ($originalSupervisor === null) {
            return;
        }

        $staffUser = $submission->getUser();
        $staffUser->setSupervisor($originalSupervisor);
        $submission->setOriginalSupervisor(null);

        $this->entityManager->persist($staffUser);
    }

    private function groupSubmissionsByUser(array $submissions, array $actableIds): array
    {
        $grouped = [];
        foreach ($submissions as $submission) {
            $userId = $submission->getUser()->getId();
            if (!isset($grouped[$userId])) {
                $grouped[$userId] = [
                    'user' => $submission->getUser(),
                    'submissions' => [],
                    'totalDuration' => 0,
                    'submittedAt' => $submission->getSubmittedAt(),
                    'allActable' => true,
                    'reassignedTo' => $submission->getReassignedTo(),
                    'currentApprover' => $submission->getCurrentApprover(),
                ];
            }
            $grouped[$userId]['submissions'][] = $submission;
            $grouped[$userId]['totalDuration'] += $submission->getTotalDuration();
            if ($submission->getSubmittedAt() && (!$grouped[$userId]['submittedAt'] || $submission->getSubmittedAt() < $grouped[$userId]['submittedAt'])) {
                $grouped[$userId]['submittedAt'] = $submission->getSubmittedAt();
            }
            if (!in_array($submission->getId(), $actableIds, true)) {
                $grouped[$userId]['allActable'] = false;
            }
        }

        usort($grouped, fn($a, $b) => ($b['submittedAt'] ?? new \DateTimeImmutable()) <=> ($a['submittedAt'] ?? new \DateTimeImmutable()));

        return $grouped;
    }

    #[Route('/supervisor/batch-approve', name: 'weekly_submission_supervisor_batch_approve', methods: ['POST'])]
    public function batchApprove(#[CurrentUser] User $user, Request $request): Response
    {
        $ids = $request->request->all('ids');
        if (empty($ids) || !is_array($ids)) {
            $this->addFlash('error', 'No submissions selected.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $notes = $request->request->get('notes', '');
        $approved = 0;
        $errors = [];

        foreach ($ids as $id) {
            $id = (int) $id;
            $submission = $this->repository->find($id);
            if ($submission === null || $submission->isApproved()) {
                continue;
            }
            if (!$submission->isSubmitted() && !$submission->isSupervisorApproved()) {
                continue;
            }

            $isSupervisor = $this->canActOnSubmission($submission, $user);
            $isManager = $this->canActAsManager($submission, $user);

            if ($isSupervisor && $submission->isSubmitted()) {
                $nextApprover = $this->repository->getNextApprover($submission->getUser());
                $submission->setStatus($nextApprover === null ? WeeklySubmission::STATUS_APPROVED : WeeklySubmission::STATUS_SUPERVISOR_APPROVED);
                $submission->setApprovedBy($user);
                $submission->setApprovedAt(new \DateTimeImmutable());
                $submission->setSupervisorNotes($notes);
                $submission->setReassignedTo(null);
                $this->restoreOriginalSupervisor($submission);
                $this->entityManager->persist($submission);
                $approved++;
            } elseif ($isManager && $submission->isSupervisorApproved()) {
                $submission->setStatus(WeeklySubmission::STATUS_APPROVED);
                $submission->setManagerApprovedBy($user);
                $submission->setManagerApprovedAt(new \DateTimeImmutable());
                $submission->setManagerNotes($notes);
                $submission->setReassignedTo(null);
                $this->restoreOriginalSupervisor($submission);
                $this->entityManager->persist($submission);
                $approved++;
            } else {
                $errors[] = sprintf('Week %s: not authorized', $submission->getWeekStart()->format('d/m/Y'));
            }
        }

        if ($approved > 0) {
            $this->entityManager->flush();
            $this->addFlash('success', sprintf('%d week(s) approved successfully.', $approved));
        }

        foreach ($errors as $error) {
            $this->addFlash('warning', $error);
        }

        return $this->redirectToRoute('weekly_submission_supervisor_pending');
    }

    #[Route('/supervisor/batch-reject', name: 'weekly_submission_supervisor_batch_reject', methods: ['POST'])]
    public function batchReject(#[CurrentUser] User $user, Request $request): Response
    {
        $ids = $request->request->all('ids');
        if (empty($ids) || !is_array($ids)) {
            $this->addFlash('error', 'No submissions selected.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $notes = $request->request->get('notes', '');
        if (empty($notes)) {
            $this->addFlash('error', 'Please provide a reason for rejection.');
            return $this->redirectToRoute('weekly_submission_supervisor_pending');
        }

        $rejected = 0;

        foreach ($ids as $id) {
            $id = (int) $id;
            $submission = $this->repository->find($id);
            if ($submission === null || $submission->isRejected()) {
                continue;
            }
            if (!$submission->isSubmitted() && !$submission->isSupervisorApproved()) {
                continue;
            }

            $isSupervisor = $this->canActOnSubmission($submission, $user);
            $isManager = $this->canActAsManager($submission, $user);

            if (!$isSupervisor && !$isManager) {
                continue;
            }

            $submission->setStatus(WeeklySubmission::STATUS_REJECTED);
            if ($isSupervisor) {
                $submission->setApprovedBy($user);
                $submission->setApprovedAt(new \DateTimeImmutable());
                $submission->setSupervisorNotes($notes);
            } else {
                $submission->setManagerApprovedBy($user);
                $submission->setManagerApprovedAt(new \DateTimeImmutable());
                $submission->setManagerNotes($notes);
            }
            $this->entityManager->persist($submission);
            $rejected++;
        }

        if ($rejected > 0) {
            $this->entityManager->flush();
            $this->addFlash('warning', sprintf('%d week(s) rejected.', $rejected));
        }

        return $this->redirectToRoute('weekly_submission_supervisor_pending');
    }
}
