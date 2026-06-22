<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Repository;

use Doctrine\ORM\EntityRepository;

class PublicHolidayRepository extends EntityRepository
{
    public function findBetween(\DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        $qb = $this->createQueryBuilder('h')
            ->where('h.holidayDate >= :start')
            ->andWhere('h.holidayDate <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('h.holidayDate', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
