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

        // Auto-finish single-level flows that are stuck at the supervisor stage.
        $finalized = $this->submissionRepository->autoFinalizeSingleLevelApprovals();
        if ($finalized > 0) {
            $output->writeln(sprintf('<info>Auto-finalized %d single-level approval(s).</info>', $finalized));
        }

        $conn = $this->em->getConnection();

        // Only ever remind the single user who is the CURRENT approver for each
        // pending submission, following the configured approval flow:
        //   submitted           -> reassigned_to, else the staff user's supervisor (Step 1)
        //   supervisor_approved -> reassigned_to, else the staff user's Step 2 approver
        $rows = $conn->fetchAllAssociative("
            SELECT DISTINCT CASE
                WHEN ws.status = 'submitted' THEN COALESCE(ws.reassigned_to, u.supervisor_id)
                ELSE COALESCE(ws.reassigned_to, u.step2_approver_id)
            END AS approver_id
            FROM kimai2_weekly_submissions ws
            JOIN kimai2_users u ON u.id = ws.user_id
            WHERE ws.status IN ('submitted', 'supervisor_approved')
              AND u.enabled = 1
        ");

        $approverIds = [];
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
            $submitted = $this->submissionRepository->findPendingForCurrentApprover($approver, WeeklySubmission::STATUS_SUBMITTED);
            foreach ($submitted as $s) {
                $staffList[] = [
                    'staffName' => $s->getUser()->getDisplayName(),
                    'status' => $s->getStatus(),
                    'statusLabel' => 'Pending My Approval',
                ];
            }

            // Stage 2: supervisor_approved items
            $approved = $this->submissionRepository->findPendingForCurrentApprover($approver, WeeklySubmission::STATUS_SUPERVISOR_APPROVED);
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
