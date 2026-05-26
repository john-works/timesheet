<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Security;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use App\Entity\Team;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\RolePermissionRepository;
use App\Security\RolePermissionManager;
use App\User\PermissionService;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

#[CoversClass(RolePermissionManager::class)]
class RolePermissionManagerTest extends TestCase
{
    public function testWithEmptyRepository(): void
    {
        $repository = $this->getMockBuilder(RolePermissionRepository::class)->onlyMethods(['getAllAsArray'])->disableOriginalConstructor()->getMock();
        $repository->method('getAllAsArray')->willReturn([]);
        /** @var RolePermissionRepository $repository */
        $service = new PermissionService($repository, new ArrayAdapter());

        $sut = new RolePermissionManager($service, [], []);
        self::assertFalse($sut->isRegisteredPermission('foo'));
        self::assertEquals([], $sut->getPermissions());
        self::assertFalse($sut->hasPermission('TEST_ROLE', 'foo'));
    }

    public function testWithRepositoryData(): void
    {
        $repository = $this->getMockBuilder(RolePermissionRepository::class)->onlyMethods(['getAllAsArray'])->disableOriginalConstructor()->getMock();
        $repository->method('getAllAsArray')->willReturn([
            ['permission' => 'foo', 'role' => 'TEST_ROLE', 'allowed' => true],
            ['permission' => 'bar', 'role' => 'USER_ROLE', 'allowed' => true],
            ['permission' => 'foo', 'role' => 'USER_ROLE', 'allowed' => false],
        ]);
        /** @var RolePermissionRepository $repository */
        $service = new PermissionService($repository, new ArrayAdapter());

        $sut = new RolePermissionManager($service, [], []);

        // only data injected through the config will be registered as "known"
        self::assertFalse($sut->isRegisteredPermission('foo'));
        self::assertFalse($sut->isRegisteredPermission('bar'));
        self::assertEquals([], $sut->getPermissions());

        self::assertTrue($sut->hasPermission('TEST_ROLE', 'foo'));
        self::assertFalse($sut->hasPermission('USER_ROLE', 'foo'));
        self::assertTrue($sut->hasPermission('USER_ROLE', 'bar'));
    }

    public function testWithConfigData(): void
    {
        $repository = $this->getMockBuilder(RolePermissionRepository::class)->onlyMethods(['getAllAsArray'])->disableOriginalConstructor()->getMock();
        $repository->method('getAllAsArray')->willReturn([]);
        /** @var RolePermissionRepository $repository */
        $service = new PermissionService($repository, new ArrayAdapter());

        $sut = new RolePermissionManager($service, ['TEST_ROLE' => ['foo' => true], 'USER_ROLE' => ['bar' => true]], ['foo' => true, 'bar' => true]);

        self::assertTrue($sut->isRegisteredPermission('foo'));
        self::assertTrue($sut->isRegisteredPermission('bar'));
        self::assertEquals(['foo', 'bar'], $sut->getPermissions());

        self::assertTrue($sut->hasPermission('TEST_ROLE', 'foo'));
        self::assertFalse($sut->hasPermission('TEST_ROLE', 'bar'));
        self::assertFalse($sut->hasPermission('USER_ROLE', 'foo'));
        self::assertTrue($sut->hasPermission('USER_ROLE', 'bar'));
    }

