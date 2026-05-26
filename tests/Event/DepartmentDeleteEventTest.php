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
use App\Event\DepartmentDeleteEvent;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(DepartmentDeleteEvent::class)]
class DepartmentDeleteEventTest extends AbstractDepartmentEventTestCase
{
    protected function createDepartmentEvent(Department $department): AbstractDepartmentEvent
    {
        return new DepartmentDeleteEvent($department);
    }

    public function testReplacement(): void
    {
        $entity = new Department('department 1');
        $replacement = new Department('department 2');

        $sut = new DepartmentDeleteEvent($entity, $replacement);

        self::assertSame($entity, $sut->getDepartment());
        self::assertSame($replacement, $sut->getReplacementDepartment());
    }
}
