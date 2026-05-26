<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Voter;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use App\Entity\Team;
use App\Entity\User;
use App\Voter\ActivityVoter;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\User\InMemoryUser;

#[CoversClass(ActivityVoter::class)]
class ActivityVoterTest extends AbstractVoterTestCase
{
    #[DataProvider('getTestData')]
    public function testVote(User $user, $subject, $attribute, $result): void
    {
        $this->assertVote($user, $subject, $attribute, $result);
    }

    public function assertVote(User $user, $subject, $attribute, $result): void
    {
        $token = new UsernamePasswordToken($user, 'bar', $user->getRoles());
        $sut = $this->getVoter(ActivityVoter::class);

        self::assertEquals($result, $sut->vote($token, $subject, [$attribute]));
    }

    public static function getTestData()
    {
        $user0 = self::getUser(0, null);
        $user1 = self::getUser(1, User::ROLE_USER);
        $user2 = self::getUser(2, User::ROLE_TEAMLEAD);
        $user3 = self::getUser(3, User::ROLE_ADMIN);
        $user4 = self::getUser(4, User::ROLE_SUPER_ADMIN);

        $result = VoterInterface::ACCESS_GRANTED;
        foreach ([$user3, $user4] as $user) {
            yield [$user, new Activity(), 'view', $result];
            yield [$user, new Activity(), 'edit', $result];
            yield [$user, new Activity(), 'budget', $result];
            yield [$user, new Activity(), 'delete', $result];
        }

        foreach ([$user2] as $user) {
            yield [$user, new Activity(), 'view', $result];
        }

        $result = VoterInterface::ACCESS_DENIED;
        foreach ([$user0, $user1] as $user) {
            yield [$user, new Activity(), 'view', $result];
            yield [$user, new Activity(), 'edit', $result];
            yield [$user, new Activity(), 'budget', $result];
            yield [$user, new Activity(), 'delete', $result];
        }

        foreach ([$user2] as $user) {
            yield [$user, new Activity(), 'edit', $result];
            yield [$user, new Activity(), 'budget', $result];
            yield [$user, new Activity(), 'delete', $result];
        }

        $result = VoterInterface::ACCESS_ABSTAIN;
        foreach ([$user0, $user1, $user2] as $user) {
            yield [$user, new Activity(), 'view_activity', $result];
            yield [$user, new Activity(), 'edit_activity', $result];
            yield [$user, new Activity(), 'budget_activity', $result];
            yield [$user, new Activity(), 'delete_activity', $result];
            yield [$user, new \stdClass(), 'view', $result];
            yield [$user, null, 'edit', $result];
            yield [$user, $user, 'delete', $result];
        }
    }

    public function testTeamlead(): void
    {
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_TEAMLEAD);
        $team->addTeamlead($user);

        $activity = new Activity();
        $project = new Project();
        $department = new Department('foo');
        $project->setDepartment($department);
        $activity->setProject($project);
        $department->addTeam($team);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);

        $activity = new Activity();
        $project = new Project();
        $department = new Department('foo');
        $project->setDepartment($department);
        $activity->setProject($project);
        $project->addTeam($team);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);

        $activity = new Activity();
        $project = new Project();
        $department = new Department('foo');
        $project->setDepartment($department);
        $activity->setProject($project);
        $activity->addTeam($team);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);

        $activity = new Activity();

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_DENIED);
    }

    public function testTeamMember(): void
    {
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_USER);
        $team->addTeamlead($user);

        $activity = new Activity();
        $project = new Project();
        $department = new Department('foo');
        $department->addTeam($team);
        $project->setDepartment($department);
        $activity->setProject($project);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);

        $activity = new Activity();
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_USER);
        $team->addUser($user);

        $project = new Project();
        $department = new Department('foo');
        $project->addTeam($team);
        $project->setDepartment($department);
        $activity->setProject($project);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);

        $activity = new Activity();
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_USER);
        $team->addUser($user);

        $project = new Project();
        $department = new Department('foo');
        $activity->addTeam($team);
        $project->setDepartment($department);
        $activity->setProject($project);

        $this->assertVote($user, $activity, 'edit', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessGrantedWhenAllChainsHaveNoTeams(): void
    {
        $project = new Project();
        $project->setDepartment(new Department('foo'));

        $activity = new Activity();
        $activity->setProject($project);

        $this->assertVote(new User(), $activity, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessGrantedWhenActivityHasNoProject(): void
    {
        // checkTeamAccessActivity() skips the project chain when activity->getProject() is null.
        $activity = new Activity();

        $this->assertVote(new User(), $activity, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessGrantedForCanSeeAllDataDespiteRestrictiveChain(): void
    {
        $department = new Department('foo');
        $department->addTeam(new Team('departmentTeam'));

        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('projectTeam'));

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('activityTeam'));

        $user = new User();
        $user->initCanSeeAllData(true);

        $this->assertVote($user, $activity, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessGrantedAsMemberOfFullChain(): void
    {
        $departmentTeam = new Team('departmentTeam');
        $department = new Department('foo');
        $department->addTeam($departmentTeam);

        $projectTeam = new Team('projectTeam');
        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam($projectTeam);

        $activityTeam = new Team('activityTeam');
        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam($activityTeam);

        $user = new User();
        $departmentTeam->addUser($user);
        $projectTeam->addUser($user);
        $activityTeam->addUser($user);

        $this->assertVote($user, $activity, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessDeniedWhenDepartmentTeamBlocks(): void
    {
        $department = new Department('foo');
        $department->addTeam(new Team('departmentTeam'));

        $project = new Project();
        $project->setDepartment($department);

        $activity = new Activity();
        $activity->setProject($project);

        $this->assertVote(new User(), $activity, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessDeniedWhenProjectTeamBlocks(): void
    {
        $departmentTeam = new Team('departmentTeam');
        $department = new Department('foo');
        $department->addTeam($departmentTeam);

        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam(new Team('projectTeam'));

        $activity = new Activity();
        $activity->setProject($project);

        $user = new User();
        $departmentTeam->addUser($user);

        $this->assertVote($user, $activity, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessDeniedWhenActivityTeamBlocks(): void
    {
        $departmentTeam = new Team('departmentTeam');
        $department = new Department('foo');
        $department->addTeam($departmentTeam);

        $projectTeam = new Team('projectTeam');
        $project = new Project();
        $project->setDepartment($department);
        $project->addTeam($projectTeam);

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('activityTeam'));

        $user = new User();
        $departmentTeam->addUser($user);
        $projectTeam->addUser($user);

        $this->assertVote($user, $activity, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessDeniedWhenActivityTeamsExistAndUserOnlyInUnrelatedTeam(): void
    {
        $project = new Project();
        $project->setDepartment(new Department('foo'));

        $activity = new Activity();
        $activity->setProject($project);
        $activity->addTeam(new Team('activityTeam'));

        $unrelated = new Team('unrelated');
        $user = new User();
        $unrelated->addUser($user);

        $this->assertVote($user, $activity, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessDeniedForNonUserToken(): void
    {
        $activity = new Activity();
        $token = new UsernamePasswordToken(new InMemoryUser('anon', null), 'bar', []);
        $sut = $this->getVoter(ActivityVoter::class);

        self::assertEquals(VoterInterface::ACCESS_DENIED, $sut->vote($token, $activity, ['access']));
    }
}
