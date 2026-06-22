<?php

namespace KimaiPlugin\WeeklySubmissionBundle\EventSubscriber;

use App\Calendar\CalendarSource;
use App\Calendar\CalendarSourceType;
use App\Event\CalendarSourceEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

final class CalendarSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly UrlGeneratorInterface $urlGenerator,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CalendarSourceEvent::class => ['onCalendarSource', 100],
        ];
    }

    public function onCalendarSource(CalendarSourceEvent $event): void
    {
        $url = $this->urlGenerator->generate('public_holiday_calendar_events', [
            'from' => '__FROM__',
            'to' => '__TO__',
        ], UrlGeneratorInterface::ABSOLUTE_URL);

        $source = new CalendarSource(CalendarSourceType::JSON, 'public_holidays', $url, '#dc3545');
        $source->addOption('name', 'Public Holidays');
        $source->addOption('editable', false);

        $event->addSource($source);
    }
}
