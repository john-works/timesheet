<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Mail\WeeklySubmissionMailer;
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
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Send reminder emails to supervisors about pending staff submissions to approve');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Kampala'));
        $prevWeekStart = $now->modify('monday last week')->setTime(0, 0, 0);
        $weekStart = $prevWeekStart->format('Y-m-d');
        $weekEnd = $prevWeekStart->modify('+4 days')->format('Y-m-d');

        // Testing: get Wilson Byekwaso's pending staff, but send to jssekamatte
        $supervisor = $this->userRepository->findOneBy(['username' => 'jssekamatte']);
        $dataSupervisor = $this->userRepository->findOneBy(['username' => 'wbyekwaso']);

        if ($supervisor === null) {
            $output->writeln('<error>Test user jssekamatte not found.</error>');
            return Command::FAILURE;
        }
        if ($dataSupervisor === null) {
            $output->writeln('<error>Test supervisor wilson not found.</error>');
            return Command::FAILURE;
        }

        $conn = $this->em->getConnection();

        // Find staff under the data supervisor whose submissions are pending
        $sql = "SELECT COALESCE(NULLIF(u.alias, ''), u.username) as name, ws.status
                FROM kimai2_weekly_submissions ws
                JOIN kimai2_users u ON u.id = ws.user_id
                WHERE ws.user_id IN (
                    SELECT DISTINCT ut_member.user_id
                    FROM kimai2_users_teams ut_member
                    JOIN kimai2_users_teams ut_lead ON ut_lead.team_id = ut_member.team_id
                    JOIN kimai2_users u2 ON u2.id = ut_member.user_id
                    WHERE ut_lead.user_id = :supervisor_id
                    AND ut_lead.teamlead = 1
                    AND ut_member.user_id != :supervisor_id
                    AND NOT EXISTS (SELECT 1 FROM kimai2_departments d WHERE d.director_id = ut_member.user_id)
                    AND u2.roles NOT LIKE '%ROLE_DIRECTOR%'
                )
                AND ws.status IN ('submitted', 'supervisor_approved')
                AND ws.week_start = :week_start
                ORDER BY u.alias, u.username";

        $stmt = $conn->executeQuery($sql, [
            'supervisor_id' => $dataSupervisor->getId(),
            'week_start' => $weekStart,
        ]);

        $staffList = [];
        while ($row = $stmt->fetchAssociative()) {
            $staffList[] = [
                'staffName' => $row['name'],
                'status' => $row['status'],
                'statusLabel' => $row['status'] === 'submitted' ? 'Pending My Approval' : 'Awaiting Final Approval',
            ];
        }

        if (empty($staffList)) {
            $output->writeln('<info>No pending submissions found for ' . $dataSupervisor->getDisplayName() . ' staff.</info>');
            return Command::SUCCESS;
        }

        $output->writeln(sprintf('<info>Found %d pending submission(s) under %s:</info>', count($staffList), $dataSupervisor->getDisplayName()));
        foreach ($staffList as $item) {
            $output->writeln(sprintf('  - %s (%s)', $item['staffName'], $item['statusLabel']));
        }

        try {
            $this->mailer->sendApprovalReminder($supervisor, $staffList, $weekStart, $weekEnd);
            $output->writeln(sprintf('<info>Approval reminder sent to %s (%s)</info>', $supervisor->getDisplayName(), $supervisor->getEmail()));
        } catch (\Exception $e) {
            $output->writeln(sprintf('<error>Failed to send: %s</error>', $e->getMessage()));
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
