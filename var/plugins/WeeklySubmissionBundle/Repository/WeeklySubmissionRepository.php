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

        $sql = "SELECT id FROM kimai2_users WHERE supervisor_id = :user_id";

        $stmt = $conn->executeQuery($sql, ['user_id' => $userId]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * @return int[]
     */
    public function getViewableUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "
            SELECT id FROM kimai2_users WHERE supervisor_id = :user_id
            UNION
            SELECT DISTINCT ut_member.user_id
            FROM kimai2_users_teams ut_member
            JOIN kimai2_users_teams ut_lead ON ut_lead.team_id = ut_member.team_id
            WHERE ut_lead.user_id = :user_id6 AND ut_lead.teamlead = 1
            UNION
            SELECT DISTINCT ut.user_id
            FROM kimai2_users_teams ut
            JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
            JOIN kimai2_departments d ON d.id = dt.department_id
            WHERE d.director_id = :user_id2
        ";

        $stmt = $conn->executeQuery($sql, [
            'user_id' => $userId,
            'user_id2' => $userId,
            'user_id6' => $userId,
        ]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * @return int[]
     */
    public function getHistoryViewableUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "
            SELECT id FROM kimai2_users WHERE supervisor_id = :user_id
            UNION
            SELECT ut2.user_id FROM kimai2_users_teams ut1
            JOIN kimai2_users_teams ut2 ON ut2.team_id = ut1.team_id
            WHERE ut1.user_id = :user_id2 AND ut1.teamlead = 1
            UNION
            SELECT ut2.user_id FROM kimai2_users_teams ut1
            JOIN kimai2_users_teams ut2 ON ut2.team_id = ut1.team_id
            WHERE ut1.user_id = :user_id3
            AND (:user_id4 IN (SELECT id FROM kimai2_users WHERE roles LIKE '%ROLE_TEAMLEAD%' OR roles LIKE '%ROLE_DIRECTOR%' OR title LIKE '%Manager%' OR title LIKE '%Director%'))
            UNION
            SELECT DISTINCT ut.user_id
            FROM kimai2_users_teams ut
            JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
            JOIN kimai2_departments d ON d.id = dt.department_id
            WHERE d.director_id = :user_id5
        ";

        $stmt = $conn->executeQuery($sql, [
            'user_id' => $userId,
            'user_id2' => $userId,
            'user_id3' => $userId,
            'user_id4' => $userId,
            'user_id5' => $userId,
        ]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * Get the team lead (manager) user IDs for the teams that the given user belongs to.
     * @return int[]
     */
    public function getManagerIdsForUser(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "SELECT DISTINCT ut_lead.user_id
                FROM kimai2_users_teams ut_member
                JOIN kimai2_users_teams ut_lead ON ut_lead.team_id = ut_member.team_id
                WHERE ut_member.user_id = :user_id
                AND ut_lead.teamlead = 1
                AND ut_lead.user_id != :user_id2";

        $stmt = $conn->executeQuery($sql, [
            'user_id' => $userId,
            'user_id2' => $userId,
        ]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * Check if a user is a team lead (manager) of any team.
     */
    public function isTeamLead(User $user): bool
    {
        $conn = $this->getEntityManager()->getConnection();
        $count = $conn->fetchOne(
            'SELECT COUNT(*) FROM kimai2_users_teams WHERE user_id = :user_id AND teamlead = 1',
            ['user_id' => $user->getId()]
        );
        return (int) $count > 0;
    }

    /**
     * Find the director of the department that the given user belongs to.
     * Follows the chain: user -> teams -> departments -> director
     */
    public function getDirectorForUser(User $user): ?User
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "SELECT d.director_id
                FROM kimai2_departments d
                JOIN kimai2_departments_teams dt ON dt.department_id = d.id
                JOIN kimai2_users_teams ut ON ut.team_id = dt.team_id
                WHERE ut.user_id = :user_id
                AND d.director_id IS NOT NULL
                LIMIT 1";

        $directorId = $conn->fetchOne($sql, ['user_id' => $userId]);

        if ($directorId === false) {
            return null;
        }

        return $this->getEntityManager()->getRepository(User::class)->find((int) $directorId);
    }

    /**
     * Get user IDs whose team lead is the given user (manager).
     * @return int[]
     */
    public function getManagedUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "SELECT DISTINCT ut_member.user_id
                FROM kimai2_users_teams ut_member
                JOIN kimai2_users_teams ut_lead ON ut_lead.team_id = ut_member.team_id
                WHERE ut_lead.user_id = :user_id
                AND ut_lead.teamlead = 1
                AND ut_member.user_id != :user_id2";

        $stmt = $conn->executeQuery($sql, [
            'user_id' => $userId,
            'user_id2' => $userId,
        ]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * Get user IDs for users who belong to departments where the given user is director.
     * @return int[]
     */
    public function getDirectorManagedUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "SELECT DISTINCT ut.user_id
                FROM kimai2_users_teams ut
                JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
                JOIN kimai2_departments d ON d.id = dt.department_id
                WHERE d.director_id = :user_id
                AND ut.user_id != :user_id2";

        $stmt = $conn->executeQuery($sql, [
            'user_id' => $userId,
            'user_id2' => $userId,
        ]);

        return array_map('intval', $stmt->fetchFirstColumn());
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findPendingForSupervisor(User $supervisor): array
    {
        $userIds = $this->getViewableUserIds($supervisor);

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
    public function findSupervisorApprovedForManager(User $user): array
    {
        $userIds = $this->getSupervisorApprovedUserIds($user);

        if (empty($userIds)) {
            return [];
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUPERVISOR_APPROVED)
            ->andWhere('s.user IN (:userIds)')
            ->setParameter('userIds', $userIds)
            ->orderBy('s.weekStart', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get user IDs whose supervisor_approved submissions this user can act on.
     * @return int[]
     */
    private function getSupervisorApprovedUserIds(User $user): array
    {
        $managedIds = $this->getManagedUserIds($user);
        $directorManagedIds = $this->getDirectorManagedUserIds($user);

        $userIds = [];

        if (!empty($managedIds)) {
            $users = $this->getEntityManager()
                ->getRepository(User::class)
                ->findBy(['id' => $managedIds]);
            foreach ($users as $u) {
                if (!$this->isSeniorOfficer($u) && !$u->isDirector()) {
                    $userIds[] = $u->getId();
                }
            }
        }

        if (!empty($directorManagedIds)) {
            $users = $this->getEntityManager()
                ->getRepository(User::class)
                ->findBy(['id' => $directorManagedIds]);
            foreach ($users as $u) {
                if ($this->isSeniorOfficer($u)) {
                    $userIds[] = $u->getId();
                }
            }
        }

        return array_values(array_filter(
            array_unique($userIds),
            fn(int $id) => $id !== $user->getId()
        ));
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findHistoryForSupervisor(User $supervisor): array
    {
        $userIds = $this->getHistoryViewableUserIds($supervisor);

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
        $userIds = $this->getViewableUserIds($supervisor);

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

    public function countSupervisorApprovedForUser(User $user): int
    {
        $userIds = $this->getSupervisorApprovedUserIds($user);

        if (empty($userIds)) {
            return 0;
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('COUNT(s.id)')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUPERVISOR_APPROVED)
            ->andWhere('s.user IN (:userIds)')
            ->setParameter('userIds', $userIds);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Find the next approver for a submission after supervisor approves.
     *
     * - Directors: no next approver (goes to APPROVED directly)
     * - Senior Officers: director is the next approver
     * - Officers and below: manager/teamlead is the next approver
     */
    public function getNextApproverType(User $staffUser): ?string
    {
        if ($staffUser->isDirector()) {
            return null;
        }

        if ($this->isSeniorOfficer($staffUser)) {
            $director = $this->getDirectorForUser($staffUser);
            if ($director !== null) {
                return 'director';
            }
            return null;
        }

        $managerIds = $this->getManagerIdsForUser($staffUser);
        if (!empty($managerIds)) {
            return 'manager';
        }

        return null;
    }

    /**
     * Get the User entity for the next approver.
     */
    public function getNextApprover(User $staffUser): ?User
    {
        if ($staffUser->isDirector()) {
            return null;
        }

        if ($this->isSeniorOfficer($staffUser)) {
            return $this->getDirectorForUser($staffUser);
        }

        $managerIds = $this->getManagerIdsForUser($staffUser);
        if (!empty($managerIds)) {
            return $this->getEntityManager()->getRepository(User::class)->find($managerIds[0]);
        }

        return null;
    }

    public function isSeniorOfficer(User $user): bool
    {
        $title = $user->getTitle();
        if ($title === null || $title === '') {
            return false;
        }

        return stripos($title, 'Senior Officer') === 0 || stripos($title, 'Senior Office') === 0;
    }
}
