<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Entity;

use App\Entity\User;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;

#[ORM\Table(name: 'kimai2_weekly_submissions')]
#[ORM\UniqueConstraint(columns: ['user_id', 'week_start'])]
#[ORM\Entity(repositoryClass: WeeklySubmissionRepository::class)]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
class WeeklySubmission
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_SUPERVISOR_APPROVED = 'supervisor_approved';
    public const STATUS_MANAGER_APPROVED = 'manager_approved';
    public const STATUS_HR_APPROVED = 'hr_approved';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(name: 'week_start', type: Types::DATE_IMMUTABLE, nullable: false)]
    private \DateTimeImmutable $weekStart;

    #[ORM\Column(name: 'status', type: Types::STRING, length: 20, nullable: false, options: ['default' => 'draft'])]
    private string $status = self::STATUS_DRAFT;

    #[ORM\Column(name: 'submitted_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $submittedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'approved_by', nullable: true, onDelete: 'SET NULL')]
    private ?User $approvedBy = null;

    #[ORM\Column(name: 'approved_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $approvedAt = null;

    #[ORM\Column(name: 'supervisor_notes', type: Types::TEXT, nullable: true)]
    private ?string $supervisorNotes = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'manager_approved_by', nullable: true, onDelete: 'SET NULL')]
    private ?User $managerApprovedBy = null;

    #[ORM\Column(name: 'manager_approved_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $managerApprovedAt = null;

    #[ORM\Column(name: 'manager_notes', type: Types::TEXT, nullable: true)]
    private ?string $managerNotes = null;

    #[ORM\Column(name: 'total_duration', type: Types::INTEGER, nullable: false, options: ['default' => 0])]
    private int $totalDuration = 0;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'reassigned_to', nullable: true, onDelete: 'SET NULL')]
    private ?User $reassignedTo = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'original_supervisor', nullable: true, onDelete: 'SET NULL')]
    private ?User $originalSupervisor = null;

    #[ORM\Column(name: 'is_overtime', type: Types::BOOLEAN, nullable: false, options: ['default' => false])]
    private bool $isOvertime = false;

    #[ORM\Column(name: 'overtime_hours', type: Types::INTEGER, nullable: false, options: ['default' => 0])]
    private int $overtimeHours = 0;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'manager_hr_approved_by', nullable: true, onDelete: 'SET NULL')]
    private ?User $managerHrApprovedBy = null;

    #[ORM\Column(name: 'manager_hr_approved_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $managerHrApprovedAt = null;

    #[ORM\Column(name: 'manager_hr_notes', type: Types::TEXT, nullable: true)]
    private ?string $managerHrNotes = null;

    #[ORM\Column(name: 'hr_approved_by', type: Types::INTEGER, nullable: true)]
    private ?int $hrApprovedBy = null;

    #[ORM\Column(name: 'hr_approved_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $hrApprovedAt = null;

    #[ORM\Column(name: 'hr_notes', type: Types::TEXT, nullable: true)]
    private ?string $hrNotes = null;

    private ?User $currentApprover = null;

    public function __construct(User $user, \DateTimeImmutable $weekStart)
    {
        $this->user = $user;
        $this->weekStart = $weekStart;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getWeekStart(): \DateTimeImmutable
    {
        return $this->weekStart;
    }

    public function getWeekEnd(): \DateTimeImmutable
    {
        return $this->weekStart->modify('+6 days');
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isSubmitted(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    public function isSupervisorApproved(): bool
    {
        return $this->status === self::STATUS_SUPERVISOR_APPROVED;
    }

    public function isManagerApproved(): bool
    {
        return $this->status === self::STATUS_MANAGER_APPROVED;
    }

    public function isHrApproved(): bool
    {
        return $this->status === self::STATUS_HR_APPROVED;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function getSubmittedAt(): ?\DateTimeImmutable
    {
        return $this->submittedAt;
    }

    public function setSubmittedAt(?\DateTimeImmutable $submittedAt): void
    {
        $this->submittedAt = $submittedAt;
    }

    public function getApprovedBy(): ?User
    {
        return $this->approvedBy;
    }

    public function setApprovedBy(?User $approvedBy): void
    {
        $this->approvedBy = $approvedBy;
    }

    public function getApprovedAt(): ?\DateTimeImmutable
    {
        return $this->approvedAt;
    }

    public function setApprovedAt(?\DateTimeImmutable $approvedAt): void
    {
        $this->approvedAt = $approvedAt;
    }

    public function getSupervisorNotes(): ?string
    {
        return $this->supervisorNotes;
    }

    public function setSupervisorNotes(?string $supervisorNotes): void
    {
        $this->supervisorNotes = $supervisorNotes;
    }

    public function getManagerApprovedBy(): ?User
    {
        return $this->managerApprovedBy;
    }

    public function setManagerApprovedBy(?User $managerApprovedBy): void
    {
        $this->managerApprovedBy = $managerApprovedBy;
    }

    public function getManagerApprovedAt(): ?\DateTimeImmutable
    {
        return $this->managerApprovedAt;
    }

    public function setManagerApprovedAt(?\DateTimeImmutable $managerApprovedAt): void
    {
        $this->managerApprovedAt = $managerApprovedAt;
    }

    public function getManagerNotes(): ?string
    {
        return $this->managerNotes;
    }

    public function setManagerNotes(?string $managerNotes): void
    {
        $this->managerNotes = $managerNotes;
    }

    public function getManagerHrApprovedBy(): ?User
    {
        return $this->managerHrApprovedBy;
    }

    public function setManagerHrApprovedBy(?User $managerHrApprovedBy): void
    {
        $this->managerHrApprovedBy = $managerHrApprovedBy;
    }

    public function getManagerHrApprovedAt(): ?\DateTimeImmutable
    {
        return $this->managerHrApprovedAt;
    }

    public function setManagerHrApprovedAt(?\DateTimeImmutable $managerHrApprovedAt): void
    {
        $this->managerHrApprovedAt = $managerHrApprovedAt;
    }

    public function getManagerHrNotes(): ?string
    {
        return $this->managerHrNotes;
    }

    public function setManagerHrNotes(?string $managerHrNotes): void
    {
        $this->managerHrNotes = $managerHrNotes;
    }

    public function getTotalDuration(): int
    {
        return $this->totalDuration;
    }

    public function setTotalDuration(int $totalDuration): void
    {
        $this->totalDuration = $totalDuration;
    }

    public function getReassignedTo(): ?User
    {
        return $this->reassignedTo;
    }

    public function setReassignedTo(?User $reassignedTo): void
    {
        $this->reassignedTo = $reassignedTo;
    }

    public function getOriginalSupervisor(): ?User
    {
        return $this->originalSupervisor;
    }

    public function setOriginalSupervisor(?User $originalSupervisor): void
    {
        $this->originalSupervisor = $originalSupervisor;
    }

    public function isOvertime(): bool
    {
        return $this->isOvertime;
    }

    public function setIsOvertime(bool $isOvertime): void
    {
        $this->isOvertime = $isOvertime;
    }

    public function getOvertimeHours(): int
    {
        return $this->overtimeHours;
    }

    public function setOvertimeHours(int $overtimeHours): void
    {
        $this->overtimeHours = $overtimeHours;
    }

    public function getHrApprovedBy(): ?int
    {
        return $this->hrApprovedBy;
    }

    public function setHrApprovedBy(?int $hrApprovedBy): void
    {
        $this->hrApprovedBy = $hrApprovedBy;
    }

    public function getHrApprovedAt(): ?\DateTimeImmutable
    {
        return $this->hrApprovedAt;
    }

    public function setHrApprovedAt(?\DateTimeImmutable $hrApprovedAt): void
    {
        $this->hrApprovedAt = $hrApprovedAt;
    }

    public function getHrNotes(): ?string
    {
        return $this->hrNotes;
    }

    public function setHrNotes(?string $hrNotes): void
    {
        $this->hrNotes = $hrNotes;
    }

    public function getCurrentApprover(): ?User
    {
        return $this->currentApprover;
    }

    public function setCurrentApprover(?User $currentApprover): void
    {
        $this->currentApprover = $currentApprover;
    }
}
