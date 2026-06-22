<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository;

use App\Entity\Activity;
use App\Entity\Project;
use App\Entity\ProjectComment;
use App\Entity\ProjectMeta;
use App\Entity\Team;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\Loader\ProjectLoader;
use App\Repository\Paginator\LoaderQueryPaginator;
use App\Repository\Paginator\PaginatorInterface;
use App\Repository\Query\ProjectFormTypeQuery;
use App\Repository\Query\ProjectQuery;
use App\Repository\Query\ProjectQueryHydrate;
use App\Repository\Search\SearchConfiguration;
use App\Repository\Search\SearchHelper;
use App\Utils\Pagination;
use DateTime;
use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\Expr\Andx;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends EntityRepository<Project>
 */
class ProjectRepository extends EntityRepository
{
    /**
     * @param array<int, string|int> $projectIds
     * @return array<Project>
     */
    public function findByIds(array $projectIds): array
    {
        $ids = array_filter(
            array_unique($projectIds),
            function ($value) {
                return $value > 0;
            }
        );

        if (\count($ids) === 0) {
            return [];
        }

        $qb = $this->createQueryBuilder('p');
        $qb
            ->where($qb->expr()->in('p.id', ':id'))
            ->setParameter('id', $ids)
        ;

        return $this->getProjects($this->prepareProjectQuery($qb->getQuery()));
    }

