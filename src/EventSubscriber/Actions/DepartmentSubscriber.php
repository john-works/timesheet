<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\EventSubscriber\Actions;

use App\Entity\Department;
use App\Event\PageActionsEvent;

final class DepartmentSubscriber extends AbstractActionsSubscriber
{
    public static function getActionName(): string
    {
        return 'department';
    }

    public function onActions(PageActionsEvent $event): void
    {
        $payload = $event->getPayload();

        /** @var Department $department */
        $department = $payload['department'];

        if ($department->getId() === null) {
            return;
        }

        $canView = $this->isGranted('view', $department);
        $isListingView = $event->isIndexView() || $event->isCustomView();

        if (!$event->isView('department_details') && $canView) {
            $event->addAction('details', ['title' => 'details', 'url' => $this->path('department_details', ['id' => $department->getId()])]);
        }

        if ($this->isGranted('edit', $department)) {
            $event->addEdit($this->path('admin_department_edit', ['id' => $department->getId()]), !$event->isView('edit'));
        }

        if ($this->isGranted('permissions', $department)) {
            $class = $event->isView('permissions') ? '' : 'modal-ajax-form';
            $event->addAction('permissions', ['title' => 'permissions', 'url' => $this->path('admin_department_permissions', ['id' => $department->getId()]), 'class' => $class]);
        }

        if ($isListingView) {
            if ($department->isVisible() && $this->isGranted('create_project')) {
                $event->addAction('create-project', [
                    'icon' => 'create',
                    'url' => $this->path('admin_project_create_with_department', ['department' => $department->getId()]),
                    'class' => 'modal-ajax-form'
                ]);
            }
        }

        if ($event->countActions() > 0) {
            $event->addDivider();
        }

        if ($this->isGranted('view_project') || $this->isGranted('view_teamlead_project') || $this->isGranted('view_team_project')) {
            $event->addActionToSubmenu('filter', 'project', ['title' => 'projects', 'url' => $this->path('admin_project', ['departments[]' => $department->getId()])]);
        }

        if ($this->isGranted('view_activity')) {
            $event->addActionToSubmenu('filter', 'activity', ['title' => 'activities', 'url' => $this->path('admin_activity', ['departments[]' => $department->getId()])]);
        }

        if ($this->isGranted('view_other_timesheet')) {
            $event->addActionToSubmenu('filter', 'timesheet', ['title' => 'timesheet.filter', 'url' => $this->path('admin_timesheet', ['departments[]' => $department->getId()])]);
        }

        if ($event->hasSubmenu('filter')) {
            $event->addDivider();
        }

        if ($event->isIndexView() && $this->isGranted('delete', $department)) {
            $event->addDelete($this->path('admin_department_delete', ['id' => $department->getId()]));
        }

        if ($this->isGranted('report:department') && $this->isGranted('report:other')) {
            $event->addActionToSubmenu('report', 'report_department_monthly_projects', ['title' => 'report_department_monthly_projects', 'url' => $this->path('report_department_monthly_projects', ['department' => $department->getId()]), 'translation_domain' => 'reporting']);
        }

        if ($this->isGranted('report:project') && $this->isGranted('budget_any', 'project')) {
            $event->addActionToSubmenu('report', 'daterange_projects', ['title' => 'report_project_daterange', 'url' => $this->path('report_project_daterange', ['department' => $department->getId()]), 'translation_domain' => 'reporting']);
            $event->addActionToSubmenu('report', 'report_project_view', ['title' => 'report_project_view', 'url' => $this->path('report_project_view', ['department' => $department->getId()]), 'translation_domain' => 'reporting']);
        }
    }
}
