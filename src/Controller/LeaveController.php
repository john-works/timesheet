<?php

namespace App\Controller;

use App\Entity\Timesheet;
use App\Repository\ActivityRepository;
use App\Repository\ProjectRepository;
use App\Repository\TimesheetRepository;
use App\Utils\PageSetup;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use Doctrine\ORM\EntityManagerInterface;

#[Route(path: '/leave')]
#[IsGranted('create_own_timesheet')]
final class LeaveController extends AbstractController
{
    public function __construct(
        private readonly ActivityRepository $activityRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly TimesheetRepository $timesheetRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route(path: '/', name: 'leave', methods: ['GET', 'POST'])]
    public function indexAction(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            return $this->handleLeaveSubmit($request);
        }

        $page = new PageSetup('leave');
        $page->setActionName('leave');

        return $this->render('leave/index.html.twig', [
            'page_setup' => $page,
        ]);
    }

    private function handleLeaveSubmit(Request $request): Response
    {
        $leaveStart = $request->request->get('leaveStart');
        $leaveEnd = $request->request->get('leaveEnd');
        $leaveType = $request->request->get('leaveType', 'Leave');

        if (!$leaveStart || !$leaveEnd) {
            $this->addFlash('error', 'Please provide both start and end dates.');
            return $this->redirectToRoute('leave');
        }

        if (!$leaveType) {
            $this->addFlash('error', 'Please select a leave type.');
            return $this->redirectToRoute('leave');
        }

        $user = $this->getUser();
        $userTz = new \DateTimeZone($user->getTimezone());

        $leaveActivity = $this->activityRepository->findOneBy(['name' => 'Leave']);
        if (!$leaveActivity) {
            $this->addFlash('error', 'Leave activity not found.');
            return $this->redirectToRoute('leave');
        }

        $project = $this->projectRepository->findOneBy(['visible' => true], ['id' => 'ASC']);
        if (!$project) {
            $this->addFlash('error', 'No active project found.');
            return $this->redirectToRoute('leave');
        }

        $created = 0;
        $skipped = 0;
        $isWithoutPay = stripos($leaveType, 'Without Pay') !== false;

        $startDate = new \DateTime($leaveStart, $userTz);
        $endDate = new \DateTime($leaveEnd, $userTz);

        $current = clone $startDate;
        while ($current <= $endDate) {
            $dow = (int) $current->format('N');
            if ($dow > 5) {
                $current->modify('+1 day');
                continue;
            }

            $dateStr = $current->format('Y-m-d');

            $existing = $this->timesheetRepository->createQueryBuilder('t')
                ->select('COUNT(t.id)')
                ->where('t.user = :user')
                ->andWhere('t.activity = :activity')
                ->andWhere('DATE(t.begin) = :dateStr')
                ->setParameter('user', $user)
                ->setParameter('activity', $leaveActivity)
                ->setParameter('dateStr', $dateStr)
                ->getQuery()
                ->getSingleScalarResult();

            if ((int) $existing > 0) {
                $skipped++;
                $current->modify('+1 day');
                continue;
            }

            if ($isWithoutPay) {
                $begin = new \DateTime($dateStr . ' 00:00:00', $userTz);
                $finish = new \DateTime($dateStr . ' 00:00:00', $userTz);
            } else {
                $begin = new \DateTime($dateStr . ' 08:00:00', $userTz);
                $finish = new \DateTime($dateStr . ' 17:00:00', $userTz);
            }

            $entry = new Timesheet();
            $entry->setUser($user);
            $entry->setActivity($leaveActivity);
            $entry->setProject($project);
            $entry->setDescription($leaveType);
            $entry->setTimezone($user->getTimezone());
            $entry->setBegin($begin);
            $entry->setEnd($finish);
            if ($isWithoutPay) {
                $entry->setDuration(0);
            } else {
                $entry->setDuration(28800);
            }

            try {
                $this->entityManager->persist($entry);
                $this->entityManager->flush();
                $created++;
            } catch (\Exception $ex) {
                $this->addFlash('error', 'Failed to create leave entry for ' . $dateStr . ': ' . $ex->getMessage());
            }

            $current->modify('+1 day');
        }

        $message = sprintf('Created %d leave entry/entries.', $created);
        if ($skipped > 0) {
            $message .= sprintf(' %d day(s) skipped (already exist).', $skipped);
        }
        $this->addFlash('success', $message);

        return $this->redirectToRoute('timesheet');
    }
}
