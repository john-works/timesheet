<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use App\Entity\Activity;
use App\Entity\Project;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\TimesheetRepository;
use App\Repository\UserRepository;
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
        private readonly UserRepository $userRepository,
    )
    {
    }

    #[Route('/my-weekly', name: 'weekly_submission_staff', methods: ['GET'])]
    #[Route('/my-weekly/{id}', name: 'weekly_submission_staff_week', methods: ['GET'])]
    public function index(#[CurrentUser] User $user, Request $request, ?int $id = null): Response
    {
        $currentWeekStart = $this->getCurrentWeekStart();

        if ($id !== null) {
            $submission = $this->repository->find($id);
            if ($submission === null || $submission->getUser()->getId() !== $user->getId()) {
                throw $this->createNotFoundException('Submission not found.');
            }
            if (!$submission->isRejected()) {
                $this->addFlash('error', 'Only rejected submissions can be edited.');
                return $this->redirectToRoute('weekly_submission_staff');
            }
            $weekStart = $submission->getWeekStart();
        } else {
            $weekParam = $request->query->get('week');
            if ($weekParam !== null && $weekParam !== '') {
                $weekStart = \DateTimeImmutable::createFromFormat('Y-m-d', $weekParam);
                if ($weekStart === false) {
                    $weekStart = $currentWeekStart;
                } else {
                    $dayOfWeek = (int) $weekStart->format('N');
                    $weekStart = $weekStart->modify('-' . ($dayOfWeek - 1) . ' days')->setTime(0, 0, 0);
                }
            } else {
                $weekStart = $currentWeekStart;
            }
            $submission = $this->repository->findForUserAndWeek($user, $weekStart);
        }

        if ($submission === null) {
            $submission = new WeeklySubmission($user, $weekStart);
        }

        $totalDuration = $this->calculateWeekDuration($user, $weekStart);
        $submission->setTotalDuration($totalDuration);

        $currentWeekDuration = ($weekStart->format('Y-m-d') !== $currentWeekStart->format('Y-m-d'))
            ? $this->calculateWeekDuration($user, $currentWeekStart)
            : $totalDuration;

        $history = $this->repository->findHistoryForUser($user);

        // Count existing leave entries for this week
        $weekEnd = $weekStart->modify('+4 days');
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

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $dayOfWeek = (int) $now->format('N'); // 1=Mon, 5=Fri, 6=Sat, 7=Sun
        $hour = (int) $now->format('G');

        $unsubmittedWeeks = $this->findUnsubmittedPreviousWeeks($user, $currentWeekStart);
        $rejectedWeeks = $this->repository->findRejectedForUser($user);

        $lastWeekStart = $currentWeekStart->modify('-7 days');
        $lastWeekSubmission = $this->repository->findForUserAndWeek($user, $lastWeekStart);
        $lastWeekNotSubmitted = ($lastWeekSubmission === null || (!$lastWeekSubmission->isSubmitted() && !$lastWeekSubmission->isApproved() && !$lastWeekSubmission->isSupervisorApproved()));

        $isCurrentWeek = ($weekStart->format('Y-m-d') === $currentWeekStart->format('Y-m-d'));

        // Submission is available on Friday or Monday after 8:00 AM. On Monday the
        // current week itself cannot be submitted, so the button is only enabled
        // for staff who still have a pending (unsubmitted) previous week.
        $canSubmit = (($dayOfWeek === 5 || $dayOfWeek === 1) && $hour >= 8);
        if ($dayOfWeek === 1 && $isCurrentWeek) {
            $canSubmit = $canSubmit && !empty($unsubmittedWeeks);
        }
        $allowCurrentWeek = ($dayOfWeek === 5);

        $prevWeek = $weekStart->modify('-7 days')->format('Y-m-d');
        $nextWeek = $isCurrentWeek ? null : $weekStart->modify('+7 days')->format('Y-m-d');

        $deptUserIds = $this->repository->getDepartmentUserIds($user);
        $departmentUsers = !empty($deptUserIds) ? $this->userRepository->findBy(['id' => $deptUserIds], ['username' => 'ASC']) : [];
        $departmentUsers = array_filter($departmentUsers, fn($u) => $u->getId() !== $user->getId());
        $departmentUsers = array_values($departmentUsers);

        return $this->render('@WeeklySubmission/staff/index.html.twig', [
            'submission' => $submission,
            'weekStart' => $weekStart,
            'weekEnd' => $weekStart->modify('+6 days'),
            'totalDuration' => $totalDuration,
            'history' => $history,
            'supervisor' => $user->getSupervisor(),
            'leaveDays' => $leaveDays,
            'canSubmit' => $canSubmit,
            'allowCurrentWeek' => $allowCurrentWeek,
            'departmentUsers' => $departmentUsers,
            'prevWeek' => $prevWeek,
            'nextWeek' => $nextWeek,
            'unsubmittedWeeks' => $unsubmittedWeeks,
            'rejectedWeeks' => $rejectedWeeks,
            'currentWeekStart' => $currentWeekStart,
            'currentWeekDuration' => $currentWeekDuration,
            'lastWeekNotSubmitted' => $lastWeekNotSubmitted,
        ]);
    }

    #[Route('/my-weekly/submit', name: 'weekly_submission_staff_submit', methods: ['POST'])]
    #[Route('/my-weekly/{id}/submit', name: 'weekly_submission_staff_resubmit', methods: ['POST'])]
    public function submit(#[CurrentUser] User $user, Request $request, ?int $id = null): Response
    {
        if ($id !== null) {
            $submission = $this->repository->find($id);
            if ($submission === null || $submission->getUser()->getId() !== $user->getId()) {
                throw $this->createNotFoundException('Submission not found.');
            }
            if (!$submission->isRejected()) {
                $this->addFlash('error', 'Only rejected submissions can be resubmitted.');
                return $this->redirectToRoute('weekly_submission_staff', ['id' => $id]);
            }
            $weekStart = $submission->getWeekStart();
        } else {
            $weekParam = $request->request->get('week');
            if ($weekParam !== null && $weekParam !== '') {
                $weekStart = \DateTimeImmutable::createFromFormat('Y-m-d', $weekParam);
                if ($weekStart !== false) {
                    $dayOfWeek = (int) $weekStart->format('N');
                    $weekStart = $weekStart->modify('-' . ($dayOfWeek - 1) . ' days')->setTime(0, 0, 0);
                } else {
                    $weekStart = $this->getCurrentWeekStart();
                }
            } else {
                $weekStart = $this->getCurrentWeekStart();
            }
            $submission = $this->repository->findForUserAndWeek($user, $weekStart);
        }

        if ($submission === null) {
            $submission = new WeeklySubmission($user, $weekStart);
        }

        $currentWeekStart = $this->getCurrentWeekStart();
        $isViewingNonCurrentWeek = ($weekStart->format('Y-m-d') !== $currentWeekStart->format('Y-m-d'));
        $redirectParams = $id !== null ? ['id' => $id] : ($isViewingNonCurrentWeek ? ['week' => $weekStart->format('Y-m-d')] : []);

        if (!$submission->isDraft() && !$submission->isRejected()) {
            $this->addFlash('error', 'This week has already been submitted.');
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $dayOfWeek = (int) $now->format('N');
        $hour = (int) $now->format('G');

        if (($dayOfWeek !== 5 && $dayOfWeek !== 1) || $hour < 8) {
            $this->addFlash('error', 'Submission is only available on Friday or Monday after 8:00 AM');
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        if ($dayOfWeek === 1 && $weekStart->format('Y-m-d') === $currentWeekStart->format('Y-m-d')) {
            $this->addFlash('error', 'On Monday you can only submit last week\'s timesheet, not the current week.');
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        $weekEnd = $weekStart->modify('+4 days');
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
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
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
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        $totalDuration = $this->calculateWeekDuration($user, $weekStart);
        if ($totalDuration <= 0 && count($coveredDays) === 0) {
            $this->addFlash('error', 'You cannot submit an empty timesheet. All entries must have a duration greater than zero.');
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        // Check for overtime (more than 40 hours per week)
        $overtimeThreshold = 40 * 3600; // 40 hours in seconds
        $isOvertime = $totalDuration > $overtimeThreshold;
        $overtimeHours = $isOvertime ? (int) (($totalDuration - $overtimeThreshold) / 3600) : 0;

        if ($user->getSupervisor() === null) {
            $this->addFlash('error', 'You must have a Step 1 approver assigned before submitting. Please contact your administrator.');
            return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
        }

        $submission->setTotalDuration($totalDuration);
        $submission->setIsOvertime($isOvertime);
        $submission->setOvertimeHours($overtimeHours);
        $submission->setStatus(WeeklySubmission::STATUS_SUBMITTED);
        $submission->setSubmittedAt(new \DateTimeImmutable());
        $submission->setApprovedBy(null);
        $submission->setApprovedAt(null);
        $submission->setSupervisorNotes(null);
        $submission->setManagerApprovedBy(null);
        $submission->setManagerApprovedAt(null);
        $submission->setManagerNotes(null);
        $submission->setHrApprovedBy(null);
        $submission->setHrApprovedAt(null);
        $submission->setHrNotes(null);

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
        return $this->redirectToRoute('weekly_submission_staff', $redirectParams);
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
        $weekEnd = $weekStart->modify('+4 days');

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

    private function findUnsubmittedPreviousWeeks(User $user, \DateTimeImmutable $currentWeekStart): array
    {
        $eightWeeksAgo = $currentWeekStart->modify('-56 days');
        $submittedWeeks = $this->repository->findSubmittedWeekStartsForUser($user, $eightWeeksAgo, $currentWeekStart);

        $submittedDates = [];
        foreach ($submittedWeeks as $sw) {
            $submittedDates[$sw->getWeekStart()->format('Y-m-d')] = true;
        }

        $conn = $this->entityManager->getConnection();
        $durations = $conn->fetchAllAssociative(
            'SELECT DATE(t.start_time) AS day, SUM(t.duration) AS dur
             FROM kimai2_timesheet t
             WHERE t.user = :userId
               AND t.start_time >= :fromDate
               AND t.start_time < :toDate
               AND t.end_time IS NOT NULL
             GROUP BY DATE(t.start_time)',
            [
                'userId' => $user->getId(),
                'fromDate' => $eightWeeksAgo->format('Y-m-d'),
                'toDate' => $currentWeekStart->format('Y-m-d'),
            ]
        );

        $dayDurations = [];
        if ($durations) {
            foreach ($durations as $row) {
                $dayKey = substr($row['day'], 0, 10);
                $dayDurations[$dayKey] = (int) $row['dur'];
            }
        }

        $unsubmittedWeeks = [];
        $checkWeek = $currentWeekStart->modify('-7 days');

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $currentMonth = (int) $now->format('m');
        $currentYear = (int) $now->format('Y');
        $dayOfMonth = (int) $now->format('d');
        $gracePeriod = ($dayOfMonth <= 5);

        for ($i = 0; $i < 8; $i++) {
            $weekMonth = (int) $checkWeek->format('m');
            $weekYear = (int) $checkWeek->format('Y');

            // Month boundary rule: skip previous month weeks unless within 5-day grace period
            if ($weekYear < $currentYear || ($weekYear === $currentYear && $weekMonth < $currentMonth)) {
                if (!$gracePeriod) {
                    $checkWeek = $checkWeek->modify('-7 days');
                    continue;
                }
            }

            $dateKey = $checkWeek->format('Y-m-d');
            if (!isset($submittedDates[$dateKey])) {
                $weekDuration = 0;
                for ($d = 0; $d < 5; $d++) {
                    $dayKey = $checkWeek->modify("+$d days")->format('Y-m-d');
                    $weekDuration += $dayDurations[$dayKey] ?? 0;
                }
                if ($weekDuration > 0) {
                    $unsubmittedWeeks[] = [
                        'weekStart' => $checkWeek,
                        'weekEnd' => $checkWeek->modify('+4 days'),
                        'duration' => $weekDuration,
                    ];
                }
            }
            $checkWeek = $checkWeek->modify('-7 days');
        }

        return $unsubmittedWeeks;
    }

    #[Route('/my-weekly/batch-submit', name: 'weekly_submission_staff_batch_submit', methods: ['POST'])]
    public function batchSubmit(#[CurrentUser] User $user, Request $request): Response
    {
        $weeks = $request->request->all('weeks');
        if (empty($weeks) || !is_array($weeks)) {
            $this->addFlash('error', 'No weeks selected for submission.');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        $weeks = array_values(array_unique($weeks));

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $dayOfWeek = (int) $now->format('N');
        $hour = (int) $now->format('G');

        if (($dayOfWeek !== 5 && $dayOfWeek !== 1) || $hour < 8) {
            $this->addFlash('error', 'Submission is only available on Friday or Monday after 8:00 AM');
            return $this->redirectToRoute('weekly_submission_staff');
        }

        if ($dayOfWeek === 1) {
            $currentWeekStart = $this->getCurrentWeekStart();
            $weeks = array_values(array_filter($weeks, function (string $weekDate) use ($currentWeekStart): bool {
                $ws = \DateTimeImmutable::createFromFormat('Y-m-d', $weekDate);
                if ($ws === false) {
                    return true;
                }
                $dow = (int) $ws->format('N');
                $ws = $ws->modify('-' . ($dow - 1) . ' days')->setTime(0, 0, 0);
                return $ws->format('Y-m-d') !== $currentWeekStart->format('Y-m-d');
            }));
            if (empty($weeks)) {
                $this->addFlash('error', 'On Monday you can only submit last week\'s timesheet, not the current week.');
                return $this->redirectToRoute('weekly_submission_staff');
            }
        }

        $submittedCount = 0;
        $errors = [];

        foreach ($weeks as $weekDate) {
            $weekStart = \DateTimeImmutable::createFromFormat('Y-m-d', $weekDate);
            if ($weekStart === false) {
                continue;
            }

            $dayOfWeek = (int) $weekStart->format('N');
            $weekStart = $weekStart->modify('-' . ($dayOfWeek - 1) . ' days')->setTime(0, 0, 0);

            $submission = $this->repository->findForUserAndWeek($user, $weekStart);
            if ($submission === null) {
                $submission = new WeeklySubmission($user, $weekStart);
            }

            if (!$submission->isDraft() && !$submission->isRejected()) {
                continue;
            }

            $weekEnd = $weekStart->modify('+4 days');
            $query = new TimesheetQuery();
            $query->setCurrentUser($user);
            $query->setBegin($weekStart);
            $query->setEnd($weekEnd);
            $query->setUser($user);

            $timesheets = $this->timesheetRepository->getTimesheetsForQuery($query);

            $coveredDays = [];
            $hasWeekend = false;
            foreach ($timesheets as $ts) {
                $dow = (int) $ts->getBegin()->format('N');
                if ($dow >= 6) {
                    $hasWeekend = true;
                } else {
                    $coveredDays[$dow] = true;
                }
            }

            if ($hasWeekend) {
                $errors[] = $weekStart->format('M d') . '-' . $weekEnd->format('d') . ': Weekend timesheets not allowed';
                continue;
            }

            if (empty($timesheets)) {
                $errors[] = $weekStart->format('M d') . '-' . $weekEnd->format('d') . ': No timesheet entries';
                continue;
            }

            $holidays = $this->holidayRepository->findBetween($weekStart, $weekEnd);

            foreach ($holidays as $holiday) {
                $date = $holiday->getHolidayDate();
                $dow = (int) $date->format('N');
                $dateKey = $date->format('Y-m-d');

                if ($dow > 5) {
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
                    $coveredDays[$dow] = true;
                }
            }

            $totalDuration = $this->calculateWeekDuration($user, $weekStart);
            if ($totalDuration <= 0 && count($coveredDays) === 0) {
                $errors[] = $weekStart->format('M d') . '-' . $weekEnd->format('d') . ': Empty timesheet';
                continue;
            }

            $overtimeThreshold = 40 * 3600;
            $isOvertime = $totalDuration > $overtimeThreshold;
            $overtimeHours = $isOvertime ? (int) (($totalDuration - $overtimeThreshold) / 3600) : 0;

            if ($user->getSupervisor() === null) {
                $errors[] = $weekStart->format('M d') . '-' . $weekEnd->format('d') . ': No Step 1 approver assigned';
                continue;
            }

            $submission->setTotalDuration($totalDuration);
            $submission->setIsOvertime($isOvertime);
            $submission->setOvertimeHours($overtimeHours);
            $submission->setStatus(WeeklySubmission::STATUS_SUBMITTED);
            $submission->setSubmittedAt(new \DateTimeImmutable());
            $submission->setApprovedBy(null);
            $submission->setApprovedAt(null);
            $submission->setSupervisorNotes(null);
            $submission->setManagerApprovedBy(null);
            $submission->setManagerApprovedAt(null);
            $submission->setManagerNotes(null);
            $submission->setHrApprovedBy(null);
            $submission->setHrApprovedAt(null);
            $submission->setHrNotes(null);

            $this->entityManager->persist($submission);
            $submittedCount++;
        }

        $this->entityManager->flush();

        $supervisor = $user->getSupervisor();
        if ($supervisor !== null && $submittedCount > 0) {
            try {
                $this->mailer->sendBatchSubmittedNotification($user, $submittedCount, $supervisor);
            } catch (\Exception $e) {
                // email sending is best-effort
            }
        }

        if ($submittedCount > 0) {
            $this->addFlash('success', sprintf('%d week(s) submitted successfully.', $submittedCount));
        }

        if (!empty($errors)) {
            foreach ($errors as $error) {
                $this->addFlash('warning', $error);
            }
        }

        return $this->redirectToRoute('weekly_submission_staff');
    }
}
