<?php

namespace KimaiPlugin\WeeklySubmissionBundle\EventSubscriber;

use App\Entity\User;
use App\Event\ConfigureMainMenuEvent;
use App\Utils\MenuItemModel;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class MenuSubscriber implements EventSubscriberInterface
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
            ConfigureMainMenuEvent::class => ['onMainMenuConfigure', 50],
        ];
    }

    public function onMainMenuConfigure(ConfigureMainMenuEvent $event): void
    {
        $auth = $this->security;

        if (!$auth->isGranted('IS_AUTHENTICATED_REMEMBERED')) {
            return;
        }

        /** @var User $user */
        $user = $auth->getUser();
        $menu = $event->getMenu();

        $submission = new MenuItemModel('weekly_submission', 'Weekly Submission', null, [], 'timesheet');

        if ($auth->isGranted('view_own_timesheet')) {
            $submission->addChild(
                new MenuItemModel('weekly_submission_staff', 'My Weekly Timesheet', 'weekly_submission_staff', [], 'timesheet')
            );
        }

        $isSupervisor = $auth->isGranted('view_other_timesheet') || $this->repository->countPendingForSupervisor($user) > 0;

        if ($isSupervisor) {
            $pending = $this->repository->countPendingForSupervisor($user);
            $label = 'Pending My Approval';
            if ($pending > 0) {
                $label .= ' (' . $pending . ')';
            }
            $pendingItem = new MenuItemModel('weekly_submission_supervisor_pending', $label, 'weekly_submission_supervisor_pending', [], 'team');
            if ($pending > 0) {
                $pendingItem->setBadge((string) $pending);
                $pendingItem->setBadgeColor('danger');
            }
            $submission->addChild($pendingItem);

            $submission->addChild(
                new MenuItemModel('weekly_submission_supervisor_history', 'Approval History', 'weekly_submission_supervisor_history', [], 'history')
            );
        }

        if ($submission->hasChildren()) {
            $menu->addChild($submission);
        }
    }
}
