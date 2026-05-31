<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Repository;

use App\Entity\User;
use Doctrine\ORM\EntityRepository;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;

class WeeklySubmissionRepository extends EntityRepository
{
    public function findForUserAndWeek(User $user, \DateTimeImmutable $weekStart): ?WeeklySubmission
    {
        return $this->findOneBy(['user' => $user, 'weekStart' => $weekStart]);
    }

    /**
     * @return int[]
     */
    public function getSupervisedUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();
        $title = $user->getTitle();

        if ($title === 'Director') {
            // All users in departments where this director has a team membership
            $sql = "SELECT DISTINCT u.id FROM kimai2_users u
                    JOIN kimai2_users_teams utm ON u.id = utm.user_id
                    JOIN kimai2_teams ut ON utm.team_id = ut.id
                    JOIN kimai2_departments_teams dt ON ut.id = dt.team_id
                    WHERE dt.department_id IN (
                        SELECT dt2.department_id FROM kimai2_users_teams tm2
                        JOIN kimai2_teams t2 ON tm2.team_id = t2.id
                        JOIN kimai2_departments_teams dt2 ON t2.id = dt2.team_id
                        WHERE tm2.user_id = :user_id
                    )";
        } elseif ($title === 'Manager') {
            // Users in teams where this manager is a teamlead
            $sql = "SELECT DISTINCT u.id FROM kimai2_users u
                    JOIN kimai2_users_teams tm ON u.id = tm.user_id
                    JOIN kimai2_teams t ON tm.team_id = t.id
                    WHERE t.id IN (
                        SELECT tm2.team_id FROM kimai2_users_teams tm2
                        WHERE tm2.user_id = :user_id AND tm2.teamlead = 1
                    )";
        } else {
            // Direct supervisees only
            $sql = "SELECT id FROM kimai2_users WHERE supervisor_id = :user_id";
        }

        $stmt = $conn->executeQuery($sql, ['user_id' => $userId]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findPendingForSupervisor(User $supervisor): array
    {
        $userIds = $this->getSupervisedUserIds($supervisor);

        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $supervisor->getId()));

        if (empty($userIds)) {
            return [];
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUBMITTED)
            ->andWhere('s.user IN (:userIds)')
            ->setParameter('userIds', $userIds)
            ->orderBy('s.weekStart', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findHistoryForSupervisor(User $supervisor): array
    {
        $userIds = $this->getSupervisedUserIds($supervisor);

        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $supervisor->getId()));

        if (empty($userIds)) {
            return [];
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status IN (:statuses)')
            ->setParameter('statuses', [WeeklySubmission::STATUS_APPROVED, WeeklySubmission::STATUS_REJECTED])
            ->andWhere('s.user IN (:userIds)')
            ->setParameter('userIds', $userIds)
            ->orderBy('s.approvedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findHistoryForUser(User $user): array
    {
        return $this->findBy(
            ['user' => $user],
            ['weekStart' => 'DESC']
        );
    }

    public function countPendingForSupervisor(User $supervisor): int
    {
        $userIds = $this->getSupervisedUserIds($supervisor);

        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $supervisor->getId()));

        if (empty($userIds)) {
            return 0;
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('COUNT(s.id)')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUBMITTED)
            ->andWhere('s.user IN (:userIds)')
            ->setParameter('userIds', $userIds);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
