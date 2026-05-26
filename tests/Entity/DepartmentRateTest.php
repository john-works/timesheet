<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Entity;

use App\Entity\Department;
use App\Entity\DepartmentRate;
use App\Entity\Rate;
use App\Entity\User;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(Rate::class)]
#[CoversClass(DepartmentRate::class)]
class DepartmentRateTest extends TestCase
{
    public function testDefaultValues(): void
    {
        $sut = new DepartmentRate();
        self::assertNull($sut->getId());
        self::assertEquals(0.00, $sut->getRate());
        self::assertNull($sut->getInternalRate());
        self::assertNull($sut->getDepartment());
        self::assertNull($sut->getUser());
        self::assertEquals(1, $sut->getScore());
        self::assertFalse($sut->isFixed());
    }

    public function testSetterAndGetter(): void
    {
        $sut = new DepartmentRate();

        self::assertInstanceOf(DepartmentRate::class, $sut->setIsFixed(true));
        self::assertTrue($sut->isFixed());

        self::assertInstanceOf(DepartmentRate::class, $sut->setRate(12.34));
        self::assertEquals(12.34, $sut->getRate());

        self::assertInstanceOf(DepartmentRate::class, $sut->setInternalRate(7.12));
        self::assertEquals(7.12, $sut->getInternalRate());
        $sut->setInternalRate(null);
        self::assertNull($sut->getInternalRate());

        $user = new User();
        $user->setAlias('foo');
        $user->setUserIdentifier('bar');
        self::assertInstanceOf(DepartmentRate::class, $sut->setUser($user));
        self::assertSame($user, $sut->getUser());
        $sut->setUser(null);
        self::assertNull($sut->getUser());

        $entity = new Department('foo');
        self::assertInstanceOf(DepartmentRate::class, $sut->setDepartment($entity));
        self::assertSame($entity, $sut->getDepartment());
    }
}
