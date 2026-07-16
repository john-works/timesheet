<?php

namespace App\Validator\Constraints;

final class TimesheetSubmissionDeadline extends TimesheetConstraint
{
    public const FUTURE_DATE_ERROR = 'kimai-timesheet-submission-deadline-01';
    public const PREVIOUS_MONTH_GRACE_ERROR = 'kimai-timesheet-submission-deadline-02';
    public const PREVIOUS_MONTH_EXPIRED_ERROR = 'kimai-timesheet-submission-deadline-03';

    protected const ERROR_NAMES = [
        self::FUTURE_DATE_ERROR => 'You cannot submit timesheets for a future date.',
        self::PREVIOUS_MONTH_GRACE_ERROR => 'Previous month timesheets can only be submitted during the 5-day grace period.',
        self::PREVIOUS_MONTH_EXPIRED_ERROR => 'The grace period for submitting previous month timesheets has expired.',
    ];

    public string $message = 'The timesheet submission date is not valid.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
