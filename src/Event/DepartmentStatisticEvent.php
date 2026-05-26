<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Event;

use App\Entity\Department;
use App\Model\DepartmentStatistic;

final class DepartmentStatisticEvent extends AbstractDepartmentEvent
{
    public function __construct(Department $department, private readonly DepartmentStatistic $statistic, private readonly ?\DateTimeInterface $begin = null, private readonly ?\DateTimeInterface $end = null)
    {
        parent::__construct($department);
    }

    public function getStatistic(): DepartmentStatistic
    {
        return $this->statistic;
    }

    public function getBegin(): ?\DateTimeInterface
    {
        return $this->begin;
    }

    public function getEnd(): ?\DateTimeInterface
    {
        return $this->end;
    }
}
