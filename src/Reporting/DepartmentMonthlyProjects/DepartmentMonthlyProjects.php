<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Reporting\DepartmentMonthlyProjects;

use App\Entity\Department;
use App\Reporting\AbstractUserList;

final class DepartmentMonthlyProjects extends AbstractUserList
{
    private ?Department $department = null;

    public function getDepartment(): ?Department
    {
        return $this->department;
    }

    public function setDepartment(?Department $department): void
    {
        $this->department = $department;
    }
}