    public function testWithMixedData(): void
    {
        $repository = $this->getMockBuilder(RolePermissionRepository::class)->onlyMethods(['getAllAsArray'])->disableOriginalConstructor()->getMock();
        $repository->method('getAllAsArray')->willReturn([
            ['permission' => 'foo', 'role' => 'TEST_ROLE', 'allowed' => false],
            ['permission' => 'bar', 'role' => 'USER_ROLE', 'allowed' => true],
            ['permission' => 'foo', 'role' => 'USER_ROLE', 'allowed' => false],
            ['permission' => 'role_permissions', 'role' => 'ROLE_SUPER_ADMIN', 'allowed' => false],
            ['permission' => 'view_user', 'role' => 'ROLE_SUPER_ADMIN', 'allowed' => false],
            ['permission' => 'create_user', 'role' => 'ROLE_SUPER_ADMIN', 'allowed' => false],
        ]);
        /** @var RolePermissionRepository $repository */
        $service = new PermissionService($repository, new ArrayAdapter());

        $sut = new RolePermissionManager($service, [
            'ROLE_SUPER_ADMIN' => ['role_permissions' => true, 'view_user' => true, 'create_user' => true],
            'TEST_ROLE' => ['foo2' => true, 'foo' => true],
            'USER_ROLE' => ['foo' => true, 'bar' => true]
        ], ['role_permissions' => true, 'view_user' => true, 'create_user' => true, 'foo2' => true, 'foo' => true, 'bar' => true]);

        $user = new User();
        $user->addRole('TEST_ROLE');
        $user->addRole('FFOOOOOO');

        self::assertTrue($sut->isRegisteredPermission('foo'));
        self::assertTrue($sut->isRegisteredPermission('bar'));
        self::assertEquals(['role_permissions', 'view_user', 'create_user', 'foo2', 'foo', 'bar'], array_values($sut->getPermissions()));

        self::assertTrue($sut->hasPermission('TEST_ROLE', 'foo2'));
        self::assertTrue($sut->hasRolePermission($user, 'foo2'));
        self::assertFalse($sut->hasRolePermission($user, 'foo'));
        self::assertFalse($sut->hasPermission('TEST_ROLE', 'foo'));
        self::assertFalse($sut->hasPermission('USER_ROLE', 'foo'));
        self::assertTrue($sut->hasPermission('USER_ROLE', 'bar'));
        self::assertFalse($sut->hasPermission('ROLE_SUPER_ADMIN', 'create_user'));

        // the next two are a special case, which might never be falsified by the database
        self::assertTrue($sut->hasPermission('ROLE_SUPER_ADMIN', 'role_permissions'));
        self::assertTrue($sut->hasPermission('ROLE_SUPER_ADMIN', 'view_user'));
    }

    public function testCheckTeamAccessDepartmentAllowsUsersWithGlobalAccess(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $department->addTeam(new Team('Support'));

        $user = new User();
        self::assertFalse($sut->checkTeamAccessDepartment($department, $user));
        $user->initCanSeeAllData(true);
        self::assertTrue($sut->checkTeamAccessDepartment($department, $user));
    }

    public function testCheckTeamAccessDepartmentAllowsAccessWithoutAssignedTeams(): void
    {
        $sut = $this->createSut();

        self::assertTrue($sut->checkTeamAccessDepartment(new Department('Acme'), new User()));
    }

    public function testCheckTeamAccessDepartmentRequiresMembershipForAssignedTeams(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $team = new Team('Support');
        $department->addTeam($team);

        $user = new User();
        self::assertFalse($sut->checkTeamAccessDepartment($department, new User()));

        self::assertFalse($sut->checkTeamAccessDepartment($department, $user));
        $team->addUser($user);
        self::assertTrue($sut->checkTeamAccessDepartment($department, $user));
    }

    public function testCheckTeamAccessProjectDeniesAccessIfDepartmentIsDenied(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);

        $user = new User();
        $projectTeam->addUser($user);

