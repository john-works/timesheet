<?php

namespace App\Controller\Admin;

use App\Controller\AbstractController;
use App\Entity\Activity;
use App\Entity\PublicHoliday;
use App\Entity\Timesheet;
use App\Form\PublicHolidayEditForm;
use App\Repository\ActivityRepository;
use App\Repository\ProjectRepository;
use App\Repository\PublicHolidayRepository;
use App\Repository\UserRepository;
use App\Timesheet\TimesheetService;
use App\Utils\PageSetup;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(path: '/admin/public-holiday')]
#[IsGranted('view_activity')]
final class PublicHolidayController extends AbstractController
{
    #[Route(path: '/', name: 'admin_public_holiday', methods: ['GET'])]
    public function indexAction(PublicHolidayRepository $repository): Response
    {
        $holidays = $repository->findAllOrderedByDate();

        $page = new PageSetup('Public Holidays');
        $page->setActionName('public_holidays');

        return $this->render('public_holiday/index.html.twig', [
            'page_setup' => $page,
            'holidays' => $holidays,
        ]);
    }

    #[Route(path: '/create', name: 'admin_public_holiday_create', methods: ['GET', 'POST'])]
    #[IsGranted('create_activity')]
    public function createAction(
        Request $request,
        PublicHolidayRepository $repository,
        ActivityRepository $activityRepository,
        ProjectRepository $projectRepository,
        UserRepository $userRepository,
        TimesheetService $timesheetService,
        EntityManagerInterface $entityManager
    ): Response {
        $holiday = new PublicHoliday();

        $form = $this->createForm(PublicHolidayEditForm::class, $holiday, [
            'action' => $this->generateUrl('admin_public_holiday_create'),
            'method' => 'POST',
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $existing = $repository->findOneBy(['holidayDate' => $holiday->getHolidayDate()]);
            if ($existing !== null) {
                $this->addFlash('error', 'A public holiday for this date already exists.');
                return $this->redirectToRoute('admin_public_holiday_create');
            }

            try {
                $repository->savePublicHoliday($holiday);

                $this->createTimesheetEntriesForHoliday(
                    $holiday,
                    $activityRepository,
                    $projectRepository,
                    $userRepository,
                    $timesheetService,
                    $entityManager
                );

                $this->flashSuccess('action.update.success');

                return $this->redirectToRoute('admin_public_holiday');
            } catch (\Exception $ex) {
                $this->handleFormUpdateException($ex, $form);
            }
        }

        $page = new PageSetup('Public Holidays');
        $page->setActionName('public_holidays');

        return $this->render('public_holiday/edit.html.twig', [
            'page_setup' => $page,
            'holiday' => $holiday,
            'form' => $form->createView(),
        ]);
    }

    #[Route(path: '/{id}/delete', name: 'admin_public_holiday_delete', methods: ['GET', 'POST'])]
    #[IsGranted('delete_activity')]
    public function deleteAction(
        PublicHoliday $holiday,
        PublicHolidayRepository $repository,
        Request $request
    ): Response {
        try {
            $repository->deletePublicHoliday($holiday);
            $this->flashSuccess('action.delete.success');
        } catch (\Exception $ex) {
            $this->flashDeleteException($ex);
        }

        return $this->redirectToRoute('admin_public_holiday');
    }

    private function createTimesheetEntriesForHoliday(
        PublicHoliday $holiday,
        ActivityRepository $activityRepository,
        ProjectRepository $projectRepository,
        UserRepository $userRepository,
        TimesheetService $timesheetService,
        EntityManagerInterface $entityManager
    ): void {
        $activity = $activityRepository->findOneBy(['name' => 'Public Holiday']);
        if (!$activity) {
            $activity = new Activity();
            $activity->setName('Public Holiday');
            $activity->setVisible(true);
            $activity->setBillable(true);
            $entityManager->persist($activity);
            $entityManager->flush();
        }

        $project = $projectRepository->findOneBy(['visible' => true], ['id' => 'ASC']);
        if (!$project) {
            return;
        }

        $users = $userRepository->findBy(['enabled' => true]);

        $day = $holiday->getHolidayDate();
        $holidayName = $holiday->getName();
        if ($day === null || $holidayName === null) {
            return;
        }

        foreach ($users as $user) {
            $entry = new Timesheet();
            $entry->setUser($user);
            $entry->setActivity($activity);
            $entry->setProject($project);
            $begin = (clone $day)->setTime(0, 0);
            $entry->setBegin($begin);
            $entry->setEnd((clone $begin));
            $entry->setDescription('Public Holiday: ' . $holidayName);

            try {
                $timesheetService->saveTimesheet($entry);
            } catch (\Exception $ex) {
                // skip user if entry already exists or other error
            }
        }
    }
}
