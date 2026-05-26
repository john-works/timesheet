<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Widget\Type;

use App\Repository\DepartmentRepository;
use App\Repository\Query\DepartmentQuery;
use App\Widget\WidgetInterface;

final class TotalsDepartment extends AbstractWidget
{
    public function __construct(private DepartmentRepository $department)
    {
    }

    public function getTitle(): string
    {
        return 'stats.departmentTotal';
    }

    /**
     * @param array<string, string|bool|int|null|array<string, mixed>> $options
     @return array<string, string|bool|int|null|array<string, mixed>>
     */
    public function getOptions(array $options = []): array
    {
        return array_merge([
            'route' => 'admin_department',
            'icon' => 'department',
            'color' => WidgetInterface::COLOR_TOTAL,
        ], parent::getOptions($options));
    }

    /**
     * @param array<string, string|bool|int|null|array<string, mixed>> $options
     */
    public function getData(array $options = []): mixed
    {
        $user = $this->getUser();
        $query = new DepartmentQuery();
        $query->setCurrentUser($user);

        return $this->department->countDepartmentsForQuery($query);
    }

    /**
     * @return string[]
     */
    public function getPermissions(): array
    {
        return ['view_department', 'view_teamlead_department', 'view_team_department'];
    }

    public function getTemplateName(): string
    {
        return 'widget/widget-more.html.twig';
    }

    public function getId(): string
    {
        return 'TotalsDepartment';
    }
}
