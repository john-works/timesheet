<?php

namespace KimaiPlugin\WeeklySubmissionBundle\EventSubscriber;

use App\Entity\Activity;
use App\Event\TimesheetCreatePreEvent;
use App\Event\TimesheetUpdatePreEvent;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Entity\PublicHoliday;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class TimesheetHolidaySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            TimesheetCreatePreEvent::class => ['onTimesheetPreSave', 100],
            TimesheetUpdatePreEvent::class => ['onTimesheetPreSave', 100],
        ];
    }

    public function onTimesheetPreSave(TimesheetCreatePreEvent|TimesheetUpdatePreEvent $event): void
    {
        $timesheet = $event->getTimesheet();

        if ($timesheet->getActivity() === null || stripos($timesheet->getActivity()->getName(), 'leave') === false) {
            return;
        }

        $begin = $timesheet->getBegin();
        if ($begin === null) {
            return;
        }

        $dateStr = $begin->format('Y-m-d');

        $holidayRepo = $this->entityManager->getRepository(PublicHoliday::class);
        $holiday = $holidayRepo->findOneBy(['holidayDate' => new \DateTimeImmutable($dateStr)]);

        if ($holiday === null) {
            return;
        }

        $holidayActivity = $this->entityManager->getRepository(Activity::class)->findOneBy(['name' => 'Public Holiday']);
        if ($holidayActivity === null) {
            return;
        }

        $timesheet->setActivity($holidayActivity);
        $timesheet->setDescription('Public Holiday: ' . $holiday->getName());
    }
}
