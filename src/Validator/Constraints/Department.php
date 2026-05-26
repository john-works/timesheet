<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class Department extends Constraint
{
    public const DEPARTMENT_NUMBER_EXISTING = 'kimai-department-00';

    protected const ERROR_NAMES = [
        self::DEPARTMENT_NUMBER_EXISTING => 'The number %number% is already used.',
    ];

    public string $message = 'This department has invalid settings.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
