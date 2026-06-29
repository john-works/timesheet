<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use App\User\UserService;
use App\Validator\ValidationFailedException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'kimai:user:password:all', description: 'Set the password for all users')]
final class BulkPasswordCommand extends AbstractUserCommand
{
    public function __construct(
        private UserRepository $userRepository,
        private UserService $userService,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('password', InputArgument::OPTIONAL, 'The password')
            ->addOption('auth', null, InputOption::VALUE_OPTIONAL, 'Only set password for users with this auth type (e.g. ldap, kimai)', null)
            ->addOption('set-auth', null, InputOption::VALUE_REQUIRED, 'Change auth type (e.g. kimai, ldap)', null)
            ->setHelp(
                <<<'EOT'
                    The <info>kimai:user:password:all</info> command sets the password for all users:

                      <info>php %command.full_name% newpassword</info>

                    You can limit to a specific auth type with --auth:

                      <info>php %command.full_name% newpassword --auth=ldap</info>

                    You can also change the auth type at the same time with --set-auth:

                      <info>php %command.full_name% newpassword --set-auth=kimai</info>

                    EOT
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (null !== $input->getArgument('password')) {
            $password = $input->getArgument('password');
        } else {
            $password = $this->askForPassword($input, $output);
        }

        $authFilter = $input->getOption('auth');
        $setAuth = $input->getOption('set-auth');

        $users = $this->userRepository->findAll();

        $updated = 0;
        $skipped = 0;

        foreach ($users as $user) {
            if ($authFilter !== null && $user->getAuth() !== $authFilter) {
                $skipped++;
                continue;
            }

            try {
                $user->setPlainPassword($password);
                $this->userService->updateUser($user, ['PasswordUpdate']);
                if ($setAuth !== null) {
                    $user->setAuth($setAuth);
                    $this->entityManager->persist($user);
                }
                $updated++;
            } catch (ValidationFailedException $ex) {
                $this->validationError($ex, $io);
            }
        }

        if ($setAuth !== null) {
            $this->entityManager->flush();
        }

        $io->success(\sprintf('Updated password for %d user(s). Skipped %d user(s).', $updated, $skipped));

        return Command::SUCCESS;
    }
}
