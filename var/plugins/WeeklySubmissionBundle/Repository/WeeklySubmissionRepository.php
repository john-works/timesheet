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

        // ED can see all department directors' submissions
        if ($this->isEdUser($supervisor)) {
            $conn = $this->getEntityManager()->getConnection();
            $directorIds = array_map('intval', $conn->fetchFirstColumn(
                "SELECT DISTINCT director_id FROM kimai2_departments WHERE director_id IS NOT NULL"
            ));
            $userIds = array_values(array_unique(array_merge($userIds, $directorIds)));
        }

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUBMITTED)
            ->orderBy('s.weekStart', 'DESC');

        if (!empty($userIds)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->in('s.user', ':userIds'),
                    $qb->expr()->eq('s.reassignedTo', ':reassignedTo')
                )
            );
            $qb->setParameter('userIds', $userIds);
        } else {
            $qb->andWhere('s.reassignedTo = :reassignedTo');
        }
        $qb->setParameter('reassignedTo', $supervisor);

        return $qb->getQuery()->getResult();
    }

    /**
     * @return WeeklySubmission[]
     */
    public function findSupervisorApprovedForManager(User $user): array
    {
        $userIds = $this->getSupervisorApprovedUserIds($user);

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUPERVISOR_APPROVED)
            ->orderBy('s.weekStart', 'DESC');

        $conditions = $qb->expr()->orX(
            $qb->expr()->eq('s.reassignedTo', ':reassignedTo')
        );
        $qb->setParameter('reassignedTo', $user);

        if (!empty($userIds)) {
            $conditions->add($qb->expr()->in('s.user', ':userIds'));
            $qb->setParameter('userIds', $userIds);
        }

        $qb->andWhere($conditions);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get user IDs whose supervisor_approved submissions this user can act on.
     * @return int[]
     */
    private function getSupervisorApprovedUserIds(User $user): array
    {
        $directorManagedIds = $this->getDirectorManagedUserIds($user);
        $managedIds = $this->getManagedUserIds($user);

        $userIds = [];

        // Team leads/managers see their team members (Officers & below) for second-tier approval
        if (!empty($managedIds)) {
            $userIds = array_merge($userIds, $managedIds);
        }

        // Directors see all non-manager, non-director staff for final approval
        if (!empty($directorManagedIds)) {
            $users = $this->getEntityManager()
                ->getRepository(User::class)
                ->findBy(['id' => $directorManagedIds]);
            foreach ($users as $u) {
                if (!$this->isTeamLead($u) && !$u->isDirector()) {
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

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status IN (:statuses)')
            ->setParameter('statuses', [WeeklySubmission::STATUS_APPROVED, WeeklySubmission::STATUS_REJECTED, WeeklySubmission::STATUS_MANAGER_APPROVED])
            ->orderBy('s.approvedAt', 'DESC');

        $conditions = $qb->expr()->orX(
            $qb->expr()->eq('s.reassignedTo', ':reassignedTo')
        );
        $qb->setParameter('reassignedTo', $supervisor);

        if (!empty($userIds)) {
            $conditions->add($qb->expr()->in('s.user', ':userIds'));
            $qb->setParameter('userIds', $userIds);
        }

        $qb->andWhere($conditions);

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

    /**
     * @return WeeklySubmission[]
     */
    public function findAllSubmitted(): array
    {
        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_SUBMITTED)
            ->orderBy('s.weekStart', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function countPendingForSupervisor(User $supervisor): int
    {
        $userIds = $this->getViewableUserIds($supervisor);

        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $supervisor->getId()));

        // ED can see all department directors' submissions
        if ($this->isEdUser($supervisor)) {
            $conn = $this->getEntityManager()->getConnection();
            $directorIds = array_map('intval', $conn->fetchFirstColumn(
                "SELECT DISTINCT director_id FROM kimai2_departments WHERE director_id IS NOT NULL"
            ));
            $userIds = array_values(array_unique(array_merge($userIds, $directorIds)));
        }

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
     * @return WeeklySubmission[]
     */
    public function findManagerApprovedForHR(User $hrUser): array
    {
        $userIds = $this->getViewableUserIds($hrUser);
        $userIds = array_values(array_filter($userIds, fn(int $id) => $id !== $hrUser->getId()));

        $qb = $this->createQueryBuilder('s');
        $qb->select('s')
            ->where('s.status = :status')
            ->setParameter('status', WeeklySubmission::STATUS_MANAGER_APPROVED)
            ->andWhere('s.isOvertime = :overtime')
            ->setParameter('overtime', true)
            ->orderBy('s.weekStart', 'DESC');

        if (!empty($userIds)) {
            $qb->andWhere('s.user IN (:userIds)');
            $qb->setParameter('userIds', $userIds);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find the next approver for a submission after supervisor approves.
     *
     * Single-level workflow for Performance Monitoring Regional Offices:
     *   - All users (officers, managers, director): no next approver (goes to APPROVED directly)
     *
     * For other departments:
     *   - Directors: no next approver (goes to APPROVED directly)
     *   - Senior Officers: director is the next approver
     *   - Officers and below: manager/teamlead is the next approver
     */
    public function getNextApproverType(User $staffUser): ?string
    {
        if ($this->isInRegionalDepartment($staffUser)) {
            return null;
        }

        if ($staffUser->isDirector()) {
            return null;
        }

        if ($this->isTeamLead($staffUser)) {
            return null;
        }

        // Senior Officers — director is the final approver
        if ($this->isSeniorOfficer($staffUser)) {
            return 'director';
        }

        // Officers & below — team lead/manager is the final approver
        $supervisorId = $staffUser->getSupervisor()?->getId();
        $managerIds = $this->getManagerIdsForUser($staffUser);
        $managerIds = array_values(array_filter($managerIds, fn(int $id) => $id !== $supervisorId));

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
        // Single-level workflow for Regional Offices department
        if ($this->isInRegionalDepartment($staffUser)) {
            return null;
        }

        if ($staffUser->isDirector()) {
            return null;
        }

        // Managers (team leads) — single step, their supervisor (Director) approves directly
        if ($this->isTeamLead($staffUser)) {
            return null;
        }

        // Senior Officers — department director is the final approver
        if ($this->isSeniorOfficer($staffUser)) {
            return $this->getDirectorForUser($staffUser);
        }

        // Officers & below — team lead/manager is the final approver
        $supervisorId = $staffUser->getSupervisor()?->getId();
        $managerIds = $this->getManagerIdsForUser($staffUser);
        $managerIds = array_values(array_filter($managerIds, fn(int $id) => $id !== $supervisorId));

        if (!empty($managerIds)) {
            return $this->getEntityManager()->getRepository(User::class)->find($managerIds[0]);
        }

        return null;
    }

    /**
     * Get all enabled user IDs who share at least one department with the given user.
     * For Regional department directors, also includes the ED so they can select them as supervisor.
     * @return int[]
     */
    public function getDepartmentUserIds(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $userId = $user->getId();

        $sql = "SELECT DISTINCT ut2.user_id
                FROM kimai2_users_teams ut1
                JOIN kimai2_departments_teams dt ON dt.team_id = ut1.team_id
                JOIN kimai2_departments_teams dt2 ON dt2.department_id = dt.department_id
                JOIN kimai2_users_teams ut2 ON ut2.team_id = dt2.team_id
                JOIN kimai2_users u ON u.id = ut2.user_id
                WHERE ut1.user_id = :user_id
                AND u.enabled = 1";

        $stmt = $conn->executeQuery($sql, ['user_id' => $userId]);
        $userIds = array_map('intval', $stmt->fetchFirstColumn());

        // Regional department directors can also select the ED as supervisor
        if ($this->isRegionalDirector($user)) {
            $edSql = "SELECT director_id FROM kimai2_departments WHERE name = 'Executive Director''s Office' AND director_id IS NOT NULL";
            $edId = $conn->fetchOne($edSql);
            if ($edId !== false) {
                $userIds[] = (int) $edId;
            }
        }

        return array_values(array_unique($userIds));
    }

    public function isSeniorOfficer(User $user): bool
    {
        $title = $user->getTitle();
        if ($title === null || $title === '') {
            return false;
        }

        return stripos($title, 'Senior Officer') === 0 || stripos($title, 'Senior Office') === 0;
    }

    /**
     * Check if a user belongs to the Performance Monitoring Regional Offices department.
     */
    public function isInRegionalDepartment(User $user): bool
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "SELECT COUNT(*) FROM kimai2_users_teams ut
                JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
                JOIN kimai2_departments d ON d.id = dt.department_id
                WHERE ut.user_id = :user_id
                AND d.name = 'Performance Monitoring Regional Offices'";

        return (int) $conn->fetchOne($sql, ['user_id' => $user->getId()]) > 0;
    }

    /**
     * Check if a user is a team lead (manager) in the Regional Offices department.
     */
    public function isRegionalManager(User $user): bool
    {
        if (!$this->isInRegionalDepartment($user)) {
            return false;
        }

        $conn = $this->getEntityManager()->getConnection();

        $sql = "SELECT COUNT(*) FROM kimai2_users_teams ut
                JOIN kimai2_departments_teams dt ON dt.team_id = ut.team_id
                JOIN kimai2_departments d ON d.id = dt.department_id
                WHERE ut.user_id = :user_id
                AND ut.teamlead = 1
                AND d.name = 'Performance Monitoring Regional Offices'";

        return (int) $conn->fetchOne($sql, ['user_id' => $user->getId()]) > 0;
    }

    /**
     * Check if a user is the director of the Performance Monitoring Regional Offices department.
     */
    public function isRegionalDirector(User $user): bool
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "SELECT COUNT(*) FROM kimai2_departments d
                WHERE d.name = 'Performance Monitoring Regional Offices'
                AND d.director_id = :user_id";

        return (int) $conn->fetchOne($sql, ['user_id' => $user->getId()]) > 0;
    }

    /**
     * Check if a user is the Executive Director (director of the Executive Director's Office).
     */
    public function isEdUser(User $user): bool
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "SELECT COUNT(*) FROM kimai2_departments d
                WHERE d.name = 'Executive Director''s Office'
                AND d.director_id = :user_id";

        return (int) $conn->fetchOne($sql, ['user_id' => $user->getId()]) > 0;
    }

    public function countPendingNotifications(User $user): array
    {
        $submittedIds = $this->getViewableUserIds($user);
        $managerIds = $this->getSupervisorApprovedUserIds($user);

        $actionCount = 0;
        $ownCount = 0;

        // Count STATUS_SUBMITTED needing supervisor action
        $qb = $this->createQueryBuilder('s');
        $qb->select('COUNT(s.id)')
            ->where('s.status = :submitted')
            ->setParameter('submitted', WeeklySubmission::STATUS_SUBMITTED);

        $submittedConditions = $qb->expr()->orX(
            $qb->expr()->eq('s.reassignedTo', ':user')
        );
        $qb->setParameter('user', $user);

        if (!empty($submittedIds)) {
            $submittedConditions->add($qb->expr()->in('s.user', ':submittedIds'));
            $qb->setParameter('submittedIds', $submittedIds);
        }

        $qb->andWhere($submittedConditions);
        $actionCount += (int) $qb->getQuery()->getSingleScalarResult();

        // Count STATUS_SUPERVISOR_APPROVED needing manager action
        $qb2 = $this->createQueryBuilder('s');
        $qb2->select('COUNT(s.id)')
            ->where('s.status = :supervisorApproved')
            ->setParameter('supervisorApproved', WeeklySubmission::STATUS_SUPERVISOR_APPROVED);

        $managerConditions = $qb2->expr()->orX(
            $qb2->expr()->eq('s.reassignedTo', ':user2')
        );
        $qb2->setParameter('user2', $user);

        if (!empty($managerIds)) {
            $managerConditions->add($qb2->expr()->in('s.user', ':managerIds'));
            $qb2->setParameter('managerIds', $managerIds);
        }

        $qb2->andWhere($managerConditions);
        $actionCount += (int) $qb2->getQuery()->getSingleScalarResult();

        // Count user's own submissions with recent activity (last 7 days)
        $sevenDaysAgo = new \DateTimeImmutable('-7 days');
        $qb3 = $this->createQueryBuilder('s');
        $qb3->select('COUNT(s.id)')
            ->where('s.user = :self')
            ->setParameter('self', $user)
            ->andWhere('s.status IN (:selfStatuses)')
            ->setParameter('selfStatuses', [
                WeeklySubmission::STATUS_SUBMITTED,
                WeeklySubmission::STATUS_APPROVED,
                WeeklySubmission::STATUS_REJECTED,
                WeeklySubmission::STATUS_SUPERVISOR_APPROVED,
            ])
            ->andWhere(
                $qb3->expr()->orX(
                    $qb3->expr()->eq('s.status', ':submittedSelf'),
                    $qb3->expr()->gte('s.approvedAt', ':since'),
                    $qb3->expr()->gte('s.managerApprovedAt', ':since')
                )
            )
            ->setParameter('submittedSelf', WeeklySubmission::STATUS_SUBMITTED)
            ->setParameter('since', $sevenDaysAgo);

        $ownCount += (int) $qb3->getQuery()->getSingleScalarResult();

        return [
            'count' => $actionCount + $ownCount,
            'actionCount' => $actionCount,
            'ownCount' => $ownCount,
        ];
    }
}
