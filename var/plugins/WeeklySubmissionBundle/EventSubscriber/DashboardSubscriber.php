<?php

namespace KimaiPlugin\WeeklySubmissionBundle\EventSubscriber;

use App\Event\DashboardEvent;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class DashboardSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly Security $security,
        private readonly WeeklySubmissionRepository $repository
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            DashboardEvent::class => ['onDashboardEvent', 50],
        ];
    }

    public function onDashboardEvent(DashboardEvent $event): void
    {
        $auth = $this->security;

        if (!$auth->isGranted('IS_AUTHENTICATED_REMEMBERED')) {
            return;
        }

        $user = $auth->getUser();
        if ($user === null) {
            return;
        }

        $pending = $this->repository->countPendingForSupervisor($user);

        if ($pending > 0) {
            $event->addWidget('pendingApprovals');
        }
    }
}
