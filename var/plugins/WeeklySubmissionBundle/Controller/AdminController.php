<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\User;
use App\Pdf\HtmlToPdfConverter;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[IsGranted('ROLE_ADMIN')]
final class AdminController extends AbstractController
{
    public function __construct(
        private readonly WeeklySubmissionRepository $repository,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly HtmlToPdfConverter $htmlToPdfConverter,
    )
    {
    }

    #[Route('/admin/submissions', name: 'weekly_submission_admin_index', methods: ['GET'])]
    public function index(#[CurrentUser] User $user): Response
    {
        $submissions = $this->repository->findAllSubmitted();
        $allUsers = $this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']);

        return $this->render('@WeeklySubmission/admin/index.html.twig', [
            'submissions' => $submissions,
            'allUsers' => $allUsers,
        ]);
    }

    #[Route('/admin/submissions/overview', name: 'weekly_submission_admin_overview', methods: ['GET'])]
    public function overview(#[CurrentUser] User $user): Response
    {
        return $this->render('@WeeklySubmission/admin/overview.html.twig', $this->buildOverviewData());
    }

    #[Route('/admin/submissions/overview/pdf', name: 'weekly_submission_admin_overview_pdf', methods: ['GET'])]
    public function overviewPdf(#[CurrentUser] User $user, Request $request): Response
    {
        $overview = $this->buildOverviewData();
        $currentWeekKey = $overview['currentWeekStart']->format('Y-m-d');

        $dept = (string) $request->query->get('dept', '');
        $status = (string) $request->query->get('status', 'all');

        $data = [];
        foreach ($overview['data'] as $entry) {
            if ($dept !== '' && $entry['department'] !== $dept) {
                continue;
            }
            if ($status !== 'all') {
                $cell = $entry['cells'][$currentWeekKey] ?? null;
                if ($cell === null || $cell['type'] !== $status) {
                    continue;
                }
            }
            $data[] = $entry;
        }

        $weekSubmitted = array_fill_keys($overview['weekKeys'], 0);
        $weekTotal = array_fill_keys($overview['weekKeys'], 0);
        foreach ($data as $entry) {
            foreach ($overview['weekKeys'] as $key) {
                $weekTotal[$key]++;
                if (($entry['cells'][$key]['type'] ?? null) === 'submitted') {
                    $weekSubmitted[$key]++;
                }
            }
        }

        $generatedAt = new \DateTimeImmutable('now');
        $content = $this->renderView('@WeeklySubmission/admin/overview_pdf.html.twig', [
            'weeks' => $overview['weeks'],
            'weekKeys' => $overview['weekKeys'],
            'currentWeekStart' => $overview['currentWeekStart'],
            'data' => $data,
            'weekSubmitted' => $weekSubmitted,
            'weekTotal' => $weekTotal,
            'deptFilter' => $dept,
            'statusFilter' => $status,
            'generatedAt' => $generatedAt,
        ]);

        $pdf = $this->htmlToPdfConverter->convertToPdf($content, [
            'format' => 'A4-L',
            'margin_top' => 10,
            'margin_bottom' => 10,
            'margin_left' => 8,
            'margin_right' => 8,
        ]);

        $filename = 'weekly-submission-overview-' . $generatedAt->format('Y-m-d');

        $response = new Response($pdf);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Disposition', $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $filename . '.pdf'
        ));

        return $response;
    }

    /**
     * @return array{weeks: \DateTimeImmutable[], weekKeys: string[], currentWeekStart: \DateTimeImmutable, data: array<int, array{user: User, department: string, cells: array<string, array{type: string, hours: int}>}>, weekSubmitted: array<string, int>, weekTotal: array<string, int>, departments: string[]}
     */
    private function buildOverviewData(): array
    {
        $now = new \DateTimeImmutable('now');
        $currentWeekStart = $now->modify('monday this week')->setTime(0, 0, 0);

        $overviewStart = new \DateTimeImmutable('2026-07-13');
        $weeks = [];
        for ($i = 0; $i < 8; $i++) {
            $weeks[] = $overviewStart->modify("+{$i} weeks");
        }
        $from = $weeks[0];
        $to = $weeks[7]->modify('+1 week');
        $weekKeys = array_map(fn (\DateTimeImmutable $w) => $w->format('Y-m-d'), $weeks);

        $conn = $this->entityManager->getConnection();

        // Bulk-load weekly submissions in range (user_id => week_start => status)
        $submissionMap = [];
        foreach ($conn->fetchAllAssociative(
            'SELECT user_id, week_start, status FROM kimai2_weekly_submissions WHERE week_start >= :from AND week_start < :to',
            ['from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d')]
        ) as $row) {
            $submissionMap[$row['user_id']][$row['week_start']] = $row['status'];
        }

        // Bulk-load timesheet totals grouped by user + day
        $timeMap = [];
        foreach ($conn->fetchAllAssociative(
            'SELECT t.user AS user_id, DATE(t.start_time) AS day, SUM(t.duration) AS duration
             FROM kimai2_timesheet t
             WHERE t.start_time >= :from AND t.start_time < :to
             GROUP BY t.user, DATE(t.start_time)',
            ['from' => $from->format('Y-m-d 00:00:00'), 'to' => $to->format('Y-m-d 00:00:00')]
        ) as $row) {
            $day = new \DateTimeImmutable($row['day']);
            $dow = (int) $day->format('N');
            $weekKey = $day->modify('-' . ($dow - 1) . ' days')->format('Y-m-d');
            if (in_array($weekKey, $weekKeys, true)) {
                $timeMap[$row['user_id']][$weekKey] = ($timeMap[$row['user_id']][$weekKey] ?? 0) + (int) $row['duration'];
            }
        }

        // Department name per user (first team department)
        $deptMap = [];
        foreach ($conn->fetchAllAssociative(
            'SELECT ut.user_id, d.name FROM kimai2_users_teams ut
             JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
             JOIN kimai2_departments d ON d.id = dt.department_id
             ORDER BY ut.user_id'
        ) as $row) {
            if (!isset($deptMap[$row['user_id']])) {
                $deptMap[$row['user_id']] = $row['name'];
            }
        }

        $servicePatterns = [
            '/^ad_/', '/^sccm/', '/^itadmin/', '/^itop_/', '/^itoptest/', '/^edmsadmin/',
            '/^solomonadmin/', '/^appserver/', '/^mailbackup/', '/^mail$/', '/^vpn$/',
            '/^share$/', '/^quarantine$/', '/^kaspersky/', '/^mruser$/', '/^knowbe4/',
            '/^svc-/', '/^zabbix/',
        ];
        $submittedStatuses = [
            WeeklySubmission::STATUS_SUBMITTED,
            WeeklySubmission::STATUS_SUPERVISOR_APPROVED,
            WeeklySubmission::STATUS_MANAGER_APPROVED,
            WeeklySubmission::STATUS_HR_APPROVED,
            WeeklySubmission::STATUS_APPROVED,
        ];

        $data = [];
        $weekSubmitted = array_fill_keys($weekKeys, 0);
        $weekTotal = array_fill_keys($weekKeys, 0);

        foreach ($this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']) as $staffUser) {
            if ($staffUser->isSystemAccount()) {
                continue;
            }
            $username = $staffUser->getUserIdentifier();
            foreach ($servicePatterns as $pattern) {
                if (preg_match($pattern, $username)) {
                    continue 2;
                }
            }

            $uid = (int) $staffUser->getId();
            $cells = [];
            foreach ($weekKeys as $key) {
                $status = $submissionMap[$uid][$key] ?? null;
                $hours = $timeMap[$uid][$key] ?? 0;

                if ($status !== null && in_array($status, $submittedStatuses, true)) {
                    $cells[$key] = ['type' => 'submitted', 'hours' => $hours];
                    $weekSubmitted[$key]++;
                } elseif ($status === WeeklySubmission::STATUS_REJECTED) {
                    $cells[$key] = ['type' => 'rejected', 'hours' => $hours];
                } elseif ($hours > 0) {
                    $cells[$key] = ['type' => 'missing', 'hours' => $hours];
                } else {
                    $cells[$key] = ['type' => 'empty', 'hours' => 0];
                }
                $weekTotal[$key]++;
            }

            $data[] = [
                'user' => $staffUser,
                'department' => $deptMap[$uid] ?? 'No Department',
                'cells' => $cells,
            ];
        }

        usort($data, function (array $a, array $b) {
            $cmp = strcmp($a['department'], $b['department']);
            if ($cmp !== 0) {
                return $cmp;
            }
            return strcmp($a['user']->getDisplayName(), $b['user']->getDisplayName());
        });

        $departments = array_values(array_unique(array_map(fn (array $e) => $e['department'], $data)));
        sort($departments);

        return [
            'weeks' => $weeks,
            'weekKeys' => $weekKeys,
            'currentWeekStart' => $currentWeekStart,
            'data' => $data,
            'weekSubmitted' => $weekSubmitted,
            'weekTotal' => $weekTotal,
            'departments' => $departments,
        ];
    }

