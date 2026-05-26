<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Reporting\ProjectDateRange;

use App\Entity\Department;
use App\Entity\User;
use App\Reporting\ProjectDateRange\ProjectDateRangeQuery;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(ProjectDateRangeQuery::class)]
class ProjectDateRangeQueryTest extends TestCase
{
    public function testDefaults(): void
    {
        $user = new User();
        $date = new \DateTime();
        $sut = new ProjectDateRangeQuery($date, $user);

        self::assertEquals($date->getTimestamp(), $sut->getMonth()->getTimestamp());
        self::assertSame($user, $sut->getUser());
        self::assertNull($sut->getDepartment());
        self::assertFalse($sut->isIncludeNoWork());

        self::assertNull($sut->getBudgetType());
        self::assertFalse($sut->isIncludeNoBudget());
        self::assertFalse($sut->isBudgetTypeMonthly());
        self::assertTrue($sut->isBudgetIndependent());
    }

    public function testSetterGetter(): void
    {
        $sut = new ProjectDateRangeQuery(new \DateTime(), new User());

        $date = new \DateTime('+1 year');
        $department = new Department('foo');

        $sut->setMonth($date);
        $sut->setDepartment($department);
        $sut->setIncludeNoWork(false);

        self::assertEquals($date->getTimestamp(), $sut->getMonth()->getTimestamp());
        self::assertSame($department, $sut->getDepartment());
        self::assertFalse($sut->isIncludeNoWork());

        $sut->setBudgetType('none');
        self::assertEquals('none', $sut->getBudgetType());
        self::assertTrue($sut->isIncludeNoBudget());
        self::assertFalse($sut->isBudgetTypeMonthly());

        $sut->setBudgetType('full');
        self::assertEquals('full', $sut->getBudgetType());
        self::assertFalse($sut->isBudgetTypeMonthly());
        self::assertFalse($sut->isIncludeNoBudget());
    }
}
