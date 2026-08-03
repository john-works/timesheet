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

        $hasStaff = $auth->isGranted('view_own_timesheet');
        $isSupervisor = $auth->isGranted('view_other_timesheet')
            || ($hasStaff && ($this->repository->isTeamLead($user) || $this->repository->countPendingForSupervisor($user) > 0));

        if (!$hasStaff && !$isSupervisor) {
            return;
        }

        $weeklySubmission = new MenuItemModel('weekly_submission', 'Weekly Submission', null, [], 'calendar');

        if ($hasStaff) {
            $weeklySubmission->addChild(
                new MenuItemModel('weekly_submission_staff', 'My Weekly Timesheet', 'weekly_submission_staff', [], 'timesheet')
            );
        }

        if ($isSupervisor) {
            $pending = $this->repository->countPendingForSupervisor($user);
            $pendingFinal = $this->repository->countSupervisorApprovedForUser($user);
            $totalPending = $pending + $pendingFinal;

            $label = 'Pending My Approval';
            if ($totalPending > 0) {
                $label .= ' (' . $totalPending . ')';
            }
            $pendingItem = new MenuItemModel('weekly_submission_supervisor_pending', $label, 'weekly_submission_supervisor_pending', [], 'team');
            if ($totalPending > 0) {
                $pendingItem->setBadge((string) $totalPending);
                $pendingItem->setBadgeColor('danger');
            }
            $weeklySubmission->addChild($pendingItem);

            $weeklySubmission->addChild(
                new MenuItemModel('weekly_submission_supervisor_history', 'Approval History', 'weekly_submission_supervisor_history', [], 'history')
            );
        }

        if ($this->repository->isManagerHr($user)) {
            $overtimeCount = count($this->repository->findManagerHrPending());
            $overtimeItem = new MenuItemModel('weekly_submission_manager_hr_pending', 'Overtime', 'weekly_submission_manager_hr_pending', [], 'clock');
            if ($overtimeCount > 0) {
                $overtimeItem->setBadge((string) $overtimeCount);
                $overtimeItem->setBadgeColor('warning');
            }
            $weeklySubmission->addChild($overtimeItem);
        }

        if ($auth->isGranted('ROLE_ADMIN')) {
            $weeklySubmission->addChild(
                new MenuItemModel('weekly_submission_admin_overview', 'Weekly Overview', 'weekly_submission_admin_overview', [], 'th')
            );
            $weeklySubmission->addChild(
                new MenuItemModel('weekly_submission_admin_index', 'All Submissions', 'weekly_submission_admin_index', [], 'list')
            );
            $weeklySubmission->addChild(
                new MenuItemModel('weekly_submission_admin_approval_rights', 'Approval Rights', 'weekly_submission_admin_approval_rights', [], 'sitemap')
            );
        }

        if ($weeklySubmission->hasChildren()) {
            $menu->addChild($weeklySubmission);
        }
    }
}
