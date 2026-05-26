<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Event;

use App\Entity\DepartmentMeta;
use App\Event\AbstractMetaDisplayEvent;
use App\Event\DepartmentMetaDisplayEvent;
use App\Event\MetaDisplayEventInterface;
use App\Repository\Query\DepartmentQuery;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(AbstractMetaDisplayEvent::class)]
#[CoversClass(DepartmentMetaDisplayEvent::class)]
class DepartmentMetaDisplayEventTest extends TestCase
{
    public function testGetterAndSetter(): void
    {
        $query = new DepartmentQuery();
        $sut = new DepartmentMetaDisplayEvent($query, DepartmentMetaDisplayEvent::EXPORT);

        self::assertInstanceOf(MetaDisplayEventInterface::class, $sut);
        self::assertSame($sut->getQuery(), $query);
        self::assertIsArray($sut->getFields());
        self::assertEmpty($sut->getFields());
        self::assertEquals('export', $sut->getLocation());

        $sut->addField(new DepartmentMeta());
        $sut->addField(new DepartmentMeta());

        self::assertCount(2, $sut->getFields());
    }
}
