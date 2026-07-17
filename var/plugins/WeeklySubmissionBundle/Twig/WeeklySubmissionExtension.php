<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Twig;

use App\Entity\Timesheet;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class WeeklySubmissionExtension extends AbstractExtension
{
    public function __construct(
        private WeeklySubmissionRepository $submissionRepository
    ) {}

    public function getFunctions(): array
    {
        return [
            new TwigFunction('is_rejected_period', [$this, 'isRejectedPeriod']),
        ];
    }

    public function isRejectedPeriod(Timesheet $entry): bool
    {
        $submission = $this->submissionRepository->findSubmissionForDate(
            $entry->getUser(),
            $entry->getBegin()
        );

        return $submission !== null && $submission->getStatus() === WeeklySubmission::STATUS_REJECTED;
    }
}
