<?php

namespace App\Repository;

use App\Entity\PublicHoliday;
use Doctrine\ORM\EntityRepository;

/**
 * @extends EntityRepository<PublicHoliday>
 */
class PublicHolidayRepository extends EntityRepository
{
    public function savePublicHoliday(PublicHoliday $publicHoliday): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($publicHoliday);
        $entityManager->flush();
    }

    public function deletePublicHoliday(PublicHoliday $publicHoliday): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->remove($publicHoliday);
        $entityManager->flush();
    }

    /**
     * @return PublicHoliday[]
     */
    public function findAllOrderedByDate(): array
    {
        return $this->findBy([], ['holidayDate' => 'ASC']);
    }
}
