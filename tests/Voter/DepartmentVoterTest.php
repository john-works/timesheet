<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Voter;

use App\Entity\Department;
use App\Entity\Team;
use App\Entity\User;
use App\Voter\DepartmentVoter;
use PHPUnit\Framework\Attributes\CoversClass;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\User\InMemoryUser;

#[CoversClass(DepartmentVoter::class)]
class DepartmentVoterTest extends AbstractVoterTestCase
{
    public function assertVote(User $user, $subject, $attribute, $result): void
    {
        $token = new UsernamePasswordToken($user, 'bar', $user->getRoles());
        $sut = $this->getVoter(DepartmentVoter::class);

        $actual = $sut->vote($token, $subject, [$attribute]);
        self::assertEquals($result, $actual, \sprintf('Failed voting "%s" for User with roles %s.', $attribute, implode(', ', $user->getRoles())));
    }

    public function testVote(): void
    {
        $userNoRole = self::getUser(0, 'foo');
        $userStandard = self::getUser(1, User::ROLE_USER);
        $userTeamlead = self::getUser(2, User::ROLE_TEAMLEAD);
        $userAdmin = self::getUser(3, User::ROLE_ADMIN);
        $userSuperAdmin = self::getUser(4, User::ROLE_SUPER_ADMIN);

        $result = VoterInterface::ACCESS_GRANTED;
        foreach ([$userAdmin, $userSuperAdmin] as $user) {
            $this->assertVote($user, new Department('foo'), 'view', $result);
            $this->assertVote($user, new Department('foo'), 'edit', $result);
            $this->assertVote($user, new Department('foo'), 'budget', $result);
            $this->assertVote($user, new Department('foo'), 'delete', $result);
        }

        $team = new Team('foo');
        $team->addTeamlead($userTeamlead);
        foreach ([$userTeamlead] as $user) {
            $department = new Department('foo');
            $team->addDepartment($department);
            $this->assertVote($user, $department, 'view', $result);
            $team->removeDepartment($department);
        }

        $userTeamlead = self::getUser(2, User::ROLE_TEAMLEAD);

        $result = VoterInterface::ACCESS_DENIED;
        foreach ([$userNoRole, $userStandard] as $user) {
            $this->assertVote($user, new Department('foo'), 'view', $result);
            $this->assertVote($user, new Department('foo'), 'edit', $result);
            $this->assertVote($user, new Department('foo'), 'budget', $result);
            $this->assertVote($user, new Department('foo'), 'delete', $result);
        }

        foreach ([$userTeamlead] as $user) {
            $this->assertVote($user, new Department('foo'), 'edit', $result);
            $this->assertVote($user, new Department('foo'), 'budget', $result);
            $this->assertVote($user, new Department('foo'), 'delete', $result);
        }

        $result = VoterInterface::ACCESS_ABSTAIN;
        foreach ([$userNoRole, $userStandard, $userTeamlead] as $user) {
            $this->assertVote($user, new Department('foo'), 'view_department', $result);
            $this->assertVote($user, new Department('foo'), 'edit_department', $result);
            $this->assertVote($user, new Department('foo'), 'budget_department', $result);
            $this->assertVote($user, new Department('foo'), 'delete_department', $result);
            $this->assertVote($user, new \stdClass(), 'view', $result);
            $this->assertVote($user, null, 'edit', $result);
            $this->assertVote($user, $user, 'delete', $result);
        }
    }

    public function testTeamlead(): void
    {
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_TEAMLEAD);
        $team->addTeamlead($user);

        $department = new Department('foo');
        $department->addTeam($team);

        $this->assertVote($user, $department, 'edit', VoterInterface::ACCESS_GRANTED);
    }

    public function testTeamMember(): void
    {
        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_USER);
        $team->addTeamlead($user);

        $department = new Department('foo');
        $department->addTeam($team);

        $this->assertVote($user, $department, 'edit', VoterInterface::ACCESS_GRANTED);

        $team = new Team('foo');
        $user = new User();
        $user->addRole(User::ROLE_USER);
        $team->addUser($user);

        $department = new Department('foo');
        $department->addTeam($team);

        $this->assertVote($user, $department, 'edit', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccess(): void
    {
        // ALLOW: department has no teams
        $this->assertVote(new User(), new Department('foo'), 'access', VoterInterface::ACCESS_GRANTED);

        // ALLOW: department has no teams
        $user = new User();
        $user->addTeam(new Team('foo'));
        $this->assertVote($user, new Department('foo'), 'access', VoterInterface::ACCESS_GRANTED);

        // ALLOW: user and department are in the same team (as teamlead)
        $team = new Team('foo');
        $user = new User();
        $team->addTeamlead($user);

        $department = new Department('foo');
        $department->addTeam($team);

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_GRANTED);

        // ALLOW: user and department are in the same team (as member)
        $team = new Team('foo');
        $user = new User();
        $user->addTeam(new Team('foo'));
        $user->addTeam($team);

        $department = new Department('foo');
        $department->addTeam($team);

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_GRANTED);

        // DENY: department has a team, user not
        $department = new Department('foo');
        $department->addTeam(new Team('foo'));

        $this->assertVote(new User(), $department, 'access', VoterInterface::ACCESS_DENIED);

        // DENY: user and department has a team are not in the same team
        $user = new User();
        $user->addTeam(new Team('foo'));
        $department = new Department('foo');
        $department->addTeam(new Team('foo'));

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessGrantedForCanSeeAllDataDespiteRestrictiveTeams(): void
    {
        $department = new Department('foo');
        $department->addTeam(new Team('locked'));

        $user = new User();
        $user->initCanSeeAllData(true);

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessGrantedWhenUserMatchesOneOfMultipleDepartmentTeams(): void
    {
        $sharedTeam = new Team('shared');
        $foreignTeam = new Team('foreign');

        $department = new Department('foo');
        $department->addTeam($foreignTeam);
        $department->addTeam($sharedTeam);

        $user = new User();
        $sharedTeam->addUser($user);

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_GRANTED);
    }

    public function testAccessDeniedWhenUserOnlyInUnrelatedTeams(): void
    {
        $department = new Department('foo');
        $department->addTeam(new Team('departmentTeam'));

        $user = new User();
        $unrelated = new Team('unrelated');
        $unrelated->addUser($user);
        $unrelated->addTeamlead($user);

        $this->assertVote($user, $department, 'access', VoterInterface::ACCESS_DENIED);
    }

    public function testAccessDeniedForNonUserToken(): void
    {
        $department = new Department('foo');
        $token = new UsernamePasswordToken(new InMemoryUser('anon', null), 'bar', []);
        $sut = $this->getVoter(DepartmentVoter::class);

        self::assertEquals(VoterInterface::ACCESS_DENIED, $sut->vote($token, $department, ['access']));
    }
}
