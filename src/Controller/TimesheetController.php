<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller;

use App\Configuration\SystemConfiguration;
use App\Entity\Timesheet;
use App\Event\TimesheetMetaDisplayEvent;
use App\Export\ServiceExport;
use App\Form\TimesheetEditForm;
use App\Repository\ActivityRepository;
use App\Repository\ProjectRepository;
use App\Repository\TagRepository;
use App\Repository\TimesheetRepository;
use App\Timesheet\TimesheetService;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * No permission check on controller level, only for single routes.
 *
 * There was "view_own_timesheet" here once, but it is a bug, as some companies (rarely, but existing) want their
 * employees to enter time, but not to see it afterward.
 *
 * It is legit to only own "create_own_timesheet" without "view_own_timesheet".
 */
#[Route(path: '/timesheet')]
final class TimesheetController extends TimesheetAbstractController
{
    public function __construct(
        TimesheetRepository $repository,
        EventDispatcherInterface $dispatcher,
        TimesheetService $service,
        SystemConfiguration $configuration,
        TagRepository $tagRepository,
        private readonly ActivityRepository $activityRepository,
        private readonly ProjectRepository $projectRepository,
    ) {
        parent::__construct($repository, $dispatcher, $service, $configuration, $tagRepository);
    }

    #[Route(path: '/', defaults: ['page' => 1], name: 'timesheet', methods: ['GET'])]
    #[Route(path: '/page/{page}', requirements: ['page' => '[1-9]\d*'], name: 'timesheet_paginated', methods: ['GET'])]
    #[IsGranted('view_own_timesheet')]
    public function indexAction(int $page, Request $request): Response
    {
        $query = $this->createDefaultQuery();
        $query->setPage($page);

        return $this->index($query, $request, 'timesheet', 'timesheet_paginated', TimesheetMetaDisplayEvent::TIMESHEET);
    }

    #[Route(path: '/export/{exporter}', name: 'timesheet_export', methods: ['GET', 'POST'])]
    #[IsGranted('export_own_timesheet')]
    public function exportAction(string $exporter, Request $request, ServiceExport $serviceExport): Response
    {
        return $this->export($exporter, $request, $serviceExport);
    }

    #[Route(path: '/{id}/edit', name: 'timesheet_edit', methods: ['GET', 'POST'])]
    #[IsGranted('edit', 'entry')]
    public function editAction(Timesheet $entry, Request $request): Response
    {
        if ($request->isMethod('POST') && $this->isTodayEntry($entry->getBegin())) {
            $now = new \DateTime();
            $hour = (int) $now->format('G');
            if ($hour < 16) {
                $this->addFlash('error', 'Timesheets for today can only be entered from 4:00 PM onwards.');
                return $this->redirectToRoute($this->getTimesheetRoute());
            }
        }

        return $this->edit($entry, $request);
    }

    #[Route(path: '/{id}/duplicate', name: 'timesheet_duplicate', methods: ['GET', 'POST'])]
    #[IsGranted('duplicate', 'entry')]
    public function duplicateAction(Timesheet $entry, Request $request): Response
    {
        return $this->duplicate($entry, $request);
    }

    #[Route(path: '/multi-update', name: 'timesheet_multi_update', methods: ['POST'])]
    #[IsGranted('edit_own_timesheet')]
    public function multiUpdateAction(Request $request): Response
    {
        return $this->multiUpdate($request);
    }

    #[Route(path: '/multi-delete', name: 'timesheet_multi_delete', methods: ['POST'])]
    #[IsGranted('delete_own_timesheet')]
    public function multiDeleteAction(Request $request): Response
    {
        return $this->multiDelete($request);
    }

    #[Route(path: '/create', name: 'timesheet_create', methods: ['GET', 'POST'])]
    #[IsGranted('create_own_timesheet')]
    public function createAction(Request $request): Response
    {
        $leaveStart = $request->request->get('leaveStart');
        $leaveEnd = $request->request->get('leaveEnd');
        $formData = $request->request->all('timesheet_edit_form');

        if (empty($formData)) {
            $formData = $request->request->all('timesheet_admin_edit_form');
        }

        $activityId = isset($formData['activity']) ? (int) $formData['activity'] : null;

        if ($activityId && $this->isLeaveActivity($activityId) && $leaveStart && $leaveEnd) {
            return $this->handleLeaveCreation($request, $leaveStart, $leaveEnd);
        }

        if ($activityId && $this->isLeaveActivity($activityId) && $request->isMethod('POST')) {
            $entry = $this->service->createNewTimesheet($this->getUser(), $request);
            $createForm = $this->getCreateForm($entry);
            $createForm->handleRequest($request);

            if ($createForm->isSubmitted()) {
                $createForm->addError(new \Symfony\Component\Form\FormError('Please provide both leave start and end dates when using the Leave activity.'));
            }

            return $this->render('timesheet/edit.html.twig', [
                'page_setup' => $this->createPageSetup(),
                'route_back' => $this->getTimesheetRoute(),
                'timesheet' => $entry,
                'form' => $createForm->createView(),
                'template' => $this->getTrackingMode()->getEditTemplate(),
            ]);
        }

        if ($request->isMethod('POST')) {
            $beginDate = $formData['begin_date'] ?? $formData['date'] ?? null;
            if ($beginDate !== null && $this->isTodayEntry($beginDate)) {
                $now = new \DateTime();
                $hour = (int) $now->format('G');
                if ($hour < 16) {
                    $this->addFlash('error', 'Timesheets for today can only be entered from 4:00 PM onwards.');
                    return $this->redirectToRoute($this->getTimesheetRoute());
                }
            }
        }

        return $this->create($request);
    }

