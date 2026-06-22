<?php

namespace App\Validator\Constraints;

final class TimesheetSubmissionDeadline extends TimesheetConstraint
{
    public const DEADLINE_VIOLATION = 'kimai-timesheet-submission-deadline-01';

    protected const ERROR_NAMES = [
        self::DEADLINE_VIOLATION => 'Timesheets can only be submitted on Friday before 3:00 PM.',
    ];

    public string $message = 'Timesheets can only be submitted on Friday before 3:00 PM.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
