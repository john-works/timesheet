<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Event;

use App\Entity\Department;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Base event class to used with department manipulations.
 */
abstract class AbstractDepartmentEvent extends Event
{
    public function __construct(private readonly Department $department)
    {
    }

    public function getDepartment(): Department
    {
        return $this->department;
    }
}
