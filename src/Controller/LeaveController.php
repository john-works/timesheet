<?php

namespace App\Controller;

use App\Entity\Timesheet;
use App\Repository\ActivityRepository;
use App\Repository\ProjectRepository;
use App\Timesheet\TimesheetService;
use App\Utils\PageSetup;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(path: '/leave')]
#[IsGranted('create_own_timesheet')]
final class LeaveController extends AbstractController
{
    public function __construct(
        private readonly ActivityRepository $activityRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly TimesheetService $timesheetService,
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

        $start = new \DateTime($leaveStart);
        $end = (new \DateTime($leaveEnd))->modify('+1 day');
        $interval = new \DateInterval('P1D');
        $period = new \DatePeriod($start, $interval, $end);

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

        $user = $this->getUser();
        $created = 0;

        foreach ($period as $date) {
            if ($date->format('N') > 5) {
                continue;
            }

            $isWithoutPay = stripos($leaveType, 'Without Pay') !== false;

            $entry = new Timesheet();
            $entry->setUser($user);
            $entry->setActivity($leaveActivity);
            $entry->setProject($project);
            $entry->setDescription($leaveType);

            if ($isWithoutPay) {
                $entry->setBegin((clone $date)->setTime(0, 0));
                $entry->setEnd((clone $date)->setTime(0, 0));
                $entry->setDuration(0);
            } else {
                $entry->setBegin((clone $date)->setTime(8, 0));
                $entry->setEnd((clone $date)->setTime(17, 0));
                $entry->setDuration(28800);
            }

            try {
                $this->timesheetService->saveTimesheet($entry);
                $created++;
            } catch (\Exception $ex) {
                $this->flashUpdateException($ex);
            }
        }

        $this->addFlash('success', sprintf('Created %d leave entry/entries.', $created));

        return $this->redirectToRoute('leave');
    }
}
