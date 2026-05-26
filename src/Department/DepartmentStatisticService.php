<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Department;

use App\Entity\Department;
use App\Entity\Project;
use App\Event\DepartmentStatisticEvent;
use App\Model\DepartmentBudgetStatisticModel;
use App\Model\DepartmentStatistic;
use App\Repository\TimesheetRepository;
use App\Timesheet\DateTimeFactory;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Psr\EventDispatcher\EventDispatcherInterface;

/**
 * @final
 */
class DepartmentStatisticService
{
    public function __construct(private readonly TimesheetRepository $timesheetRepository, private readonly EventDispatcherInterface $dispatcher)
    {
    }

    /**
     * WARNING: this method does not respect the budget type. Your results will always be with the "full lifetime data" or the "selected date-range".
     */
    public function getDepartmentStatistics(Department $department, ?DateTimeInterface $begin = null, ?DateTimeInterface $end = null): DepartmentStatistic
    {
        $statistics = $this->getBudgetStatistic([$department], $begin, $end);
        $event = new DepartmentStatisticEvent($department, array_pop($statistics), $begin, $end);
        $this->dispatcher->dispatch($event);

        return $event->getStatistic();
    }

    public function getBudgetStatisticModel(Department $department, DateTimeInterface $today): DepartmentBudgetStatisticModel
    {
        $stats = new DepartmentBudgetStatisticModel($department);
        $stats->setStatisticTotal($this->getDepartmentStatistics($department));

        $begin = null;
        $end = DateTimeImmutable::createFromInterface($today);

        if ($department->isMonthlyBudget()) {
            $dateFactory = new DateTimeFactory($today->getTimezone());
            $begin = $dateFactory->getStartOfMonth($today);
            $end = $dateFactory->getEndOfMonth($today);
        }

        $stats->setStatistic($this->getDepartmentStatistics($department, $begin, $end));

        return $stats;
    }

    /**
     * @param Department[] $departments
     * @return array<int, DepartmentStatistic>
     */
    private function getBudgetStatistic(array $departments, ?DateTimeInterface $begin = null, ?DateTimeInterface $end = null): array
    {
        $statistics = [];
        foreach ($departments as $department) {
            $statistics[$department->getId()] = new DepartmentStatistic();
        }

        $qb = $this->createStatisticQueryBuilder($departments, $begin, $end);

        $result = $qb->getQuery()->getResult();

        if (null !== $result) {
            foreach ($result as $resultRow) {
                $statistic = $statistics[$resultRow['id']];
                $statistic->addDuration((int) $resultRow['duration']);
                $statistic->addRate((float) $resultRow['rate']);
                $statistic->addInternalRate((float) $resultRow['internalRate']);
                $statistic->addCounter((int) $resultRow['counter']);
                if ($resultRow['billable']) {
                    $statistic->addDurationBillable((int) $resultRow['duration']);
                    $statistic->addRateBillable((float) $resultRow['rate']);
                    $statistic->addInternalRateBillable((float) $resultRow['internalRate']);
                    $statistic->addCounterBillable((int) $resultRow['counter']);
                    if ($resultRow['exported']) {
                        $statistic->addDurationBillableExported((int) $resultRow['duration']);
                        $statistic->addRateBillableExported((float) $resultRow['rate']);
                    }
                }
                if ($resultRow['exported']) {
                    $statistic->addDurationExported((int) $resultRow['duration']);
                    $statistic->addRateExported((float) $resultRow['rate']);
                    $statistic->addInternalRateExported((float) $resultRow['internalRate']);
                    $statistic->addCounterExported((int) $resultRow['counter']);
                }
            }
        }

        return $statistics;
    }

    private function createStatisticQueryBuilder(array $departments, ?DateTimeInterface $begin = null, ?DateTimeInterface $end = null): QueryBuilder
    {
        $qb = $this->timesheetRepository->createQueryBuilder('t');
        $qb
            ->select('IDENTITY(p.department) AS id')
            ->join(Project::class, 'p', Join::WITH, 't.project = p.id')
            ->addSelect('COALESCE(SUM(t.duration), 0) as duration')
            ->addSelect('COALESCE(SUM(t.rate), 0) as rate')
            ->addSelect('COALESCE(SUM(t.internalRate), 0) as internalRate')
            ->addSelect('COUNT(t.id) as counter')
            ->addSelect('t.billable as billable')
            ->addSelect('t.exported as exported')
            ->andWhere($qb->expr()->isNotNull('t.end'))
            ->groupBy('id')
            ->addGroupBy('billable')
            ->addGroupBy('exported')
            ->andWhere($qb->expr()->in('p.department', ':department'))
            ->setParameter('department', $departments)
        ;

        if ($begin !== null) {
            $qb
                ->andWhere($qb->expr()->gte('t.begin', ':begin'))
                ->setParameter('begin', DateTimeImmutable::createFromInterface($begin), Types::DATETIME_IMMUTABLE)
            ;
        }

        if ($end !== null) {
            $qb
                ->andWhere($qb->expr()->lte('t.begin', ':end'))
                ->setParameter('end', DateTimeImmutable::createFromInterface($end), Types::DATETIME_IMMUTABLE)
            ;
        }

        return $qb;
    }
}