    #[Route('/admin/submissions/{id}/reassign', name: 'weekly_submission_admin_reassign', methods: ['POST'])]
    public function reassign(int $id, #[CurrentUser] User $user, Request $request): Response
    {
        $submission = $this->repository->find($id);

        if ($submission === null) {
            $this->addFlash('error', 'Submission not found.');
            return $this->redirectToRoute('weekly_submission_admin_index');
        }

        if (!$submission->isSubmitted()) {
            $this->addFlash('error', 'Only submitted submissions can be reassigned.');
            return $this->redirectToRoute('weekly_submission_admin_index');
        }

        $newSupervisorId = $request->request->get('new_supervisor_id');
        $newSupervisor = $this->userRepository->find($newSupervisorId);

        if ($newSupervisor === null || !$newSupervisor->isEnabled()) {
            $this->addFlash('error', 'Invalid supervisor selected.');
            return $this->redirectToRoute('weekly_submission_admin_index');
        }

        $staffUser = $submission->getUser();
        $oldSupervisor = $staffUser->getSupervisor();
        $previousReassigned = $submission->getReassignedTo();

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

        return $this->redirectToRoute('weekly_submission_admin_index');
    }

    #[Route('/admin/approval-rights', name: 'weekly_submission_admin_approval_rights', methods: ['GET'])]
    public function approvalRights(#[CurrentUser] User $user): Response
    {
        $allUsers = $this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']);
        $edUser = $this->repository->getEdUser();

        $approvalData = [];
        foreach ($allUsers as $staffUser) {
            $category = $this->getUserCategory($staffUser);
            $department = $this->repository->getDirectorForUser($staffUser);
            $deptName = $this->getUserDepartmentName($staffUser);

            $step1User = $staffUser->getSupervisor();
            $step2User = $staffUser->getStep2Approver();
            $workflowType = $staffUser->getWorkflowType() ?? ($step2User !== null ? 'two-step' : 'single');

            if ($category === 'Executive Director') {
                $step1User = null;
            } elseif ($category === 'Director' && $step1User === null) {
                $step1User = $edUser;
            }

            $approvalData[] = [
                'user' => $staffUser,
                'category' => $category,
                'department' => $deptName,
                'deptDirector' => $department,
                'workflowType' => $workflowType,
                'step1' => $step1User,
                'step2' => $step2User,
            ];
        }

        $categoryOrder = ['Executive Director' => 0, 'Director' => 1, 'Regional Manager' => 2, 'Regional Staff' => 3, 'Team Lead/Manager' => 4, 'Senior Officer' => 5, 'Officer & Below' => 6];
        usort($approvalData, function ($a, $b) use ($categoryOrder) {
            $cmp = strcmp($a['department'], $b['department']);
            if ($cmp !== 0) return $cmp;
            $orderA = $categoryOrder[$a['category']] ?? 99;
            $orderB = $categoryOrder[$b['category']] ?? 99;
            if ($orderA !== $orderB) return $orderA - $orderB;
            return strcmp($a['user']->getDisplayName(), $b['user']->getDisplayName());
        });

        $allEnabledUsers = $this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']);

        return $this->render('@WeeklySubmission/admin/approval_rights.html.twig', [
            'approvalData' => $approvalData,
            'allUsers' => $allEnabledUsers,
        ]);
    }

    #[Route('/admin/approval-rights/update', name: 'weekly_submission_admin_approval_rights_update', methods: ['POST'])]
    public function updateApprovalRights(#[CurrentUser] User $user, Request $request): Response
    {
        $userId = (int) $request->request->get('user_id');
        $newSupervisorId = $request->request->has('supervisor_id') ? $request->request->get('supervisor_id') : null;
        $newStep2Id = $request->request->has('step2_approver_id') ? $request->request->get('step2_approver_id') : null;
        $newWorkflowType = $request->request->has('workflow_type') ? $request->request->get('workflow_type') : null;

        $staffUser = $this->userRepository->find($userId);
        if ($staffUser === null) {
            $this->addFlash('error', 'User not found.');
            return $this->redirectToRoute('weekly_submission_admin_approval_rights');
        }

        if ($newSupervisorId !== null) {
            if ($newSupervisorId === '') {
                $staffUser->setSupervisor(null);
            } else {
                $newSupervisor = $this->userRepository->find((int) $newSupervisorId);
                if ($newSupervisor !== null && $newSupervisor->isEnabled()) {
                    $staffUser->setSupervisor($newSupervisor);
                } else {
                    $this->addFlash('error', 'Invalid supervisor selected.');
                    return $this->redirectToRoute('weekly_submission_admin_approval_rights');
                }
            }
        }

        if ($newStep2Id !== null) {
            if ($newStep2Id === '' || (int) $newStep2Id === $staffUser->getId()) {
                $staffUser->setStep2Approver(null);
            } else {
                $newStep2 = $this->userRepository->find((int) $newStep2Id);
                if ($newStep2 !== null && $newStep2->isEnabled()) {
                    $staffUser->setStep2Approver($newStep2);
                } else {
                    $this->addFlash('error', 'Invalid Step 2 approver selected.');
                    return $this->redirectToRoute('weekly_submission_admin_approval_rights');
                }
            }
        }

        if ($newWorkflowType !== null) {
            if ($newWorkflowType === '' || ($newWorkflowType !== 'single' && $newWorkflowType !== 'two-step')) {
                $staffUser->setWorkflowType(null);
            } else {
                $staffUser->setWorkflowType($newWorkflowType);
            }
        }

        if ($newSupervisorId !== null || $newStep2Id !== null) {
            $step1 = $staffUser->getSupervisor();
            $step2 = $staffUser->getStep2Approver();
            if ($step1 !== null && $step2 !== null && $step1->getId() === $step2->getId()) {
                $this->addFlash('error', 'Step 1 and Step 2 approvers must be different users.');
                return $this->redirectToRoute('weekly_submission_admin_approval_rights');
            }
        }

        $this->entityManager->persist($staffUser);
        $this->entityManager->flush();

        $this->addFlash('success', sprintf(
            'Approval rights updated for %s. Workflow: %s, Step 1 approver: %s, Step 2 approver: %s',
            $staffUser->getDisplayName(),
            $staffUser->hasTwoStepWorkflow() ? '2-Step' : 'Single-level',
            $staffUser->getSupervisor()?->getDisplayName() ?? 'None',
            $staffUser->getStep2Approver()?->getDisplayName() ?? 'None'
        ));

        return $this->redirectToRoute('weekly_submission_admin_approval_rights');
    }

    private function getUserCategory(User $user): string
    {
        $conn = $this->entityManager->getConnection();

        if ($this->repository->isEdUser($user)) {
            return 'Executive Director';
        }

        $isDirector = (int) $conn->fetchOne(
            'SELECT COUNT(*) FROM kimai2_departments WHERE director_id = :id',
            ['id' => $user->getId()]
        ) > 0;
        if ($isDirector) {
            return 'Director';
        }

        $isRegional = $this->repository->isInRegionalDepartment($user);
        if ($isRegional) {
            if ($this->repository->isRegionalManager($user)) {
                return 'Regional Manager';
            }
            return 'Regional Staff';
        }

        if ($this->repository->isTeamLead($user)) {
            return 'Team Lead/Manager';
        }

        if ($this->repository->isSeniorOfficer($user)) {
            return 'Senior Officer';
        }

        return 'Officer & Below';
    }

    private function getUserDepartmentName(User $user): string
    {
        $conn = $this->entityManager->getConnection();

        $sql = "SELECT d.name FROM kimai2_departments d
                JOIN kimai2_departments_teams dt ON dt.department_id = d.id
                JOIN kimai2_users_teams ut ON ut.team_id = dt.team_id
                WHERE ut.user_id = :user_id
                LIMIT 1";

        $name = $conn->fetchOne($sql, ['user_id' => $user->getId()]);

        return $name ?: 'No Department';
    }

    public function canViewSubmission(WeeklySubmission $submission, User $user): bool
    {
        if ($this->isGranted('view_other_timesheet')) {
            return true;
        }

        if ($submission->getReassignedTo() !== null) {
            return $submission->getReassignedTo()->getId() === $user->getId();
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
}
