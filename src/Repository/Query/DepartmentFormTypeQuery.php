<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

use App\Entity\Department;

/**
 * Can be used for advanced queries with the: DepartmentRepository
 */
final class DepartmentFormTypeQuery extends BaseFormTypeQuery
{
    private ?Department $departmentToIgnore = null;
    private bool $allowDepartmentPreselect = false;

    /**
     * @param Department|array<Department>|int|null $department
     */
    public function __construct(Department|array|int|null $department = null)
    {
        if (null !== $department) {
            if (!\is_array($department)) {
                $department = [$department];
            }
            $this->setDepartments($department);
        }
    }

    public function isAllowDepartmentPreselect(): bool
    {
        return $this->allowDepartmentPreselect;
    }

    public function setAllowDepartmentPreselect(bool $allowDepartmentPreselect): void
    {
        $this->allowDepartmentPreselect = $allowDepartmentPreselect;
    }

    /**
     * @return Department|null
     */
    public function getDepartmentToIgnore(): ?Department
    {
        return $this->departmentToIgnore;
    }

    public function setDepartmentToIgnore(Department $departmentToIgnore): DepartmentFormTypeQuery
    {
        $this->departmentToIgnore = $departmentToIgnore;

        return $this;
    }
}
