<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Entity;

use App\Constants;
use App\Entity\Department;
use App\Entity\Project;
use App\Entity\ProjectMeta;
use App\Entity\Team;
use App\Export\Spreadsheet\ColumnDefinition;
use App\Export\Spreadsheet\Extractor\AnnotationExtractor;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(Project::class)]
class ProjectTest extends AbstractEntityTestCase
{
    public function testDefaultValues(): void
    {
        $sut = new Project();
        self::assertNull($sut->getId());
        self::assertNull($sut->getDepartment());
        self::assertNull($sut->getName());
        self::assertNull($sut->getOrderNumber());
        self::assertNull($sut->getOrderDate());
        self::assertNull($sut->getStart());
        self::assertNull($sut->getEnd());
        self::assertNull($sut->getComment());
        self::assertNull($sut->getInvoiceText());
        self::assertTrue($sut->isVisible());
        self::assertTrue($sut->isBillable());
        self::assertTrue($sut->isGlobalActivities());
        self::assertNull($sut->getColor());
        self::assertIsString($sut->getColorSafe());
        self::assertFalse($sut->hasColor());
        self::assertInstanceOf(Collection::class, $sut->getMetaFields());
        self::assertEquals(0, $sut->getMetaFields()->count());
        self::assertNull($sut->getMetaField('foo'));
        self::assertInstanceOf(Collection::class, $sut->getTeams());
        self::assertEquals(0, $sut->getTeams()->count());
        self::assertTrue($sut->isVisibleAtDate(new \DateTime()));
    }

    public function testBudgets(): void
    {
        $this->assertBudget(new Project());
    }

    public function testSetterAndGetter(): void
    {
        $sut = new Project();

        $department = new Department('department');
        self::assertInstanceOf(Project::class, $sut->setDepartment($department));
        self::assertSame($department, $sut->getDepartment());

        self::assertFalse($sut->hasColor());
        $sut->setColor('#fffccc');
        self::assertEquals('#fffccc', $sut->getColor());
        self::assertIsString($sut->getColorSafe());
        self::assertTrue($sut->hasColor());

        $sut->setColor(Constants::DEFAULT_COLOR);
        self::assertNull($sut->getColor());
        self::assertFalse($sut->hasColor());

        self::assertInstanceOf(Project::class, $sut->setName('123456789'));
        self::assertEquals('123456789', (string) $sut);

        self::assertEquals('#FF9800', $sut->getColorSafe());

        self::assertInstanceOf(Project::class, $sut->setOrderNumber('123456789'));
        self::assertEquals('123456789', $sut->getOrderNumber());

        $dateTime = new \DateTime('-1 year');
        self::assertInstanceOf(Project::class, $sut->setOrderDate($dateTime));
        self::assertSame($dateTime, $sut->getOrderDate());
        self::assertInstanceOf(Project::class, $sut->setOrderDate(null));
        self::assertNull($sut->getOrderDate());

        self::assertInstanceOf(Project::class, $sut->setStart($dateTime));
        self::assertSame($dateTime, $sut->getStart());
        self::assertInstanceOf(Project::class, $sut->setStart(null));
        self::assertNull($sut->getStart());

        self::assertInstanceOf(Project::class, $sut->setEnd($dateTime));
        self::assertSame($dateTime, $sut->getEnd());
        self::assertInstanceOf(Project::class, $sut->setEnd(null));
        self::assertNull($sut->getEnd());

        self::assertInstanceOf(Project::class, $sut->setComment('a comment'));
        self::assertEquals('a comment', $sut->getComment());

        $sut->setInvoiceText('very long invoice text comment 12324');
        self::assertEquals('very long invoice text comment 12324', $sut->getInvoiceText());

        self::assertInstanceOf(Project::class, $sut->setVisible(false));
        self::assertFalse($sut->isVisible());

        $sut->setVisible(false);
        self::assertFalse($sut->isVisible());
        $sut->setVisible(true);
        self::assertTrue($sut->isVisible());

        $sut->setGlobalActivities(false);
        self::assertFalse($sut->isGlobalActivities());
    }

    public function testMetaFields(): void
    {
        $sut = new Project();
        $meta = new ProjectMeta();
        $meta->setName('foo')->setValue('bar2')->setType('test');
        self::assertInstanceOf(Project::class, $sut->setMetaField($meta));
        self::assertEquals(1, $sut->getMetaFields()->count());
        $result = $sut->getMetaField('foo');
        self::assertSame($result, $meta);
        self::assertEquals('test', $result->getType());
        self::assertEquals('bar2', $result->getValue());

        $meta2 = new ProjectMeta();
        $meta2->setName('foo')->setValue('bar')->setType('test2');
        self::assertInstanceOf(Project::class, $sut->setMetaField($meta2));
        self::assertEquals(1, $sut->getMetaFields()->count());
        self::assertCount(0, $sut->getVisibleMetaFields());

        $result = $sut->getMetaField('foo');
        self::assertSame($result, $meta);
        self::assertEquals('test2', $result->getType());

        $sut->setMetaField((new ProjectMeta())->setName('blub')->setIsVisible(true));
        $sut->setMetaField((new ProjectMeta())->setName('blab')->setIsVisible(true));
        self::assertEquals(3, $sut->getMetaFields()->count());
        self::assertCount(2, $sut->getVisibleMetaFields());
    }

