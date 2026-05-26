<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Repository\Loader;

use App\Entity\Department;
use App\Entity\Project;
use App\Repository\Loader\ProjectLoader;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(ProjectLoader::class)]
class ProjectLoaderTest extends AbstractLoaderTestCase
{
    public function testLoadResults(): void
    {
        $department = $this->createMock(Department::class);
        $department->expects($this->once())->method('getId')->willReturn(13);

        $entity = $this->createMock(Project::class);
        $entity->expects($this->once())->method('getId')->willReturn(1);
        $entity->expects($this->exactly(2))->method('getDepartment')->willReturn($department);

        $results = [$entity];

        $em = $this->getEntityManagerMock(2, $results);

        $sut = new ProjectLoader($em);
        $sut->loadResults([$entity]);
    }
}