    public function saveProject(Project $project): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($project);
        $entityManager->flush();
    }

    /**
     * @return int<0, max>
     */
    public function countProject(?bool $visible = null): int
    {
        if (null !== $visible) {
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

        // make sure that all queries without a user see all projects
        if (null === $user && empty($teams)) {
            return $andX;
        }

        // make sure that admins see all projects
        if (null !== $user && $user->canSeeAllData()) {
            return $andX;
        }

        if (null !== $user) {
            $teams = array_merge($teams, $user->getTeams());
        }

        $directorDeptIds = [];
        if (null !== $user && $user->isDirector()) {
            foreach ($user->getDirectorDepartments() as $dept) {
                $directorDeptIds[] = $dept->getId();
            }
        }

        if (empty($teams) && empty($directorDeptIds)) {
            $andX->add('SIZE(c.teams) = 0');
            $andX->add('SIZE(p.teams) = 0');

            return $andX;
        }

        $orProject = $qb->expr()->orX(
            'SIZE(p.teams) = 0'
        );

        $orDepartment = $qb->expr()->orX(
            'SIZE(c.teams) = 0'
        );

        if (!empty($directorDeptIds)) {
            $orProject->add($qb->expr()->in('p.department', ':directorDepartments'));
            $qb->setParameter('directorDepartments', $directorDeptIds);
        }

        if (!empty($teams)) {
            $orProject->add($qb->expr()->isMemberOf(':teams', 'p.teams'));
            $orDepartment->add($qb->expr()->isMemberOf(':teams', 'c.teams'));

            $ids = array_values(array_unique(array_map(function (Team $team) {
                return $team->getId();
            }, $teams)));

            $qb->setParameter('teams', $ids);
        }

        $andX->add($orProject);
        $andX->add($orDepartment);

        return $andX;
    }

    /**
     * Returns a query builder that is used for ProjectType and your own 'query_builder' option.
     */
    public function getQueryBuilderForFormType(ProjectFormTypeQuery $query): QueryBuilder
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb
            ->select('p')
            ->from(Project::class, 'p')
            ->leftJoin('p.department', 'c')
            ->addOrderBy('c.name', 'ASC')
            ->addOrderBy('p.name', 'ASC')
        ;

        if ($query->withDepartment()) {
            $qb->addSelect('c');
        }

        $mainQuery = $qb->expr()->andX();

        $mainQuery->add($qb->expr()->eq('p.visible', ':visible'));
        $qb->setParameter('visible', true, ParameterType::BOOLEAN);

        $mainQuery->add($qb->expr()->eq('c.visible', ':department_visible'));
        $qb->setParameter('department_visible', true, ParameterType::BOOLEAN);

        if (!$query->isIgnoreDate()) {
            $andx = $this->addProjectStartAndEndDate($qb, $query->getProjectStart(), $query->getProjectEnd());
            $mainQuery->add($andx);
        }

        if ($query->hasDepartments()) {
            $mainQuery->add($qb->expr()->in('p.department', ':department'));
            $qb->setParameter('department', $query->getDepartments());
        }

        $permissions = $this->getPermissionCriteria($qb, $query->getUser(), $query->getTeams());
        if ($permissions->count() > 0) {
            $mainQuery->add($permissions);
        }

        $outerQuery = $qb->expr()->orX();

        if ($query->hasProjects()) {
            $outerQuery->add($qb->expr()->in('p.id', ':project'));
            $qb->setParameter('project', $query->getProjects());
        }

        if (null !== $query->getProjectToIgnore()) {
            $mainQuery = $qb->expr()->andX(
                $mainQuery,
                $qb->expr()->neq('p.id', ':ignored')
            );
            $qb->setParameter('ignored', $query->getProjectToIgnore());
        }

        $outerQuery->add($mainQuery);
        $qb->andWhere($outerQuery);

        return $qb;
    }

    private function getQueryBuilderForQuery(ProjectQuery $query): QueryBuilder
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb
            ->select('p')
            ->from(Project::class, 'p')
            ->leftJoin('p.department', 'c')
        ;

        if (\count($query->getProjectIds()) > 0) {
            $qb->andWhere($qb->expr()->in('p.id', ':id'))->setParameter('id', $query->getProjectIds());
        }

        foreach ($query->getOrderGroups() as $orderBy => $order) {
            switch ($orderBy) {
                case 'department':
                    $orderBy = 'c.name';
                    break;
                case 'project_start':
                    $orderBy = 'p.start';
                    break;
                case 'project_end':
                    $orderBy = 'p.end';
                    break;
                default:
                    $orderBy = 'p.' . $orderBy;
                    break;
            }
            $qb->addOrderBy($orderBy, $order);
        }

        if (!$query->isShowBoth()) {
            $qb
                ->andWhere($qb->expr()->eq('p.visible', ':visible'))
                ->andWhere($qb->expr()->eq('c.visible', ':department_visible'))
            ;

            if ($query->isShowVisible()) {
                $qb->setParameter('visible', true, ParameterType::BOOLEAN);
            } elseif ($query->isShowHidden()) {
                $qb->setParameter('visible', false, ParameterType::BOOLEAN);
            }

            $qb->setParameter('department_visible', true, ParameterType::BOOLEAN);
        }

        if ($query->hasDepartments()) {
            $qb->andWhere($qb->expr()->in('p.department', ':department'))
                ->setParameter('department', $query->getDepartmentIds());
        }

        if ($query->getGlobalActivities() !== null) {
            $qb->andWhere($qb->expr()->eq('p.globalActivities', ':globalActivities'))
                ->setParameter('globalActivities', $query->getGlobalActivities(), Types::BOOLEAN);
        }

        // this is far from being perfect, possible enhancements:
        // there could also be a range selection to be able to select all projects that were active between from and to
        // begin = null and end = null
        // begin = null and end <= to
        // begin < to and end = null
        // begin > from and end < to
        // ... and more ...
        $times = $this->addProjectStartAndEndDate($qb, $query->getProjectStart(), $query->getProjectEnd());
        if ($times->count() > 0) {
            $qb->andWhere($times);
        }

        $this->addPermissionCriteria($qb, $query->getCurrentUser());

        $configuration = new SearchConfiguration(
            ['p.name', 'p.comment', 'p.orderNumber', 'p.number'],
            ProjectMeta::class,
            'project'
        );
        $helper = new SearchHelper($configuration);
        $helper->addSearchTerm($qb, $query);

        return $qb;
    }

    private function addProjectStartAndEndDate(QueryBuilder $qb, ?DateTime $begin, ?DateTime $end): Andx
    {
        $and = $qb->expr()->andX();

        if (null !== $begin) {
            $and->add(
                $qb->expr()->andX(
                    $qb->expr()->orX(
                        $qb->expr()->lte('DATE(p.start)', 'DATE(:start)'),
                        $qb->expr()->isNull('p.start')
                    ),
                    $qb->expr()->orX(
                        $qb->expr()->gte('DATE(p.end)', 'DATE(:start)'),
                        $qb->expr()->isNull('p.end')
                    )
                )
            );
            $qb->setParameter('start', $begin);
        }

        if (null !== $end) {
            $and->add(
                $qb->expr()->andX(
                    $qb->expr()->orX(
                        $qb->expr()->gte('DATE(p.end)', 'DATE(:end)'),
                        $qb->expr()->isNull('p.end')
                    ),
                    $qb->expr()->orX(
                        $qb->expr()->lte('DATE(p.start)', 'DATE(:end)'),
                        $qb->expr()->isNull('p.start')
                    )
                )
            );
            $qb->setParameter('end', $end);
        }

        return $and;
    }

    /**
     * @return int<0, max>
     */
    public function countProjectsForQuery(ProjectQuery $query): int
    {
        $qb = $this->getQueryBuilderForQuery($query);
        $qb
            ->resetDQLPart('select')
            ->resetDQLPart('orderBy')
            ->resetDQLPart('groupBy')
            ->select($qb->expr()->countDistinct('p.id'))
        ;

        return (int) $qb->getQuery()->getSingleScalarResult(); // @phpstan-ignore-line
    }

    public function getPagerfantaForQuery(ProjectQuery $query): Pagination
    {
        return new Pagination($this->getPaginatorForQuery($query), $query);
    }

    /**
     * @return PaginatorInterface<Project>
     */
    private function getPaginatorForQuery(ProjectQuery $projectQuery): PaginatorInterface
    {
        $counter = $this->countProjectsForQuery($projectQuery);
        $query = $this->createProjectQuery($projectQuery);

        return new LoaderQueryPaginator(new ProjectLoader($this->getEntityManager(), false, true), $query, $counter);
    }

    /**
     * @return Project[]
     */
    public function getProjectsForQuery(ProjectQuery $query): array
    {
        return $this->getProjects($this->createProjectQuery($query));
    }

    /**
     * @param Query<Project> $query
     * @return Project[]
     */
    public function getProjects(Query $query): array
    {
        /** @var array<Project> $projects */
        $projects = $query->execute();

        $loader = new ProjectLoader($this->getEntityManager(), false, true);
        $loader->loadResults($projects);

        return $projects;
    }

    public function deleteProject(Project $delete, ?Project $replace = null): void
    {
        $em = $this->getEntityManager();
        $em->beginTransaction();

        try {
            if (null !== $replace) {
                $qb = $em->createQueryBuilder();
                $qb
                    ->update(Timesheet::class, 't')
                    ->set('t.project', ':replace')
                    ->where('t.project = :delete')
                    ->setParameter('delete', $delete)
                    ->setParameter('replace', $replace)
                    ->getQuery()
                    ->execute();

                $qb = $em->createQueryBuilder();
                $qb
                    ->update(Activity::class, 'a')
                    ->set('a.project', ':replace')
                    ->where('a.project = :delete')
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
     * @return array<ProjectComment>
     */
    public function getComments(Project $project): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb
            ->select('comments')
            ->from(ProjectComment::class, 'comments')
            ->andWhere($qb->expr()->eq('comments.project', ':project'))
            ->addOrderBy('comments.pinned', 'DESC')
            ->addOrderBy('comments.createdAt', 'DESC')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function saveComment(ProjectComment $comment): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($comment);
        $entityManager->flush();
    }

    public function deleteComment(ProjectComment $comment): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->remove($comment);
        $entityManager->flush();
    }

    /**
     * @return Query<Project>
     */
    private function createProjectQuery(ProjectQuery $projectQuery): Query
    {
        $query = $this->getQueryBuilderForQuery($projectQuery)->getQuery();
        $query = $this->prepareProjectQuery($query);

        foreach ($projectQuery->getHydrate() as $hydrate) {
            switch ($hydrate) {
                case ProjectQueryHydrate::TEAMS:
                    // does not yet work, see https://github.com/doctrine/orm/pull/8391
                    // $query->setFetchMode(Project::class, 'teams', ClassMetadata::FETCH_EAGER);
                    break;

                case ProjectQueryHydrate::TEAM_MEMBER:
                    // does not yet work, see https://github.com/doctrine/orm/issues/11254
                    // $query->setFetchMode(Project::class, 'teams', ClassMetadata::FETCH_EAGER);
                    // $query->setFetchMode(Team::class, 'members', ClassMetadata::FETCH_EAGER);
                    // $query->setFetchMode(TeamMember::class, 'user', ClassMetadata::FETCH_EAGER);
                    break;
            }
        }

        return $query;
    }

    /**
     * @param Query<Project> $query
     * @return Query<Project>
     */
    public function prepareProjectQuery(Query $query): Query
    {
        $this->getEntityManager()->getConfiguration()->setEagerFetchBatchSize(300);

        $query->setFetchMode(Project::class, 'meta', ClassMetadata::FETCH_EAGER);
        $query->setFetchMode(Project::class, 'department', ClassMetadata::FETCH_EAGER);

        return $query;
    }
}
