<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Loader;

use App\Entity\Department;
use App\Entity\Team;
use App\Repository\Query\DepartmentQuery;
use App\Repository\Query\DepartmentQueryHydrate;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @internal
 * @implements LoaderInterface<Department>
 */
final class DepartmentLoader implements LoaderInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly DepartmentQuery $query
    )
    {
    }

    /**
     * @param array<Department> $results
     */
    public function loadResults(array $results): void
    {
        if (\count($results) === 0) {
            return;
        }

        $departmentIds = array_filter(array_unique(array_map(function (Department $department) {
            // make sure that this potential doctrine proxy is initialized and filled with all data
            $department->getName();

            return $department->getId();
        }, $results)), function ($value) { return $value !== null; });

        $hydrateTeams = false;
        $hydrateTeamMembers = false;

        foreach ($this->query->getHydrate() as $hydrate) {
            switch ($hydrate) {
                case DepartmentQueryHydrate::TEAMS:
                    $hydrateTeams = true;
                    break;
                case DepartmentQueryHydrate::TEAM_MEMBER:
                    $hydrateTeams = true;
                    $hydrateTeamMembers = true;
                    break;
            }
        }

        if (!$hydrateTeams) {
            return;
        }

        $em = $this->entityManager;

        // required where we need to check team permissions, e.g. "Department listing"
        if (\count($departmentIds) > 0) {
            $qb = $em->createQueryBuilder();
            $qb->select('PARTIAL c.{id}', 'teams')
                ->from(Department::class, 'c')
                ->leftJoin('c.teams', 'teams')
                ->andWhere($qb->expr()->in('c.id', $departmentIds))
                ->getQuery()
                ->execute();
        }

        // do not load team members or leads by default, because they will only be used on detail pages
        if ($hydrateTeamMembers) {
            $teamIds = [];
            foreach ($results as $department) {
                foreach ($department->getTeams() as $team) {
                    $teamIds[] = $team->getId();
                }
            }
            $teamIds = array_unique($teamIds);

            if (\count($teamIds) > 0) {
                $qb = $em->createQueryBuilder();
                $qb->select('PARTIAL team.{id}', 'members', 'user')
                    ->from(Team::class, 'team')
                    ->leftJoin('team.members', 'members')
                    ->leftJoin('members.user', 'user')
                    ->andWhere($qb->expr()->in('team.id', $teamIds))
                    ->getQuery()
                    ->execute();
            }
        }
    }
}
