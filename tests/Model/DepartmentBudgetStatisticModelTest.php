<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Model;

use App\Entity\Department;
use App\Entity\EntityWithBudget;
use App\Model\BudgetStatisticModel;
use App\Model\DepartmentBudgetStatisticModel;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(DepartmentBudgetStatisticModel::class)]
class DepartmentBudgetStatisticModelTest extends TestCase
{
    /**
     * @param EntityWithBudget $entity
     * @return DepartmentBudgetStatisticModel
     */
    protected function getSut(EntityWithBudget $entity): BudgetStatisticModel
    {
        \assert($entity instanceof Department);

        return new DepartmentBudgetStatisticModel($entity);
    }

    protected function getEntity(): EntityWithBudget
    {
        return new Department('foo');
    }

    public function testAdditionals(): void
    {
        $entity = $this->getEntity();
        $sut = $this->getSut($entity);

        self::assertInstanceOf(Department::class, $sut->getEntity());
        self::assertSame($entity, $sut->getEntity());
        self::assertSame($entity, $sut->getDepartment());
    }
}
