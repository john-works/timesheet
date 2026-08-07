<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

#[AsCommand(name: 'app:probe-profiles')]
final class ProbeProfilesCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly AuthorizationCheckerInterface $auth,
        private readonly HttpKernelInterface $kernel,
        private readonly RequestStack $requestStack,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $admin = $this->userRepository->findOneBy(['username' => 'userman@ppda.go.ug']);
        if ($admin === null) {
            $output->writeln('admin not found');
            return Command::FAILURE;
        }

        $token = new UsernamePasswordToken($admin, 'main', $admin->getRoles());
        $this->tokenStorage->setToken($token);

        $output->writeln(sprintf('Acting as %s [%s]', $admin->getUserIdentifier(), implode(',', $admin->getRoles())));

        $users = $this->userRepository->findBy([], ['username' => 'ASC']);

        $failures = 0;
        foreach ($users as $user) {
            $session = new Session(new MockArraySessionStorage());
            foreach (['profile', 'edit'] as $tab) {
                $url = '/en/profile/' . $user->getUserIdentifier() . ($tab === 'edit' ? '/edit' : '');
                $request = Request::create($url, 'GET');
                $request->setSession($session);
                $request->setLocale('en');
                $request->server->set('SERVER_NAME', 'timesheet.ppda.go.ug');
                $request->server->set('HTTP_HOST', 'timesheet.ppda.go.ug');
                $this->requestStack->push($request);
                try {
                    $response = $this->kernel->handle($request, HttpKernelInterface::MAIN_REQUEST, false);
                    $status = $response->getStatusCode();
                    if ($status >= 400) {
                        $failures++;
                        $output->writeln(sprintf('%s %-8s %-45s => %d', 'FAIL', $tab, $user->getUserIdentifier(), $status));
                    }
                } catch (\Throwable $e) {
                    $failures++;
                    $output->writeln(sprintf('%s %-8s %-45s => %s: %s', 'EX', $tab, $user->getUserIdentifier(), get_class($e), substr($e->getMessage(), 0, 200)));
                }
                $this->requestStack->pop();
            }
        }

        $output->writeln(sprintf('DONE users=%d failures=%d', count($users), $failures));

        return Command::SUCCESS;
    }
}
