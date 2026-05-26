<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Repository\Query;

use App\Entity\Department;
use App\Repository\Query\BaseFormTypeQuery;
use App\Repository\Query\DepartmentFormTypeQuery;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(DepartmentFormTypeQuery::class)]
#[CoversClass(BaseFormTypeQuery::class)]
class DepartmentFormTypeQueryTest extends AbstractBaseFormTypeQueryTestCase
{
    public function testQuery(): void
    {
        $sut = new DepartmentFormTypeQuery();

        $this->assertBaseQuery($sut);

        $department = new Department('foo');
        self::assertFalse($sut->isAllowDepartmentPreselect());
        $sut->setAllowDepartmentPreselect(true);
        self::assertTrue($sut->isAllowDepartmentPreselect());
        self::assertNull($sut->getDepartmentToIgnore());
        self::assertInstanceOf(DepartmentFormTypeQuery::class, $sut->setDepartmentToIgnore($department));
        self::assertSame($department, $sut->getDepartmentToIgnore());
    }
}
