<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
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

#[IsGranted('ROLE_ADMIN')]
final class AdminController extends AbstractController
{
    public function __construct(
        private readonly WeeklySubmissionRepository $repository,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
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
            $deptDirectorId = $department?->getId();

            $nextApproverType = $this->repository->getNextApproverType($staffUser);
            $nextApprover = $this->repository->getNextApprover($staffUser);

            $step1User = $staffUser->getSupervisor();
            $step2User = null;
            $workflowType = 'single';
            $teamLeadManagerIds = [];

            if ($category === 'Executive Director') {
                $step1User = null;
            } elseif ($category === 'Director') {
                $step1User = $step1User ?: $edUser;
            } elseif ($category === 'Regional Manager') {
                $workflowType = 'single';
                $step1User = $step1User ?: $department;
            } elseif ($category === 'Team Lead/Manager') {
                $workflowType = 'single';
            } elseif (in_array($category, ['Senior Officer', 'Officer & Below'])) {
                $workflowType = 'two-step';
                $teamLeadManagerIds = $this->repository->getManagerIdsForUser($staffUser);
                $supervisorId = $step1User?->getId();
                $teamLeadManagerIds = array_values(array_filter($teamLeadManagerIds, fn(int $id) => $id !== $supervisorId));

                if ($category === 'Senior Officer') {
                    if ($department && $step1User && $department->getId() === $step1User->getId()) {
                        $workflowType = 'single';
                        $step2User = null;
                    } else {
                        $step2User = $department;
                    }
                } else {
                    if (!empty($teamLeadManagerIds)) {
                        $step2User = $this->userRepository->find($teamLeadManagerIds[0]);
                    } elseif ($department) {
                        $step2User = $department;
                    }
                }
            }

            $approvalData[] = [
                'user' => $staffUser,
                'category' => $category,
                'department' => $deptName,
                'deptDirector' => $department,
                'workflowType' => $workflowType,
                'step1' => $step1User,
                'step2' => $step2User,
                'nextApproverType' => $nextApproverType,
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
        $newSupervisorId = $request->request->get('supervisor_id');

        $staffUser = $this->userRepository->find($userId);
        if ($staffUser === null) {
            $this->addFlash('error', 'User not found.');
            return $this->redirectToRoute('weekly_submission_admin_approval_rights');
        }

        if ($newSupervisorId === null || $newSupervisorId === '') {
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

        $this->entityManager->persist($staffUser);
        $this->entityManager->flush();

        $this->addFlash('success', sprintf(
            'Approval rights updated for %s. Step 1 approver: %s',
            $staffUser->getDisplayName(),
            $staffUser->getSupervisor()?->getDisplayName() ?? 'None'
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
