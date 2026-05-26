<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Model;

use App\Model\DepartmentStatistic;
use App\Model\ProjectStatistic;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(ProjectStatistic::class)]
class ProjectStatisticTest extends AbstractTimesheetCountedStatisticTestCase
{
    public function testDefaultValues(): void
    {
        $this->assertDefaultValues(new DepartmentStatistic());
    }

    public function testSetter(): void
    {
        $this->assertSetter(new DepartmentStatistic());
    }

    public function testJsonSerialize(): void
    {
        $this->assertJsonSerialize(new DepartmentStatistic());
    }
}
