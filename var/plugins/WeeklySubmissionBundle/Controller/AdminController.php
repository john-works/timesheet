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