    public function testTeams(): void
    {
        $sut = new Project();
        $team = new Team('foo');
        self::assertEmpty($sut->getTeams());
        self::assertEmpty($team->getProjects());

        $sut->addTeam($team);
        self::assertCount(1, $sut->getTeams());
        self::assertCount(1, $team->getProjects());
        self::assertSame($team, $sut->getTeams()[0]);
        self::assertSame($sut, $team->getProjects()[0]);

        // test remove unknown team doesn't do anything
        $sut->removeTeam(new Team('foo'));
        self::assertCount(1, $sut->getTeams());
        self::assertCount(1, $team->getProjects());

        $sut->removeTeam($team);
        self::assertCount(0, $sut->getTeams());
        self::assertCount(0, $team->getProjects());
    }

    public function testExportAnnotations(): void
    {
        $sut = new AnnotationExtractor();

        $columns = $sut->extract(Project::class);

        self::assertIsArray($columns);

        $expected = [
            ['id', 'integer'],
            ['name', 'string'],
            ['department', 'string'],
            ['orderNumber', 'string'],
            ['orderDate', 'date'],
            ['project_start', 'date'],
            ['project_end', 'date'],
            ['budget', 'float'],
            ['timeBudget', 'duration'],
            ['budgetType', 'string'],
            ['color', 'string'],
            ['visible', 'boolean'],
            ['comment', 'string'],
            ['billable', 'boolean'],
            ['project_number', 'string'],
        ];

        self::assertCount(\count($expected), $columns);

        foreach ($columns as $column) {
            self::assertInstanceOf(ColumnDefinition::class, $column);
        }

        $i = 0;

        foreach ($expected as $item) {
            $column = $columns[$i++];
            self::assertEquals($item[0], $column->getLabel());
            self::assertEquals($item[1], $column->getType());
        }
    }

    public function testClone(): void
    {
        $department = new Department('prj-department');
        $department->setVatId('DE-0123456789');

        $sut = new Project();
        $sut->setName('foo');
        $sut->setOrderNumber('1234567890');
        $sut->setBudget(123.45);
        $sut->setTimeBudget(12345);
        $sut->setVisible(false);
        $sut->setEnd(new \DateTime());
        $sut->setColor('#ccc');

        $sut->setDepartment($department);

        $team = new Team('foo');
        $sut->addTeam($team);

        $meta = new ProjectMeta();
        $meta->setName('blabla');
        $meta->setValue('1234567890');
        $meta->setIsVisible(false);
        $meta->setIsRequired(true);
        $sut->setMetaField($meta);

        $clone = clone $sut;

        foreach ($sut->getMetaFields() as $metaField) {
            $cloneMeta = $clone->getMetaField($metaField->getName());
            self::assertEquals($cloneMeta->getValue(), $metaField->getValue());
        }
        self::assertEquals($clone->getBudget(), $sut->getBudget());
        self::assertEquals($clone->getTimeBudget(), $sut->getTimeBudget());
        self::assertEquals($clone->getEnd(), $sut->getEnd());
        self::assertEquals($clone->getColor(), $sut->getColor());
        self::assertEquals('DE-0123456789', $clone->getDepartment()->getVatId());
        self::assertEquals('prj-department', $clone->getDepartment()->getName());
    }

    public function testIsVisibleAtDateTime(): void
    {
        $now = new \DateTime();

        $department = new Department('foo');

        $sut = new Project();
        $sut->setVisible(false);
        self::assertFalse($sut->isVisibleAtDate($now));
        $sut->setVisible(true);
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setDepartment($department);
        self::assertTrue($sut->isVisibleAtDate($now));
        $department->setVisible(false);
        self::assertFalse($sut->isVisibleAtDate($now));
        $department->setVisible(true);
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setEnd(new \DateTime('+1 hour'));
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setEnd($now);
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setEnd(new \DateTime('-1 hour'));
        self::assertFalse($sut->isVisibleAtDate($now));
        $sut->setEnd(new \DateTime('+1 hour'));
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setStart(new \DateTime('-1 hour'));
        self::assertTrue($sut->isVisibleAtDate($now));
        $sut->setStart(new \DateTime('+1 hour'));
        self::assertFalse($sut->isVisibleAtDate($now));
    }
}
