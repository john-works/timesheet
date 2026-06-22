<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Widget;

use App\Entity\User;
use App\Widget\Type\AbstractWidget;
use App\Widget\WidgetInterface;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;

final class PendingApprovalsWidget extends AbstractWidget
{
    public function __construct(private WeeklySubmissionRepository $repository)
    {
    }

    public function getId(): string
    {
        return 'pendingApprovals';
    }

    public function getTitle(): string
    {
        return 'Pending Approvals';
    }

    public function getOptions(array $options = []): array
    {
        return array_merge([
            'icon' => 'timesheet',
            'color' => WidgetInterface::COLOR_YEAR,
        ], parent::getOptions($options));
    }

    public function getData(array $options = []): mixed
    {
        $user = $this->getUser();
        if ($user === null) {
            return 0;
        }

        $pending = $this->repository->countPendingForSupervisor($user);
        $pendingFinal = $this->repository->countSupervisorApprovedForUser($user);

        return $pending + $pendingFinal;
    }

    public function getPermissions(): array
    {
        return ['IS_AUTHENTICATED_REMEMBERED'];
    }

    public function getTemplateName(): string
    {
        return '@WeeklySubmission/widget/pending_approvals.html.twig';
    }
}
