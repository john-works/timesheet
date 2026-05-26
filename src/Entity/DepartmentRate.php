<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Entity;

use App\Repository\DepartmentRateRepository;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: 'kimai2_departments_rates')]
#[ORM\UniqueConstraint(columns: ['user_id', 'department_id'])]
#[ORM\Entity(repositoryClass: DepartmentRateRepository::class)]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
#[UniqueEntity(['user', 'department'], ignoreNull: false)]
#[Serializer\ExclusionPolicy('all')]
class DepartmentRate implements RateInterface
{
    use Rate;

    #[ORM\ManyToOne(targetEntity: Department::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull]
    private ?Department $department = null;

    public function setDepartment(?Department $department): DepartmentRate
    {
        $this->department = $department;

        return $this;
    }

    public function getDepartment(): ?Department
    {
        return $this->department;
    }

    public function getScore(): int
    {
        return 1;
    }
}
