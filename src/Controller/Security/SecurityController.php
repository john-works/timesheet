<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller\Security;

use App\Configuration\SamlConfigurationInterface;
use App\Controller\AbstractController;
use App\Repository\UserRepository;
use App\User\LoginManager;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

final class SecurityController extends AbstractController
{
    public function __construct(
        private CsrfTokenManagerInterface $tokenManager,
        private SamlConfigurationInterface $samlConfiguration,
        private UserRepository $userRepository,
        private LoginManager $loginManager,
    ) {
    }

    #[Route(path: '/login', name: 'login', methods: ['GET', 'POST'])]
    public function loginAction(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->isGranted('IS_AUTHENTICATED_FULLY')) {
            return $this->redirectToRoute('homepage');
        }

        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();
        $csrfToken = $this->tokenManager->getToken('authenticate')->getValue();

        if ($this->isGranted('IS_AUTHENTICATED_REMEMBERED') && $this->getUser()->isInternalUser()) {
            return $this->render('security/unlock.html.twig', [
                'error' => $error,
                'csrf_token' => $csrfToken,
            ]);
        }

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
            'csrf_token' => $csrfToken,
            'saml_config' => $this->samlConfiguration,
        ]);
    }

    #[Route(path: '/login_check', name: 'security_check', methods: ['POST'])]
    public function checkAction(): Response
    {
        throw new \RuntimeException('You must configure the check path to be handled by the firewall using form_login in your security firewall configuration.');
    }

    #[Route(path: '/logout', name: 'logout', methods: ['GET', 'POST'])]
    public function logoutAction(): Response
    {
        throw new \RuntimeException('You must activate the logout in your security firewall configuration.');
    }

    #[Route(path: '/sso', name: 'sso', methods: ['GET'])]
    public function ssoAction(): Response
    {
        if ($this->isGranted('IS_AUTHENTICATED_FULLY')) {
            return $this->redirectToRoute('homepage');
        }

        $remoteUser = trim((string) ($_SERVER['REMOTE_USER'] ?? ''));
        if ($remoteUser === '' && isset($_SERVER['REDIRECT_REMOTE_USER'])) {
            $remoteUser = trim((string) $_SERVER['REDIRECT_REMOTE_USER']);
        }
        if ($remoteUser === '') {
            return new Response('', 401);
        }

        // remove any realm/domain suffix (e.g. "jnakkazi@PPDA.GO.UG" -> "jnakkazi")
        $atPos = strpos($remoteUser, '@');
        if ($atPos !== false) {
            $remoteUser = substr($remoteUser, 0, $atPos);
        }
        if ($remoteUser === '') {
            return new Response('', 401);
        }

        try {
            $user = $this->userRepository->loadUserByIdentifier($remoteUser);
        } catch (UserNotFoundException $e) {
            return new Response('', 403);
        }

        if (!$user->isEnabled()) {
            return new Response('', 403);
        }

        $this->loginManager->logInUser($user);

        return $this->redirectToRoute('homepage');
    }
}
