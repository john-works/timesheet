<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository;

use App\Entity\Department;
use App\Entity\DepartmentComment;
use App\Entity\DepartmentMeta;
use App\Entity\Project;
use App\Entity\Team;
use App\Entity\User;
use App\Repository\Loader\DepartmentLoader;
use App\Repository\Paginator\LoaderQueryPaginator;
use App\Repository\Paginator\PaginatorInterface;
use App\Repository\Query\DepartmentFormTypeQuery;
use App\Repository\Query\DepartmentQuery;
use App\Repository\Query\DepartmentQueryHydrate;
use App\Repository\Search\SearchConfiguration;
use App\Repository\Search\SearchHelper;
use App\Utils\Pagination;
use Doctrine\DBAL\ParameterType;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\Expr\Andx;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends EntityRepository<Department>
 */
class DepartmentRepository extends EntityRepository
{
    /**
     * @param array<int, string|int> $departmentIDs
     * @return array<Department>
     */
    public function findByIds(array $departmentIDs): array
    {
        $ids = array_filter(
            array_unique($departmentIDs),
            function ($value) {
                return $value > 0;
            }
        );

        if (\count($ids) === 0) {
            return [];
        }

        $qb = $this->createQueryBuilder('c');
        $qb
            ->where($qb->expr()->in('c.id', ':id'))
            ->setParameter('id', $ids)
        ;

        return $this->getDepartments($this->prepareDepartmentQuery($qb->getQuery()), new DepartmentQuery());
    }

