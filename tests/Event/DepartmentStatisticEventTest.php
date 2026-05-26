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
use App\Event\DepartmentStatisticEvent;
use App\Model\DepartmentStatistic;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(AbstractDepartmentEvent::class)]
#[CoversClass(DepartmentStatisticEvent::class)]
class DepartmentStatisticEventTest extends AbstractDepartmentEventTestCase
{
    protected function createDepartmentEvent(Department $department): AbstractDepartmentEvent
    {
        return new DepartmentStatisticEvent($department, new DepartmentStatistic());
    }

    public function testStatistic(): void
    {
        $department = new Department('foo');
        $statistic = new DepartmentStatistic();
        $sut = new DepartmentStatisticEvent($department, $statistic);

        self::assertSame($statistic, $sut->getStatistic());
        self::assertSame($department, $sut->getDepartment());
        self::assertNull($sut->getBegin());
        self::assertNull($sut->getEnd());

        $begin = new \DateTime('2020-08-08 12:34:56');
        $end = new \DateTime('2020-09-08 12:34:56');
        $sut = new DepartmentStatisticEvent($department, $statistic, $begin, $end);
        self::assertSame($begin, $sut->getBegin());
        self::assertSame($end, $sut->getEnd());
    }
}
