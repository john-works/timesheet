<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use KimaiPlugin\WeeklySubmissionBundle\Repository\PublicHolidayRepository;

#[ORM\Table(name: 'kimai2_public_holidays')]
#[ORM\UniqueConstraint(columns: ['holiday_date'])]
#[ORM\Entity(repositoryClass: PublicHolidayRepository::class)]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
class PublicHoliday
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(name: 'holiday_date', type: Types::DATE_IMMUTABLE, nullable: false)]
    private \DateTimeImmutable $holidayDate;

    #[ORM\Column(name: 'name', type: Types::STRING, length: 255, nullable: false)]
    private string $name;

    public function __construct(\DateTimeImmutable $holidayDate, string $name)
    {
        $this->holidayDate = $holidayDate;
        $this->name = $name;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHolidayDate(): \DateTimeImmutable
    {
        return $this->holidayDate;
    }

    public function getName(): string
    {
        return $this->name;
    }
}
