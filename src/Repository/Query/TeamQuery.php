<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use App\Entity\User;

class TeamQuery extends BaseQuery
{
    public const TEAM_ORDER_ALLOWED = ['name'];

    /**
     * @var User[]
     */
    private array $users = [];
    /**
     * @var array<Department>
     */
    private array $departments = [];
    /**
     * @var array<Project>
     */
    private array $projects = [];
    /**
     * @var array<Activity>
     */
    private array $activities = [];

    public function __construct()
    {
        $this->setDefaults([
            'orderBy' => 'name',
            'users' => [],
            'departments' => [],
            'projects' => [],
            'activities' => [],
        ]);
    }

    public function hasUsers(): bool
    {
        return !empty($this->users);
    }

    public function addUser(User $user): void
    {
        $this->users[$user->getId()] = $user;
    }

    public function removeUser(User $user): void
    {
        if (isset($this->users[$user->getId()])) {
            unset($this->users[$user->getId()]);
        }
    }

    /**
     * @return User[]
     */
    public function getUsers(): array
    {
        return array_values($this->users);
    }

    public function hasDepartments(): bool
    {
        return \count($this->departments) > 0;
    }

    /**
     * @return Department[]
     */
    public function getDepartments(): array
    {
        return $this->departments;
    }

    /**
     * @param array<Department> $departments
     */
    public function setDepartments(array $departments): void
    {
        $this->departments = $departments;
    }

    public function addDepartment(Department $department): void
    {
        $this->departments[] = $department;
    }

    public function hasProjects(): bool
    {
        return \count($this->projects) > 0;
    }

    /**
     * @return Project[]
     */
    public function getProjects(): array
    {
        return $this->projects;
    }

    /**
     * @param array<Project> $projects
     */
    public function setProjects(array $projects): void
    {
        $this->projects = $projects;
    }

    public function addProject(Project $project): void
    {
        $this->projects[] = $project;
    }

    public function hasActivities(): bool
    {
        return \count($this->activities) > 0;
    }

    /**
     * @return Activity[]
     */
    public function getActivities(): array
    {
        return $this->activities;
    }

    /**
     * @param array<Activity> $activities
     */
    public function setActivities(array $activities): void
    {
        $this->activities = $activities;
    }

    public function addActivity(Activity $activity): void
    {
        $this->activities[] = $activity;
    }
}