    private function isLeaveActivity(int $activityId): bool
    {
        static $leaveIds = [];

        if (!isset($leaveIds[$activityId])) {
            $activity = $this->activityRepository->find($activityId);
            $leaveIds[$activityId] = ($activity !== null && $activity->getName() === 'Leave');
        }

        return $leaveIds[$activityId];
    }

    private function handleLeaveCreation(Request $request, string $leaveStart, string $leaveEnd): Response
    {
        $leaveActivity = $this->activityRepository->findOneBy(['name' => 'Leave']);
        if (!$leaveActivity) {
            $this->addFlash('error', 'Leave activity not found. Please contact your administrator.');
            return $this->redirectToRoute($this->getTimesheetRoute());
        }

        $project = $this->projectRepository->findOneBy(['visible' => true], ['id' => 'ASC']);
        if (!$project) {
            $this->addFlash('error', 'No active project found. Please contact your administrator.');
            return $this->redirectToRoute($this->getTimesheetRoute());
        }

        $start = new \DateTime($leaveStart);
        $end = (new \DateTime($leaveEnd))->modify('+1 day');
        $interval = new \DateInterval('P1D');
        $period = new \DatePeriod($start, $interval, $end);

        $user = $this->getUser();
        $created = 0;

        foreach ($period as $date) {
            if ($date->format('N') > 5) {
                continue;
            }

            $entry = new Timesheet();
            $entry->setUser($user);
            $entry->setActivity($leaveActivity);
            $entry->setProject($project);
            $entry->setBegin((clone $date)->setTime(8, 0));
            $entry->setEnd((clone $date)->setTime(17, 0));
            $entry->setDescription('Leave');

            try {
                $this->service->saveTimesheet($entry);
                $created++;
            } catch (\Exception $ex) {
                $this->flashUpdateException($ex);
            }
        }

        $this->addFlash('success', sprintf('Created %d leave entry/entries.', $created));

        return $this->redirectToRoute($this->getTimesheetRoute());
    }

    protected function create(Request $request): Response
    {
        $entry = $this->service->createNewTimesheet($this->getUser(), $request);

        $preForm = $this->createFormForGetRequest(\App\Form\TimesheetPreCreateForm::class, $entry, [
            'include_user' => $this->includeUserInForms('create'),
        ]);
        $preForm->submit($request->query->all(), false);

        $createForm = $this->getCreateForm($entry);
        $createForm->handleRequest($request);

        if ($createForm->isSubmitted() && $createForm->isValid()) {
            try {
                $this->service->saveTimesheet($entry);
                $this->addFlash('success', 'Timesheet entry created successfully.');

                return $this->redirectToRoute($this->getTimesheetRoute());
            } catch (\Exception $ex) {
                $this->handleFormUpdateException($ex, $createForm);
            }
        }

        return $this->render('timesheet/edit.html.twig', [
            'page_setup' => $this->createPageSetup(),
            'route_back' => $this->getTimesheetRoute(),
            'timesheet' => $entry,
            'form' => $createForm->createView(),
            'template' => $this->getTrackingMode()->getEditTemplate(),
        ]);
    }

    private function isTodayEntry(\DateTimeInterface|string|null $date): bool
    {
        if ($date === null) {
            return false;
        }

        if ($date instanceof \DateTimeInterface) {
            $entryDate = $date;
        } else {
            try {
                $entryDate = new \DateTime((string) $date);
            } catch (\Exception) {
                return false;
            }
        }

        $today = new \DateTime('today');

        return $entryDate->format('Y-m-d') === $today->format('Y-m-d');
    }

    protected function getCreateForm(Timesheet $entry): FormInterface
    {
        return $this->generateCreateForm($entry, TimesheetEditForm::class, $this->generateUrl('timesheet_create'));
    }

    protected function getDuplicateForm(Timesheet $entry, Timesheet $original): FormInterface
    {
        return $this->generateCreateForm($entry, TimesheetEditForm::class, $this->generateUrl('timesheet_duplicate', ['id' => $original->getId()]));
    }
}
