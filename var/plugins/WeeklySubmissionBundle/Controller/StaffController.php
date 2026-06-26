<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\Activity;
use App\Entity\Project;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\TimesheetRepository;
use App\Repository\Query\TimesheetQuery;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use KimaiPlugin\WeeklySubmissionBundle\Repository\PublicHolidayRepository;
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
        private readonly EntityManagerInterface $entityManager,
        private readonly PublicHolidayRepository $holidayRepository,
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

        // Count existing leave entries for this week
        $weekEnd = $weekStart->modify('+7 days');
        $query = new TimesheetQuery();
        $query->setCurrentUser($user);
        $query->setBegin($weekStart);
        $query->setEnd($weekEnd);
        $query->setUser($user);
        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);
        $leaveDays = [];
        foreach ($timesheets as $ts) {
            if ($ts->getActivity() !== null && stripos($ts->getActivity()->getName(), 'leave') !== false) {
                $leaveDays[$ts->getBegin()->format('Y-m-d')] = true;
            }
        }

        $canSubmit = true;

        return $this->render('@WeeklySubmission/staff/index.html.twig', [
            'submission' => $submission,
            'weekStart' => $weekStart,
            'weekEnd' => $weekStart->modify('+6 days'),
            'totalDuration' => $totalDuration,
            'history' => $history,
            'supervisor' => $user->getSupervisor(),
            'leaveDays' => $leaveDays,
            'canSubmit' => $canSubmit,
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

        $weekEnd = $weekStart->modify('+7 days');
        $query = new TimesheetQuery();
        $query->setCurrentUser($user);
        $query->setBegin($weekStart);
        $query->setEnd($weekEnd);
        $query->setUser($user);

        $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);

        $coveredDays = [];
        $hasWeekend = false;
        foreach ($timesheets as $ts) {
            $dayOfWeek = (int) $ts->getBegin()->format('N');
            if ($dayOfWeek >= 6) {
                $hasWeekend = true;
            } else {
                $coveredDays[$dayOfWeek] = true;
            }
        }

        if ($hasWeekend) {
            $this->addFlash('error', 'Weekend timesheets are not allowed. Please remove entries on Saturday/Sunday before submitting.');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        $holidays = $this->holidayRepository->findBetween($weekStart, $weekStart->modify('+4 days'));

        // Remove any leave entries that fall on public holidays and replace with holiday entry
        foreach ($holidays as $holiday) {
            $date = $holiday->getHolidayDate();
            $dayOfWeek = (int) $date->format('N');
            $dateKey = $date->format('Y-m-d');

            if ($dayOfWeek > 5) {
                continue;
            }

            foreach ($timesheets as $key => $ts) {
                if ($ts->getBegin()->format('Y-m-d') === $dateKey
                    && $ts->getActivity() !== null
                    && stripos($ts->getActivity()->getName(), 'leave') !== false
                ) {
                    $this->entityManager->remove($ts);
                    unset($timesheets[$key]);
                }
            }

            $entry = $this->buildHolidayEntry($user, $date, $holiday->getName());
            if ($entry !== null) {
                $this->entityManager->persist($entry);
                $coveredDays[$dayOfWeek] = true;
            }
        }

        if (empty($timesheets)) {
            $this->addFlash('error', 'You cannot submit an empty timesheet. Please create at least one timesheet entry first.');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        $totalDuration = $this->calculateWeekDuration($user, $weekStart);
        if ($totalDuration <= 0 && count($coveredDays) === 0) {
            $this->addFlash('error', 'You cannot submit an empty timesheet. All entries must have a duration greater than zero.');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        $submission->setTotalDuration($totalDuration);
        $submission->setStatus(WeeklySubmission::STATUS_SUBMITTED);
        $submission->setSubmittedAt(new \DateTimeImmutable());
        $submission->setApprovedBy(null);
        $submission->setApprovedAt(null);
        $submission->setSupervisorNotes(null);
        $submission->setManagerApprovedBy(null);
        $submission->setManagerApprovedAt(null);
        $submission->setManagerNotes(null);

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

    private function buildHolidayEntry(User $user, \DateTimeImmutable $date, string $holidayName): ?Timesheet
    {
        $project = $this->entityManager->getRepository(Project::class)->findOneBy(['visible' => true], ['id' => 'ASC']);
        $activity = $this->entityManager->getRepository(Activity::class)->findOneBy(['name' => 'Public Holiday']);

        if ($project === null || $activity === null) {
            return null;
        }

        $begin = new \DateTime($date->format('Y-m-d') . ' 08:00:00');
        $end = new \DateTime($date->format('Y-m-d') . ' 17:00:00');

        $entry = new Timesheet();
        $entry->setUser($user);
        $entry->setBegin($begin);
        $entry->setEnd($end);
        $entry->setDuration(28800);
        $entry->setProject($project);
        $entry->setActivity($activity);
        $entry->setDescription('Public Holiday: ' . $holidayName);
        $entry->setCategory('work');

        return $entry;
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
