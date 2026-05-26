<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository;

use App\Entity\Department;
use App\Entity\DepartmentRate;
use Doctrine\ORM\EntityRepository;

/**
 * @extends EntityRepository<DepartmentRate>
 */
class DepartmentRateRepository extends EntityRepository
{
    public function saveRate(DepartmentRate $rate): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($rate);
        $entityManager->flush();
    }

    public function deleteRate(DepartmentRate $rate): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->remove($rate);
        $entityManager->flush();
    }

    /**
     * @param Department $department
     * @return DepartmentRate[]
     */
    public function getRatesForDepartment(Department $department): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r, u, c')
            ->from(DepartmentRate::class, 'r')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.department', 'c')
            ->andWhere(
                $qb->expr()->eq('r.department', ':department')
            )
            ->addOrderBy('u.alias')
            ->setParameter('department', $department)
        ;

        return $qb->getQuery()->getResult();
    }
}
