<?php

namespace App\Controller;

use App\Ldap\LdapSyncService;
use App\Utils\PageSetup;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(path: '/admin/ldap-sync')]
#[IsGranted('system_configuration')]
final class LdapSyncController extends AbstractController
{
    #[Route(path: '/trigger/{token}', name: 'ldap_sync_trigger', methods: ['GET'])]
    public function triggerAction(string $token, Request $request, CsrfTokenManagerInterface $csrfTokenManager, LdapSyncService $ldapSyncService): Response
    {
        if (!$csrfTokenManager->isTokenValid(new CsrfToken('ldap_sync.trigger', $token))) {
            $this->flashError('action.csrf.error');
            return $this->redirectToRoute('ldap_sync');
        }

        $csrfTokenManager->refreshToken('ldap_sync.trigger');

        $result = $ldapSyncService->sync(
            ldapHost: '192.168.33.8',
            ldapPort: 389,
            bindDn: 'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug',
            bindPassword: 'ppda2016*',
            baseDn: 'dc=ppda,dc=go,dc=ug',
            skipDisabled: true,
        );

        $session = $request->getSession();
        $session->set('ldap_sync_result', $result);

        if ($result['success']) {
            $this->flashSuccess('LDAP sync completed successfully');
        } else {
            $this->flashError('LDAP sync failed', $result['error'] ?? 'Unknown error');
        }

        return $this->redirectToRoute('ldap_sync');
    }

    #[Route(path: '', name: 'ldap_sync', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = new PageSetup('LDAP Sync');
        $page->setHelp('ldap-sync.html');

        $result = null;
        $session = $request->getSession();
        if ($session->has('ldap_sync_result')) {
            $result = $session->get('ldap_sync_result');
            $session->remove('ldap_sync_result');
        }

        $logFile = '/var/log/kimai/ldap-sync.log';
        $logContent = '';
        if (file_exists($logFile) && is_readable($logFile)) {
            $logContent = file_get_contents($logFile);
        }

        return $this->render('ldap-sync/index.html.twig', [
            'page_setup' => $page,
            'result' => $result,
            'log_content' => $logContent,
        ]);
    }
}
