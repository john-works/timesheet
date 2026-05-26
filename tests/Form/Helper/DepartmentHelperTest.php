<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Form\Helper;

use App\Entity\Department;
use App\Form\Helper\DepartmentHelper;
use App\Tests\Mocks\SystemConfigurationFactory;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(DepartmentHelper::class)]
class DepartmentHelperTest extends TestCase
{
    private function createSut(string $format): DepartmentHelper
    {
        $config = SystemConfigurationFactory::createStub(['department.choice_pattern' => $format]);
        $helper = new DepartmentHelper($config);

        return $helper;
    }

    public function testInvalidPattern(): void
    {
        $helper = $this->createSut('sdfsdf');
        self::assertEquals(DepartmentHelper::PATTERN_NAME, $helper->getChoicePattern());
    }

    public function testGetChoicePattern(): void
    {
        $helper = $this->createSut(
            DepartmentHelper::PATTERN_NAME . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_COMMENT . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_COMPANY . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_NUMBER
        );

        self::assertEquals(
            DepartmentHelper::PATTERN_NAME . DepartmentHelper::SPACER .
            DepartmentHelper::PATTERN_COMMENT . DepartmentHelper::SPACER .
            DepartmentHelper::PATTERN_COMPANY . DepartmentHelper::SPACER .
            DepartmentHelper::PATTERN_NUMBER,
            $helper->getChoicePattern()
        );
    }

    public function testGetChoiceLabel(): void
    {
        $helper = $this->createSut(
            DepartmentHelper::PATTERN_NAME . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_COMMENT . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_COMPANY . DepartmentHelper::PATTERN_SPACER .
            DepartmentHelper::PATTERN_NUMBER
        );

        $department = new Department(' - --- - -FOO BAR- --- -  -  - ');
        self::assertEquals('--- - -FOO BAR- ---', $helper->getChoiceLabel($department));

        $department = new Department('FOO BAR');
        $department->setComment('Lorem Ipsum');
        self::assertEquals('FOO BAR - Lorem Ipsum', $helper->getChoiceLabel($department));
        $department->setCompany('Acme University');
        self::assertEquals('FOO BAR - Lorem Ipsum - Acme University', $helper->getChoiceLabel($department));
        $department->setNumber('2023-0815');
        self::assertEquals('FOO BAR - Lorem Ipsum - Acme University - 2023-0815', $helper->getChoiceLabel($department));
    }
}
