<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Controller;

use KimaiPlugin\WeeklySubmissionBundle\Repository\PublicHolidayRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_REMEMBERED')]
final class PublicHolidayController extends AbstractController
{
    public function __construct(
        private readonly PublicHolidayRepository $holidayRepository,
    )
    {
    }

    #[Route('/public-holidays/calendar-events', name: 'public_holiday_calendar_events', methods: ['GET'])]
    public function calendarEvents(Request $request): JsonResponse
    {
        $from = $request->query->get('from', '__FROM__');
        $to = $request->query->get('to', '__TO__');

        if ($from === '__FROM__' || $to === '__TO__' || $from === '{from}' || $to === '{to}') {
            return $this->json([]);
        }

        $start = new \DateTimeImmutable($from);
        $end = new \DateTimeImmutable($to);

        $holidays = $this->holidayRepository->findBetween($start, $end);

        $events = [];
        foreach ($holidays as $holiday) {
            $dateStr = $holiday->getHolidayDate()->format('Y-m-d');
            $events[] = [
                'title' => $holiday->getName(),
                'start' => $dateStr,
                'allDay' => true,
                'color' => '#dc3545',
                'textColor' => '#ffffff',
            ];
        }

        return $this->json($events);
    }
}
