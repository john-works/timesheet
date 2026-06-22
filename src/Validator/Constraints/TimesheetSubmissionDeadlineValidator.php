<?php

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class TimesheetSubmissionDeadlineValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!($constraint instanceof TimesheetSubmissionDeadline)) {
            throw new UnexpectedTypeException($constraint, TimesheetSubmissionDeadline::class);
        }
    }
}
