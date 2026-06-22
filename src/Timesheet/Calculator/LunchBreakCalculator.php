<?php

namespace App\Timesheet\Calculator;

use App\Entity\Timesheet;
use App\Timesheet\CalculatorInterface;

final class LunchBreakCalculator implements CalculatorInterface
{
    public function calculate(Timesheet $record, array $changeset): void
    {
        if ($record->getEnd() === null || $record->getBegin() === null) {
            return;
        }

        if ($record->getBreak() > 0) {
            return;
        }

        $begin = $record->getBegin();
        $end = $record->getEnd();

        if ($begin->format('Y-m-d') !== $end->format('Y-m-d')) {
            return;
        }

        $lunchStart = (clone $begin)->setTime(13, 0, 0);
        $lunchEnd = (clone $begin)->setTime(14, 0, 0);

        if ($begin < $lunchEnd && $end > $lunchStart) {
            $record->setBreak(3600);
        }
    }

    public function getPriority(): int
    {
        return 150;
    }
}
