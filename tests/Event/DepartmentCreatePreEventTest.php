<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Event;

use App\Entity\Department;
use App\Event\AbstractDepartmentEvent;
use App\Event\DepartmentCreatePreEvent;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(AbstractDepartmentEvent::class)]
#[CoversClass(DepartmentCreatePreEvent::class)]
class DepartmentCreatePreEventTest extends AbstractDepartmentEventTestCase
{
    protected function createDepartmentEvent(Department $department): AbstractDepartmentEvent
    {
        return new DepartmentCreatePreEvent($department);
    }
}
