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
            new TwigFunction('submission_level', [$this, 'submissionLevel']),
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

    /**
     * @return array{level: int|null, total: int, label: string, class: string, approver: ?string}
     */
    public function submissionLevel(WeeklySubmission $submission): array
    {
        $twoStep = $submission->getUser()->hasTwoStepWorkflow();
        $total = $twoStep ? 4 : 3;
        $status = $submission->getStatus();
        $reassigned = $submission->getReassignedTo();

        switch ($status) {
            case WeeklySubmission::STATUS_DRAFT:
                return ['level' => null, 'total' => $total, 'label' => 'Draft', 'class' => 'bg-secondary', 'approver' => null];
            case WeeklySubmission::STATUS_SUBMITTED:
                return ['level' => 1, 'total' => $total, 'label' => 'Step 1 Approver', 'class' => 'bg-primary', 'approver' => ($reassigned ?? $submission->getUser()->getSupervisor())?->getDisplayName()];
            case WeeklySubmission::STATUS_SUPERVISOR_APPROVED:
                $step2 = $twoStep ? $submission->getUser()->getStep2Approver() : null;
                return ['level' => 2, 'total' => 4, 'label' => 'Step 2 Approver', 'class' => 'bg-info', 'approver' => ($reassigned ?? $step2)?->getDisplayName()];
            case WeeklySubmission::STATUS_MANAGER_APPROVED:
                return ['level' => $twoStep ? 3 : 2, 'total' => $total, 'label' => 'Manager HR (Overtime)', 'class' => 'bg-warning', 'approver' => ($reassigned ?? $this->submissionRepository->getManagerHrUser())?->getDisplayName()];
            case WeeklySubmission::STATUS_HR_APPROVED:
                return ['level' => $twoStep ? 4 : 3, 'total' => $total, 'label' => 'HR/Admin (Overtime)', 'class' => 'bg-warning', 'approver' => 'HR/Admin'];
            case WeeklySubmission::STATUS_APPROVED:
                return ['level' => null, 'total' => $total, 'label' => 'Fully Approved', 'class' => 'bg-success', 'approver' => null];
            case WeeklySubmission::STATUS_REJECTED:
                return ['level' => null, 'total' => $total, 'label' => 'Rejected', 'class' => 'bg-danger', 'approver' => null];
        }

        return ['level' => null, 'total' => $total, 'label' => $status, 'class' => 'bg-secondary', 'approver' => null];
    }
}
