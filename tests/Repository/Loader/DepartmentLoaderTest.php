<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Repository\Loader;

use App\Entity\Department;
use App\Repository\Loader\DepartmentLoader;
use App\Repository\Query\DepartmentQuery;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(DepartmentLoader::class)]
class DepartmentLoaderTest extends AbstractLoaderTestCase
{
    public function testLoadResults(): void
    {
        $em = $this->getEntityManagerMock(0);

        $query = new DepartmentQuery();
        $query->loadTeams();

        $sut = new DepartmentLoader($em, $query);

        $entity = $this->createMock(Department::class);

        $sut->loadResults([$entity]);
    }

    public function testLoadResultsWithMocks(): void
    {
        $em = $this->getEntityManagerMock(1);

        $query = new DepartmentQuery();
        $query->loadTeams();

        $sut = new DepartmentLoader($em, $query);

        $entity = $this->createMock(Department::class);
        $entity->method('getId')->willReturn(1);

        $entity2 = $this->createMock(Department::class);
        $entity->method('getId')->willReturn(2);

        $sut->loadResults([$entity, $entity2]);
    }
}
