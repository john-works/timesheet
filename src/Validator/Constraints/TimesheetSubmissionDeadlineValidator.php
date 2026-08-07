<?php

namespace App\Validator\Constraints;

use App\Entity\Timesheet as TimesheetEntity;
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

        if (!\is_object($value) || !($value instanceof TimesheetEntity)) {
            throw new UnexpectedTypeException($value, TimesheetEntity::class);
        }

        $begin = $value->getBegin();
        if ($begin === null) {
            return;
        }

        $now = new \DateTime('now', $begin->getTimezone());
        $today = new \DateTime('today', $begin->getTimezone());
        $entryDate = new \DateTime($begin->format('Y-m-d'), $begin->getTimezone());

        // Rule 1: Cannot submit timesheets for a future date
        if ($entryDate > $today) {
            $this->context->buildViolation($constraint::getErrorName(TimesheetSubmissionDeadline::FUTURE_DATE_ERROR))
                ->atPath('begin_date')
                ->setTranslationDomain('validators')
                ->setCode(TimesheetSubmissionDeadline::FUTURE_DATE_ERROR)
                ->addViolation();
            return;
        }

        $entryMonth = (int) $entryDate->format('n');
        $entryYear = (int) $entryDate->format('Y');
        $currentMonth = (int) $today->format('n');
        $currentYear = (int) $today->format('Y');
        $currentDay = (int) $today->format('j');

        // Rule 2: Current month - any past day is allowed (already handled by future date check above)
        if ($entryYear === $currentYear && $entryMonth === $currentMonth) {
            return; // Current month, past dates are allowed
        }

        // Rule 3: Previous month - only during the 10-day grace period
        $isPreviousMonth = ($entryYear === $currentYear && $entryMonth === $currentMonth - 1)
            || ($entryYear === $currentYear - 1 && $entryMonth === 12 && $currentMonth === 1);

        if ($isPreviousMonth) {
            if ($currentDay <= 10) {
                // Within grace period - allow submission
                return;
            } else {
                // Grace period expired
                $this->context->buildViolation($constraint::getErrorName(TimesheetSubmissionDeadline::PREVIOUS_MONTH_EXPIRED_ERROR))
                    ->atPath('begin_date')
                    ->setTranslationDomain('validators')
                    ->setCode(TimesheetSubmissionDeadline::PREVIOUS_MONTH_EXPIRED_ERROR)
                    ->addViolation();
                return;
            }
        }

        // Rule 4: Older than previous month - not allowed
        $this->context->buildViolation($constraint::getErrorName(TimesheetSubmissionDeadline::PREVIOUS_MONTH_EXPIRED_ERROR))
            ->atPath('begin_date')
            ->setTranslationDomain('validators')
            ->setCode(TimesheetSubmissionDeadline::PREVIOUS_MONTH_EXPIRED_ERROR)
            ->addViolation();
    }
}
