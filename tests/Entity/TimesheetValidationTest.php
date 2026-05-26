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
use App\Entity\Project;
use App\Entity\Timesheet;
use App\Entity\User;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

#[CoversClass(Timesheet::class)]
#[Group('integration')]
class TimesheetValidationTest extends KernelTestCase
{
    use EntityValidationTestTrait;

    protected function getEntity(): Timesheet
    {
        $department = new Department('Test Department');

        $project = new Project();
        $project->setName('Test Project');
        $project->setDepartment($department);

        $activity = new Activity();
        $activity->setName('Test');
        $activity->setProject($project);

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project);

        return $entity;
    }

    public function testValidationNeedsActivity(): void
    {
        $project = new Project();
        $project->setDepartment(new Department('foo'));

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setProject($project);
        $entity->setBegin(new \DateTime());

        $this->assertHasViolationForField($entity, 'activity');
    }

    public function testValidationNeedsProject(): void
    {
        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity(new Activity());
        $entity->setBegin(new \DateTime());

        $this->assertHasViolationForField($entity, 'project');
    }

    public function testValidationProjectMismatch(): void
    {
        $department = new Department('foo');
        $project = (new Project())->setName('foo')->setDepartment($department);
        $project2 = (new Project())->setName('bar')->setDepartment($department);
        $activity = (new Activity())->setName('hello-world')->setProject($project);

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project2);
        $entity->setBegin(new \DateTime());

        $this->assertHasViolationForField($entity, 'project');
    }

    public function testValidationDepartmentInvisible(): void
    {
        $department = new Department('foo');
        $department->setVisible(false);
        $project = new Project();
        $project->setName('foo');
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setName('hello-world');
        $activity->setProject($project);

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project);
        $entity->setBegin(new \DateTime());
        $entity->setEnd(new \DateTime());

        $this->assertHasViolationForField($entity, 'department');
    }

    private function createStoppedTimesheet(Project $project, Activity $activity, ?int $id = null): Timesheet
    {
        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project);
        $entity->setBegin(new \DateTime());
        $entity->setEnd(new \DateTime());

        if ($id !== null) {
            $o = new \ReflectionClass($entity);
            $p = $o->getProperty('id');
            $p->setAccessible(true);
            $p->setValue($entity, $id);
            $p->setAccessible(false);
        }

        return $entity;
    }

    public function testValidationDepartmentInvisibleDoesNotTriggerOnStoppedEntities(): void
    {
        $department = new Department('foo');
        $department->setVisible(false);
        $project = new Project();
        $project->setName('foo');
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setName('hello-world');
        $activity->setProject($project);

        $entity = $this->createStoppedTimesheet($project, $activity, 99);

        $this->assertHasNoViolations($entity);
    }

    public function testValidationDepartmentInvisibleDoesTriggerOnNewEntities(): void
    {
        $department = new Department('foo');
        $department->setVisible(false);
        $project = new Project();
        $project->setName('foo');
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setName('hello-world');
        $activity->setProject($project);

        $entity = $this->createStoppedTimesheet($project, $activity);

        $this->assertHasViolationForField($entity, 'department');
    }

    public function testValidationProjectInvisible(): void
    {
        $department = new Department('foo');
        $project = (new Project())->setName('foo')->setDepartment($department)->setVisible(false);
        $activity = (new Activity())->setName('hello-world')->setProject($project);

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project);
        $entity->setBegin(new \DateTime());
        $entity->setEnd(new \DateTime());

        $this->assertHasViolationForField($entity, 'project');
    }

    public function testValidationProjectInvisibleDoesNotTriggerOnStoppedEntities(): void
    {
        $department = new Department('foo');
        $project = (new Project())->setName('foo')->setDepartment($department)->setVisible(false);
        $activity = (new Activity())->setName('hello-world')->setProject($project);

        $entity = $this->createStoppedTimesheet($project, $activity, 1);

        $this->assertHasNoViolations($entity);
    }

    public function testValidationProjectInvisibleDoesTriggerOnNewEntities(): void
    {
        $department = new Department('foo');
        $project = (new Project())->setName('foo')->setDepartment($department)->setVisible(false);
        $activity = (new Activity())->setName('hello-world')->setProject($project);

        $entity = $this->createStoppedTimesheet($project, $activity);

        $this->assertHasViolationForField($entity, 'project');
    }

    public function testValidationActivityInvisible(): void
    {
        $department = new Department('foo');
        $project = (new Project())->setName('foo')->setDepartment($department);
        $activity = (new Activity())->setName('hello-world')->setProject($project)->setVisible(false);

        $entity = new Timesheet();
        $entity->setUser(new User());
        $entity->setActivity($activity);
        $entity->setProject($project);
        $entity->setBegin(new \DateTime());
        $entity->setEnd(new \DateTime());

        $this->assertHasViolationForField($entity, 'activity');
    }

    public function testValidationActivityInvisibleDoesNotTriggerOnStoppedEntities(): void
    {
        $department = new Department('foo');
        $project = new Project();
        $project->setName('foo');
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setName('hello-world');
        $activity->setProject($project);
        $activity->setVisible(false);

        $entity = $this->createStoppedTimesheet($project, $activity, 2);

        $this->assertHasNoViolations($entity);
    }

    public function testValidationActivityInvisibleDoesTriggerOnNewEntities(): void
    {
        $department = new Department('foo');
        $project = new Project();
        $project->setName('foo');
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setName('hello-world');
        $activity->setProject($project);
        $activity->setVisible(false);

        $entity = $this->createStoppedTimesheet($project, $activity);

        $this->assertHasViolationForField($entity, 'activity');
    }

    public function testValidationEndNotEarlierThanBegin(): void
    {
        $entity = $this->getEntity();
        $begin = new \DateTime();
        $end = clone $begin;
        $end = $end->modify('-1 second');
        $entity->setBegin($begin);
        $entity->setEnd($end);

        $this->assertHasViolationForField($entity, ['end_date', 'duration']);

        // allow same begin and end
        $entity = $this->getEntity();
        $begin = new \DateTime();
        $end = clone $begin;
        $entity->setBegin($begin);
        $entity->setEnd($end);

        $this->assertHasViolationForField($entity, []);
    }
}
