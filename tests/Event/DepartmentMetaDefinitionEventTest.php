<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Event;

use App\Entity\Department;
use App\Event\DepartmentMetaDefinitionEvent;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(DepartmentMetaDefinitionEvent::class)]
class DepartmentMetaDefinitionEventTest extends TestCase
{
    public function testGetterAndSetter(): void
    {
        $department = new Department('foo');
        $sut = new DepartmentMetaDefinitionEvent($department);
        self::assertSame($department, $sut->getEntity());
    }
}
