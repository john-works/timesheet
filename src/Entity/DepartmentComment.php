<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: 'kimai2_departments_comments')]
#[ORM\Index(columns: ['department_id'])]
#[ORM\Entity]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
class DepartmentComment implements CommentInterface
{
    use CommentTableTypeTrait;

    #[ORM\ManyToOne(targetEntity: Department::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull]
    private Department $department;

    public function __construct(Department $department)
    {
        $this->createdAt = new \DateTime();
        $this->department = $department;
    }

    public function getDepartment(): Department
    {
        return $this->department;
    }
}
