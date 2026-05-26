<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

use App\Entity\Department;

trait DepartmentTrait
{
    /**
     * @var array<Department>
     */
    private array $departments = [];

    public function addDepartment(Department $department): self
    {
        $this->departments[] = $department;

        return $this;
    }

    /**
     * @param array<Department> $departments
     * @return $this
     */
    public function setDepartments(array $departments): self
    {
        $this->departments = $departments;

        return $this;
    }

    /**
     * @return array<Department>
     */
    public function getDepartments(): array
    {
        return $this->departments;
    }

    /**
     * @return array<int>
     */
    public function getDepartmentIds(): array
    {
        return array_filter(array_values(array_unique(array_map(function (Department $department) {
            return $department->getId();
        }, $this->departments))), function ($id) {
            return $id !== null;
        });
    }

    public function hasDepartments(): bool
    {
        return !empty($this->departments);
    }
}
