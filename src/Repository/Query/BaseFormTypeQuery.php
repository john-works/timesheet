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
use App\Entity\Team;
use App\Entity\User;

abstract class BaseFormTypeQuery
{
    /**
     * @var array<Activity|int>
     */
    private array $activities = [];
    /**
     * @var array<Project|int>
     */
    private array $projects = [];
    /**
     * @var array<Department|int>
     */
    private array $departments = [];
    private ?User $user = null;
    /**
     * @var array<Team>
     */
    private array $teams = [];

    public function addActivity(Activity|int $activity): void
    {
        $this->activities[] = $activity;
    }

    /**
     * @param array<Activity|int> $activities
     */
    public function setActivities(array $activities): void
    {
        $this->activities = $activities;
    }

    /**
     * @return array<Activity|int>
     */
    public function getActivities(): array
    {
        return $this->activities;
    }

    public function hasActivities(): bool
    {
        return \count($this->activities) > 0;
    }

    public function addProject(Project|int $project): void
    {
        $this->projects[] = $project;
    }

    /**
     * @param array<Project|int> $projects
     */
    public function setProjects(array $projects): void
    {
        $this->projects = $projects;
    }

    /**
     * @return array<Project|int>
     */
    public function getProjects(): array
    {
        return $this->projects;
    }

    public function hasProjects(): bool
    {
        return \count($this->projects) > 0;
    }

    /**
     * @param array<Department|int> $departments
     */
    public function setDepartments(array $departments): void
    {
        $this->departments = $departments;
    }

    public function addDepartment(Department|int $department): void
    {
        $this->departments[] = $department;
    }

    /**
     * @return array<Department|int>
     */
    public function getDepartments(): array
    {
        return $this->departments;
    }

    public function hasDepartments(): bool
    {
        return \count($this->departments) > 0;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function addTeam(Team $team): self
    {
        $this->teams[$team->getId()] = $team;

        return $this;
    }

    /**
     * @param array<Team> $teams
     */
    public function setTeams(array $teams): void
    {
        $this->teams = $teams;
    }

    /**
     * @return array<Team>
     */
    public function getTeams(): array
    {
        return array_values($this->teams);
    }
}