        self::assertFalse($sut->checkTeamAccessProject($project, $user));
    }

    public function testCheckTeamAccessProjectAllowsUsersWithGlobalAccess(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));

        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('Project team'));

        $user = new User();
        self::assertFalse($sut->checkTeamAccessProject($project, $user));
        $user->initCanSeeAllData(true);
        self::assertTrue($sut->checkTeamAccessProject($project, $user));
    }

    public function testCheckTeamAccessProjectAllowsMatchingProjectTeamAfterDepartmentAccess(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);

        $user = new User();
        $departmentTeam->addUser($user);
        $projectTeam->addUser($user);

        self::assertTrue($sut->checkTeamAccessProject($project, $user));
    }

    public function testCheckTeamAccessActivityDeniesAccessIfProjectIsDenied(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);

        $activity = new Activity();
        $activity->setProject($project);
        $activityTeam = new Team('Activity team');
        $activity->addTeam($activityTeam);

        $user = new User();
        $activityTeam->addUser($user);

        self::assertFalse($sut->checkTeamAccessActivity($activity, $user));
    }

    public function testCheckTeamAccessActivityAllowsUsersWithGlobalAccess(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));

        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('Project team'));

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('Activity team'));

        $user = new User();
        self::assertFalse($sut->checkTeamAccessActivity($activity, $user));
        $user->initCanSeeAllData(true);
        self::assertTrue($sut->checkTeamAccessActivity($activity, $user));
    }

    public function testCheckTeamAccessActivityAllowsMatchingActivityTeamAfterProjectAccess(): void
    {
        $sut = $this->createSut();
        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);

        $activity = new Activity();
        $activity->setProject($project);
        $activityTeam = new Team('Activity team');
        $activity->addTeam($activityTeam);

        $user = new User();
        $departmentTeam->addUser($user);
        $projectTeam->addUser($user);
        $activityTeam->addUser($user);

        self::assertTrue($sut->checkTeamAccessActivity($activity, $user));
    }

    public function testCheckTeamAccessTimesheetGrantsAccessForOwner(): void
    {
        $sut = $this->createSut();

        $owner = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $owner));
    }

    public function testCheckTeamAccessTimesheetGrantsForOwnerEvenWithBlockingTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(42);
        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));
        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('Project team'));
        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('Activity team'));

        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        // Owner is not in any of the department/project/activity teams and is only
        // a member (not teamlead) of his own team — must still be granted access
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $owner));
    }

    public function testCheckTeamAccessTimesheetGrantsForDifferentInstancesWithSameId(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(42);
        $requester = self::userWithId(42);
        // Make sure the requester does not pass via canSeeAllData or team membership.
        self::assertNotSame($owner, $requester);

        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));
        $project = new Project();
        $project->setDepartment($department);
        $activity = new Activity();
        $activity->setProject($project);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsForCanSeeAllData(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);

        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));
        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('Project team'));
        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('Activity team'));

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        $requester = self::userWithId(2);
        $requester->initCanSeeAllData(true);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsForCanSeeAllDataWithEmptyTimesheet(): void
    {
        $sut = $this->createSut();

        $requester = self::userWithId(2);
        $requester->initCanSeeAllData(true);

        $timesheet = new Timesheet();

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenDepartmentTeamRestricts(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $department = new Department('Acme');
        $department->addTeam(new Team('Department team'));

        $project = new Project();
        $project->setDepartment($department);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);

        // Even if requester would be a teamlead of the timesheet user's team, the
        // department gate must still deny.
        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);
        $ownerTeam->addTeamlead($requester);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenProjectTeamRestricts(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $project = new Project();
        $project->setDepartment(new Department('Acme'));
        $project->addTeam(new Team('Project team'));

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenDepartmentOkButProjectRestricts(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);
        $departmentTeam->addUser($requester);

        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('Project team'));

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetPassesProjectGateWithoutTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        // No department team, no project team -> project gate is permissive.
        $project = new Project();
        $project->setDepartment(new Department('Acme'));

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);

        // Owner has no teams -> teamlead gate is permissive too.
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenActivityTeamRestricts(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $project = new Project();
        $project->setDepartment(new Department('Acme'));

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('Activity team'));

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetPassesActivityGateWithoutTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $project = new Project();
        $project->setDepartment(new Department('Acme'));

        $activity = new Activity();
        $activity->setProject($project);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetActivityChainsThroughItsProjectAndDepartment(): void
    {
        // checkTeamAccessActivity walks activity -> project -> department. Even when
        // the timesheet's project gate already passed, the activity must re-pass
        // its own project's department gate.
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        // Timesheet's own project is unrestricted.
        $timesheetProject = new Project();
        $timesheetProject->setDepartment(new Department('Acme'));

        // Activity is wired to a different project whose department locks out the requester.
        $blockedDepartment = new Department('Blocked');
        $blockedDepartment->addTeam(new Team('Blocked department team'));
        $activityProject = new Project();
        $activityProject->setDepartment($blockedDepartment);

        $activity = new Activity();
        $activity->setProject($activityProject);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($timesheetProject);
        $timesheet->setActivity($activity);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsWhenTimesheetUserHasNoTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        // Owner has no team memberships -> teamlead gate returns true.
        self::assertSame([], $owner->getTeams());
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesPlainMemberOfTimesheetUserTeam(): void
    {
        // Headline behaviour: plain team membership is NOT enough — the requester
        // must be a teamlead.
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $sharedTeam = new Team('Shared');
        $sharedTeam->addUser($owner);
        $sharedTeam->addUser($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertTrue($requester->isInTeam($sharedTeam));
        self::assertFalse($requester->isTeamleadOf($sharedTeam));
        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsTeamleadOfTimesheetUserTeam(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $sharedTeam = new Team('Shared');
        $sharedTeam->addUser($owner);
        $sharedTeam->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertTrue($requester->isTeamleadOf($sharedTeam));
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsTeamleadOfOneOfMultipleTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $teamA = new Team('A');
        $teamB = new Team('B');
        $teamA->addUser($owner);
        $teamB->addUser($owner);
        $teamA->addUser($requester);
        $teamB->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenTeamleadOfNoneOfMultipleTeams(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $teamA = new Team('A');
        $teamB = new Team('B');
        $teamA->addUser($owner);
        $teamB->addUser($owner);
        $teamA->addUser($requester);
        $teamB->addUser($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenTeamleadOfUnrelatedTeam(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);

        $unrelatedTeam = new Team('Unrelated');
        $unrelatedTeam->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertFalse($requester->isInTeam($ownerTeam));
        self::assertFalse($requester->isTeamleadOf($ownerTeam));
        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsWhenTimesheetUserIsNullAndNoProjectActivity(): void
    {
        // Documents current behaviour: an orphaned timesheet (no user) bypasses
        // the teamlead gate because getTeams() ?? [] is empty.
        $sut = $this->createSut();

        $requester = self::userWithId(2);
        $timesheet = new Timesheet();

        self::assertNull($timesheet->getUser());
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesWhenTimesheetUserNullButProjectRestricts(): void
    {
        $sut = $this->createSut();

        $requester = self::userWithId(2);

        $project = new Project();
        $project->setDepartment(new Department('Acme'));
        $project->addTeam(new Team('Project team'));

        $timesheet = new Timesheet();
        $timesheet->setProject($project);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsWithoutProjectAndActivityWhenTeamlead(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $sharedTeam = new Team('Shared');
        $sharedTeam->addUser($owner);
        $sharedTeam->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);

        self::assertNull($timesheet->getProject());
        self::assertNull($timesheet->getActivity());
        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetGrantsFullChainAsMemberAndTeamlead(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);
        $departmentTeam->addUser($requester);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);
        $projectTeam->addUser($requester);

        $activity = new Activity();
        $activity->setProject($project);
        $activityTeam = new Team('Activity team');
        $activity->addTeam($activityTeam);
        $activityTeam->addUser($requester);

        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);
        $ownerTeam->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertTrue($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesFullChainMissingActivityTeam(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);
        $departmentTeam->addUser($requester);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);
        $projectTeam->addUser($requester);

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('Activity team')); // requester missing

        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);
        $ownerTeam->addTeamlead($requester);

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    public function testCheckTeamAccessTimesheetDeniesFullChainOnlyMemberNotTeamlead(): void
    {
        $sut = $this->createSut();

        $owner = self::userWithId(1);
        $requester = self::userWithId(2);

        $department = new Department('Acme');
        $departmentTeam = new Team('Department team');
        $department->addTeam($departmentTeam);
        $departmentTeam->addUser($requester);

        $project = new Project();
        $project->setDepartment($department);
        $projectTeam = new Team('Project team');
        $project->addTeam($projectTeam);
        $projectTeam->addUser($requester);

        $activity = new Activity();
        $activity->setProject($project);
        $activityTeam = new Team('Activity team');
        $activity->addTeam($activityTeam);
        $activityTeam->addUser($requester);

        $ownerTeam = new Team('Owner team');
        $ownerTeam->addUser($owner);
        $ownerTeam->addUser($requester); // plain member only

        $timesheet = new Timesheet();
        $timesheet->setUser($owner);
        $timesheet->setProject($project);
        $timesheet->setActivity($activity);

        self::assertFalse($sut->checkTeamAccessTimesheet($timesheet, $requester));
    }

    private static function userWithId(int $id): User
    {
        $user = new User();
        $reflection = new \ReflectionClass($user);
        $property = $reflection->getProperty('id');
        $property->setAccessible(true);
        $property->setValue($user, $id);

        return $user;
    }

    private function createSut(): RolePermissionManager
    {
        $repository = $this->getMockBuilder(RolePermissionRepository::class)->onlyMethods(['getAllAsArray'])->disableOriginalConstructor()->getMock();
        $repository->method('getAllAsArray')->willReturn([]);

        return new RolePermissionManager(new PermissionService($repository, new ArrayAdapter()), [], []);
    }
}
