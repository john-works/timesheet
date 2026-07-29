<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Entity\WeeklySubmission;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'kimai:weekly:send-approval-reminders')]
class SendApprovalRemindersCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly WeeklySubmissionMailer $mailer,
        private readonly WeeklySubmissionRepository $submissionRepository,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Send reminder emails to supervisors about pending staff submissions to approve')
            ->addOption('dry-run', null, \Symfony\Component\Console\Input\InputOption::VALUE_NONE, 'Show what would be sent without sending emails');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $dayOfWeek = (int) $now->format('N');

        // Skip weekends
        if ($dayOfWeek >= 6) {
            $output->writeln('<info>Weekend - skipping approval reminders.</info>');
            return Command::SUCCESS;
        }

        $conn = $this->em->getConnection();

        // Find all distinct potential approvers who have pending items.
        // Approvers can be: direct supervisors, team leads, department directors,
        // or users who have submissions reassigned to them.
        $approverIds = [];

        // 1. Supervisors of users with STATUS_SUBMITTED
        $rows = $conn->fetchAllAssociative("
            SELECT DISTINCT COALESCE(ws.reassigned_to, u.supervisor_id) AS approver_id
            FROM kimai2_weekly_submissions ws
            JOIN kimai2_users u ON u.id = ws.user_id
            WHERE ws.status = 'submitted' AND u.enabled = 1
        ");
        foreach ($rows as $row) {
            if (!empty($row['approver_id'])) {
                $approverIds[(int) $row['approver_id']] = true;
            }
        }

        // 2. Team leads whose team members have STATUS_SUBMITTED
        $rows = $conn->fetchAllAssociative("
            SELECT DISTINCT ut_lead.user_id AS approver_id
            FROM kimai2_weekly_submissions ws
            JOIN kimai2_users_teams ut_member ON ut_member.user_id = ws.user_id
            JOIN kimai2_users_teams ut_lead ON ut_lead.team_id = ut_member.team_id AND ut_lead.teamlead = 1
            WHERE ws.status = 'submitted'
        ");
        foreach ($rows as $row) {
            if (!empty($row['approver_id'])) {
                $approverIds[(int) $row['approver_id']] = true;
            }
        }

        // 3. Department directors whose department members have STATUS_SUBMITTED
        $rows = $conn->fetchAllAssociative("
            SELECT DISTINCT d.director_id AS approver_id
            FROM kimai2_weekly_submissions ws
            JOIN kimai2_users u ON u.id = ws.user_id
            JOIN kimai2_departments d ON d.director_id IS NOT NULL
            WHERE ws.status = 'submitted'
              AND (EXISTS (
                    SELECT 1 FROM kimai2_teams t
                    JOIN kimai2_departments_teams dt ON dt.team_id = t.id
                    WHERE dt.department_id = d.id AND u.id IN (
                        SELECT user_id FROM kimai2_users_teams WHERE team_id = t.id
                    )
              ))
        ");
        foreach ($rows as $row) {
            if (!empty($row['approver_id'])) {
                $approverIds[(int) $row['approver_id']] = true;
            }
        }

        // 4. Approvers for STATUS_SUPERVISOR_APPROVED (managers/directors/reassigned)
        $rows = $conn->fetchAllAssociative("
            SELECT DISTINCT COALESCE(ws.reassigned_to, u.supervisor_id) AS approver_id
            FROM kimai2_weekly_submissions ws
            JOIN kimai2_users u ON u.id = ws.user_id
            WHERE ws.status = 'supervisor_approved' AND u.enabled = 1
        ");
        foreach ($rows as $row) {
            if (!empty($row['approver_id'])) {
                $approverIds[(int) $row['approver_id']] = true;
            }
        }

        $approverIds = array_keys($approverIds);

        if (empty($approverIds)) {
            $output->writeln('<info>No pending submissions found for any approver.</info>');
            return Command::SUCCESS;
        }

        $dryRun = $input->getOption('dry-run');
        $sentCount = 0;
        $errorCount = 0;

        foreach ($approverIds as $approverId) {
            $approver = $this->userRepository->find($approverId);
            if ($approver === null || !$approver->isEnabled()) {
                continue;
            }

            // Use the repository methods to get actual pending items for this approver
            $staffList = [];

            // Stage 1: submitted items
            $submitted = $this->submissionRepository->findPendingForSupervisor($approver);
            foreach ($submitted as $s) {
                $staffList[] = [
                    'staffName' => $s->getUser()->getDisplayName(),
                    'status' => $s->getStatus(),
                    'statusLabel' => 'Pending My Approval',
                ];
            }

            // Stage 2: supervisor_approved items
            $approved = $this->submissionRepository->findSupervisorApprovedForManager($approver);
            foreach ($approved as $s) {
                $staffList[] = [
                    'staffName' => $s->getUser()->getDisplayName(),
                    'status' => $s->getStatus(),
                    'statusLabel' => 'Awaiting Final Approval',
                ];
            }

            if (empty($staffList)) {
                continue;
            }

            $weekStart = $now->modify('monday this week')->format('Y-m-d');
            $weekEnd = $now->modify('friday this week')->format('Y-m-d');

            if ($dryRun) {
                $output->writeln(sprintf('<info>[DRY-RUN] Would send to %s (%s) - %d pending</info>',
                    $approver->getDisplayName(), $approver->getEmail(), count($staffList)));
                $sentCount++;
                continue;
            }

            try {
                $this->mailer->sendApprovalReminder($approver, $staffList, $weekStart, $weekEnd);
                $output->writeln(sprintf('<info>Approval reminder sent to %s (%s) - %d pending</info>',
                    $approver->getDisplayName(), $approver->getEmail(), count($staffList)));
                $sentCount++;
            } catch (\Exception $e) {
                $output->writeln(sprintf('<error>Failed to send to %s: %s</error>',
                    $approver->getUserIdentifier(), $e->getMessage()));
                $errorCount++;
            }
        }

        $label = $dryRun ? 'Would send' : 'Sent';
        $output->writeln(sprintf('<info>Done. %s: %d, Errors: %d</info>', $label, $sentCount, $errorCount));

        return $errorCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
