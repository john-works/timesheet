<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Model;

use App\Entity\Department;

/**
 * Object used to unify the access to budget data in charts.
 *
 * @method Department getEntity()
 */
class DepartmentBudgetStatisticModel extends BudgetStatisticModel
{
    public function __construct(Department $department)
    {
        parent::__construct($department);
    }

    public function getDepartment(): Department
    {
        return $this->getEntity();
    }
}
