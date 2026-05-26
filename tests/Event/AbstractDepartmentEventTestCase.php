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
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\EventDispatcher\Event;

abstract class AbstractDepartmentEventTestCase extends TestCase
{
    abstract protected function createDepartmentEvent(Department $department): AbstractDepartmentEvent;

    public function testGetterAndSetter(): void
    {
        $department = new Department('foo');
        $sut = $this->createDepartmentEvent($department);

        self::assertInstanceOf(Event::class, $sut);
        self::assertSame($department, $sut->getDepartment());
    }
}
