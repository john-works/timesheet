<?php

namespace KimaiPlugin\WeeklySubmissionBundle\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use KimaiPlugin\WeeklySubmissionBundle\Repository\WeeklySubmissionRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'kimai:weekly:backfill-approvers')]
class BackfillApproversCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly WeeklySubmissionRepository $submissionRepository,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Backfill the stored Step 2 approver for every user based on the previous derived workflow rules')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Show what would be stored without persisting');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $dryRun = (bool) $input->getOption('dry-run');

        $users = $this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']);
        $changed = 0;

        foreach ($users as $user) {
            $current = $user->getStep2Approver();
            $computed = $this->deriveStep2Approver($user);

            if ($computed === null) {
                if ($current === null) {
                    continue;
                }
                $user->setStep2Approver(null);
                $this->em->persist($user);
                $changed++;
                $output->writeln(sprintf('<info>%s: Step 2 cleared</info>', $user->getDisplayName()));
                continue;
            }

            if ($current !== null && $current->getId() === $computed->getId()) {
                continue;
            }

            $user->setStep2Approver($computed);
            $this->em->persist($user);
            $changed++;
            $output->writeln(sprintf('<info>%s: Step 2 = %s</info>', $user->getDisplayName(), $computed->getDisplayName()));
        }

        if (!$dryRun && $changed > 0) {
            $this->em->flush();
        }

        $output->writeln(sprintf('<info>Done. %d user(s) updated%s.</info>', $changed, $dryRun ? ' (dry-run, nothing persisted)' : ''));

        return Command::SUCCESS;
    }

    private function deriveStep2Approver(User $staffUser): ?User
    {
        if ($this->submissionRepository->isInRegionalDepartment($staffUser)) {
            return null;
        }

        if ($staffUser->isDirector()) {
            return null;
        }

        if ($this->submissionRepository->isTeamLead($staffUser)) {
            return null;
        }

        if ($this->submissionRepository->isSeniorOfficer($staffUser)) {
            $director = $this->submissionRepository->getDirectorForUser($staffUser);
            $supervisorId = $staffUser->getSupervisor()?->getId();
            if ($director !== null && $supervisorId !== null && $director->getId() === $supervisorId) {
                return null;
            }
            return $director;
        }

        $supervisorId = $staffUser->getSupervisor()?->getId();
        $managerIds = $this->submissionRepository->getManagerIdsForUser($staffUser);
        $managerIds = array_values(array_filter($managerIds, fn(int $id) => $id !== $supervisorId));

        if (!empty($managerIds)) {
            return $this->em->getRepository(User::class)->find($managerIds[0]);
        }

        return $this->submissionRepository->getDirectorForUser($staffUser);
    }
}
