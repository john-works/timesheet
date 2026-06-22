<?php

namespace App\Entity;

use App\Repository\PublicHolidayRepository;
use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: 'kimai2_public_holidays')]
#[ORM\Entity(repositoryClass: PublicHolidayRepository::class)]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
class PublicHoliday
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(name: 'holiday_date', type: Types::DATE_MUTABLE, nullable: false)]
    #[Assert\NotNull]
    private ?DateTime $holidayDate = null;

    #[ORM\Column(name: 'name', type: Types::STRING, length: 255, nullable: false)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private ?string $name = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHolidayDate(): ?DateTime
    {
        return $this->holidayDate;
    }

    public function setHolidayDate(?DateTime $holidayDate): void
    {
        $this->holidayDate = $holidayDate;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }
}
