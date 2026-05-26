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
use App\Event\DepartmentDetailControllerEvent;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(AbstractDepartmentEvent::class)]
#[CoversClass(DepartmentDetailControllerEvent::class)]
class DepartmentDetailControllerEventTest extends AbstractDepartmentEventTestCase
{
    protected function createDepartmentEvent(Department $department): AbstractDepartmentEvent
    {
        return new DepartmentDetailControllerEvent($department);
    }

    public function testController(): void
    {
        /** @var DepartmentDetailControllerEvent $event */
        $event = $this->createDepartmentEvent(new Department('foo'));
        $event->addController('Foo\\Bar::helloWorld');
        self::assertEquals(['Foo\\Bar::helloWorld'], $event->getController());
    }
}
