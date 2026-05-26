<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Reporting\ProjectDateRange;

use App\Entity\Department;
use App\Entity\User;

final class ProjectDateRangeQuery
{
    private ?\DateTime $month;
    private ?Department $department = null;
    private bool $includeNoWork = false;
    private ?string $budgetType = null;
    private ?string $view = '0';

    public function __construct(\DateTime $month, private User $user)
    {
        $this->month = clone $month;
    }

    public function isBudgetIndependent(): bool
    {
        return $this->budgetType === null;
    }

    public function isIncludeNoBudget(): bool
    {
        return $this->budgetType === 'none';
    }

    public function isIncludeNoWork(): bool
    {
        return $this->includeNoWork;
    }

    public function setIncludeNoWork(bool $includeNoWork): void
    {
        $this->includeNoWork = $includeNoWork;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getMonth(): ?\DateTime
    {
        return $this->month;
    }

    public function setMonth(?\DateTime $month): void
    {
        $this->month = $month;
    }

    public function getDepartment(): ?Department
    {
        return $this->department;
    }

    public function setDepartment(?Department $department): void
    {
        $this->department = $department;
    }

    public function isBudgetTypeMonthly(): bool
    {
        return $this->budgetType === 'month';
    }

    public function getBudgetType(): ?string
    {
        return $this->budgetType;
    }

    public function setBudgetType(?string $budgetType): void
    {
        $this->budgetType = $budgetType;
    }

    public function getView(): ?string
    {
        return $this->view;
    }

    public function setView(?string $view): void
    {
        $this->view = $view;
    }
}
