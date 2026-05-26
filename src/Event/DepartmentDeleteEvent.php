<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Event;

use App\Entity\Department;
use App\Webhook\Attribute\AsWebhook;

#[AsWebhook(name: 'department.deleted', description: 'Triggered right before a department will be deleted', payload: 'object.getDepartment()')]
final class DepartmentDeleteEvent extends AbstractDepartmentEvent
{
    public function __construct(Department $department, private readonly ?Department $replacementDepartment = null)
    {
        parent::__construct($department);
    }

    public function getReplacementDepartment(): ?Department
    {
        return $this->replacementDepartment;
    }
}
