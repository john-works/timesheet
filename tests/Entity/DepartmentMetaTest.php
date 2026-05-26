<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Entity;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\DepartmentMeta;
use App\Entity\EntityWithMetaFields;
use App\Entity\MetaTableTypeInterface;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(DepartmentMeta::class)]
class DepartmentMetaTest extends AbstractMetaEntityTestCase
{
    protected function getEntity(): EntityWithMetaFields
    {
        return new Department('foo');
    }

    protected function getMetaEntity(): MetaTableTypeInterface
    {
        return new DepartmentMeta();
    }

    public function testSetEntityThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Expected instanceof Department, received "App\Entity\Activity"');

        $sut = new DepartmentMeta();
        $sut->setEntity(new Activity());
    }
}