    public function saveDepartment(Department $department): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($department);
        $entityManager->flush();
    }

    public function countDepartment(bool $visible = false): int
    {
        if ($visible) {
            return $this->count(['visible' => $visible]);
        }

        return $this->count([]);
    }

    /**
     * @param array<Team> $teams
     */
    public function addPermissionCriteria(QueryBuilder $qb, ?User $user = null, array $teams = []): void
    {
        $permissions = $this->getPermissionCriteria($qb, $user, $teams);
        if ($permissions->count() > 0) {
            $qb->andWhere($permissions);
        }
    }

    /**
     * @param array<Team> $teams
     */
    private function getPermissionCriteria(QueryBuilder $qb, ?User $user = null, array $teams = []): Andx
    {
        $andX = $qb->expr()->andX();

        // make sure that all queries without a user see all departments
        if (null === $user && empty($teams)) {
            return $andX;
        }

        // make sure that admins see all departments
        if (null !== $user && $user->canSeeAllData()) {
            return $andX;
        }

        if (null !== $user) {
            $teams = array_merge($teams, $user->getTeams());
        }

        if (empty($teams)) {
            $andX->add('SIZE(c.teams) = 0');

            return $andX;
        }

        $andX->add($qb->expr()->isMemberOf(':teams', 'c.teams'));

        $ids = array_values(array_unique(array_map(function (Team $team) {
            return $team->getId();
        }, $teams)));

        $qb->setParameter('teams', $ids);

        return $andX;
    }

    /**
     * Returns a query builder that is used for DepartmentType and your own 'query_builder' option.
     */
    public function getQueryBuilderForFormType(DepartmentFormTypeQuery $query): QueryBuilder
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('c')
            ->from(Department::class, 'c')
            ->orderBy('c.name', 'ASC');

        $mainQuery = $qb->expr()->andX();

        $mainQuery->add($qb->expr()->eq('c.visible', ':visible'));
        $qb->setParameter('visible', true, ParameterType::BOOLEAN);

        $permissions = $this->getPermissionCriteria($qb, $query->getUser(), $query->getTeams());
        if ($permissions->count() > 0) {
            $mainQuery->add($permissions);
        }

        $outerQuery = $qb->expr()->orX();

        // this is a risk, as a user can manipulate the query and inject IDs that would be hidden otherwise
        if ($query->isAllowDepartmentPreselect() && $query->hasDepartments()) {
            $outerQuery->add($qb->expr()->in('c.id', ':department'));
            $qb->setParameter('department', $query->getDepartments());
        }

        if (null !== $query->getDepartmentToIgnore()) {
            $mainQuery = $qb->expr()->andX(
                $mainQuery,
                $qb->expr()->neq('c.id', ':ignored')
            );
            $qb->setParameter('ignored', $query->getDepartmentToIgnore());
        }

        $outerQuery->add($mainQuery);
        $qb->andWhere($outerQuery);

        return $qb;
    }

    private function getQueryBuilderForQuery(DepartmentQuery $query): QueryBuilder
    {
        $qb = $this->createQueryBuilder('c');

        if (\count($query->getDepartmentIds()) > 0) {
            $qb->andWhere($qb->expr()->in('c.id', ':id'))->setParameter('id', $query->getDepartmentIds());
        }

        if ($query->getCountry() !== null) {
            $qb->andWhere($qb->expr()->eq('c.country', ':country'))->setParameter('country', $query->getCountry());
        }

        foreach ($query->getOrderGroups() as $orderBy => $order) {
            switch ($orderBy) {
                case 'vat_id':
                    $orderBy = 'c.vatId';
                    break;
                default:
                    $orderBy = 'c.' . $orderBy;
                    break;
            }
            $qb->addOrderBy($orderBy, $order);
        }

        if ($query->isShowVisible()) {
            $qb->andWhere($qb->expr()->eq('c.visible', ':visible'))->setParameter('visible', true, ParameterType::BOOLEAN);
        } elseif ($query->isShowHidden()) {
            $qb->andWhere($qb->expr()->eq('c.visible', ':visible'))->setParameter('visible', false, ParameterType::BOOLEAN);
        }

        $this->addPermissionCriteria($qb, $query->getCurrentUser(), $query->getTeams());

        $configuration = new SearchConfiguration(
            ['c.name', 'c.comment', 'c.company', 'c.vatId', 'c.number', 'c.contact', 'c.phone', 'c.email', 'c.address'],
            DepartmentMeta::class,
            'department'
        );
        $helper = new SearchHelper($configuration);
        $helper->addSearchTerm($qb, $query);

        return $qb;
    }

    public function getPagerfantaForQuery(DepartmentQuery $query): Pagination
    {
        return new Pagination($this->getPaginatorForQuery($query), $query);
    }

    /**
     * FIXME make this private and remove the widget that this currently uses
     * @return int<0, max>
     */
    public function countDepartmentsForQuery(DepartmentQuery $query): int
    {
        $qb = $this->getQueryBuilderForQuery($query);
        $qb
            ->resetDQLPart('select')
            ->resetDQLPart('orderBy')
            ->resetDQLPart('groupBy')
            ->select($qb->expr()->countDistinct('c.id'))
        ;

        return (int) $qb->getQuery()->getSingleScalarResult(); // @phpstan-ignore-line
    }

    /**
     * @return PaginatorInterface<Department>
     */
    private function getPaginatorForQuery(DepartmentQuery $departmentQuery): PaginatorInterface
    {
        $counter = $this->countDepartmentsForQuery($departmentQuery);
        $query = $this->createDepartmentQuery($departmentQuery);

        return new LoaderQueryPaginator(new DepartmentLoader($this->getEntityManager(), $departmentQuery), $query, $counter);
    }

    /**
     * @return Query<Department>
     */
    private function createDepartmentQuery(DepartmentQuery $departmentQuery): Query
    {
        $query = $this->getQueryBuilderForQuery($departmentQuery)->getQuery();
        $query = $this->prepareDepartmentQuery($query);

        foreach ($departmentQuery->getHydrate() as $hydrate) {
            switch ($hydrate) {
                case DepartmentQueryHydrate::TEAMS:
                    // does not yet work, see https://github.com/doctrine/orm/pull/8391
                    // $query->setFetchMode(Department::class, 'teams', ClassMetadata::FETCH_EAGER);
                    break;

                case DepartmentQueryHydrate::TEAM_MEMBER:
                    // does not yet work, see https://github.com/doctrine/orm/issues/11254
                    // $query->setFetchMode(Department::class, 'teams', ClassMetadata::FETCH_EAGER);
                    // $query->setFetchMode(Team::class, 'members', ClassMetadata::FETCH_EAGER);
                    // $query->setFetchMode(TeamMember::class, 'user', ClassMetadata::FETCH_EAGER);
                    break;
            }
        }

        return $query;
    }

    /**
     * @param Query<Department> $query
     * @return Query<Department>
     */
    public function prepareDepartmentQuery(Query $query): Query
    {
        $this->getEntityManager()->getConfiguration()->setEagerFetchBatchSize(300);

        $query->setFetchMode(Department::class, 'meta', ClassMetadata::FETCH_EAGER);

        return $query;
    }

    /**
     * @return Department[]
     */
    public function getDepartmentsForQuery(DepartmentQuery $departmentQuery): array
    {
        return $this->getDepartments($this->createDepartmentQuery($departmentQuery), $departmentQuery);
    }

    /**
     * @param Query<Department> $query
     * @return Department[]
     */
    public function getDepartments(Query $query, DepartmentQuery $departmentQuery): array
    {
        /** @var array<Department> $departments */
        $departments = $query->execute();

        $loader = new DepartmentLoader($this->getEntityManager(), $departmentQuery);
        $loader->loadResults($departments);

        return $departments;
    }

    public function deleteDepartment(Department $delete, ?Department $replace = null): void
    {
        $em = $this->getEntityManager();
        $em->beginTransaction();

        try {
            if (null !== $replace) {
                $qb = $em->createQueryBuilder();
                $qb
                    ->update(Project::class, 'p')
                    ->set('p.department', ':replace')
                    ->where('p.department = :delete')
                    ->setParameter('delete', $delete)
                    ->setParameter('replace', $replace)
                    ->getQuery()
                    ->execute();
            }

            $em->remove($delete);
            $em->flush();
            $em->commit();
        } catch (\Exception $ex) {
            $em->rollback();
            throw $ex;
        }
    }

    /**
     * @return array<DepartmentComment>
     */
    public function getComments(Department $department): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb
            ->select('comments')
            ->from(DepartmentComment::class, 'comments')
            ->andWhere($qb->expr()->eq('comments.department', ':department'))
            ->addOrderBy('comments.pinned', 'DESC')
            ->addOrderBy('comments.createdAt', 'DESC')
            ->setParameter('department', $department)
        ;

        return $qb->getQuery()->getResult();
    }

    public function saveComment(DepartmentComment $comment): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($comment);
        $entityManager->flush();
    }

    public function deleteComment(DepartmentComment $comment): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->remove($comment);
        $entityManager->flush();
    }
}
