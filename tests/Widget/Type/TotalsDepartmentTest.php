<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Widget\Type;

use App\Entity\User;
use App\Repository\DepartmentRepository;
use App\Widget\Type\AbstractWidgetType;
use App\Widget\Type\TotalsDepartment;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(TotalsDepartment::class)]
class TotalsDepartmentTest extends AbstractWidgetTestCase
{
    /** @var User */
    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        $user = new User();
        $user->setAlias('foo');

        $this->user = $user;
    }

    public function createSut(): TotalsDepartment
    {
        return $this->createWidget();
    }

    private function createWidget(int $results = 1): TotalsDepartment
    {
        $repository = $this->createMock(DepartmentRepository::class);
        $repository->expects($this->any())->method('countDepartmentsForQuery')->willReturn($results);

        $widget = new TotalsDepartment($repository);
        $widget->setUser($this->user);

        return $widget;
    }

    public function getDefaultOptions(): array
    {
        return [
            'route' => 'admin_department',
            'icon' => 'department',
            'color' => 'red',
        ];
    }

    protected function assertDefaultData(AbstractWidgetType $sut): void
    {
        self::assertEquals(1, $sut->getData());
    }

    public function testData(): void
    {
        $user = new User();
        $user->setAlias('foo');

        $sut = $this->createWidget(99);
        self::assertEquals('widget/widget-more.html.twig', $sut->getTemplateName());
        $sut->setUser($user);

        self::assertEquals(['view_department', 'view_teamlead_department', 'view_team_department'], $sut->getPermissions());
        self::assertEquals(99, $sut->getData([]));
    }
}
