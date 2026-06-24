<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Ldap;

use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Event\CheckPassportEvent;

final class LdapCredentialsSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly LdapManager $ldapManager, private readonly ?LoggerInterface $logger = null)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [CheckPassportEvent::class => ['onCheckPassport']];
    }

    public function onCheckPassport(CheckPassportEvent $event)
    {
        $passport = $event->getPassport();
        if (!$passport->hasBadge(LdapBadge::class)) {
            $this->logger?->info('No LdapBadge found, skipping LDAP auth');
            return;
        }

        $this->logger?->info('LdapBadge found, proceeding with LDAP auth');

        /** @var LdapBadge $ldapBadge */
        $ldapBadge = $passport->getBadge(LdapBadge::class);
        if ($ldapBadge->isResolved()) {
            $this->logger?->info('LdapBadge already resolved, skipping');
            return;
        }

        if (!$passport->hasBadge(PasswordCredentials::class)) {
            throw new \LogicException(\sprintf('LDAP authentication requires a passport containing a user and password credentials, authenticator "%s" does not fulfill these requirements.', \get_class($event->getAuthenticator())));
        }

        /** @var PasswordCredentials $passwordCredentials */
        $passwordCredentials = $passport->getBadge(PasswordCredentials::class);
        if ($passwordCredentials->isResolved()) {
            throw new \LogicException('LDAP authentication password verification cannot be completed because something else has already resolved the PasswordCredentials.');
        }

        $presentedPassword = $passwordCredentials->getPassword();
        if ('' === $presentedPassword) {
            throw new BadCredentialsException('The presented password cannot be empty.');
        }

        $user = $passport->getUser();
        $ldapBadge->markResolved();

        if (!($user instanceof User)) {
            throw new BadCredentialsException('The presented user needs to be a Kimai user.');
        }

        $this->logger?->info('Login attempt: username={username}', [
            'username' => $user->getUserIdentifier(),
        ]);

        $bindResult = $this->ldapManager->bind($user->getUserIdentifier(), $presentedPassword);
        $this->logger?->info('LDAP bind result: username={username}, result={result}', [
            'username' => $user->getUserIdentifier(),
            'result' => $bindResult ? 'success' : 'failure',
        ]);

        if (!$bindResult) {
            // if the login failed, simply return:
            // the FormLogin authenticator will take over and the user can log in via internal database
            return;
        }

        try {
            $this->ldapManager->updateUser($user);
            $this->logger?->info('LDAP user update succeeded: username={username}', [
                'username' => $user->getUserIdentifier(),
            ]);
        } catch (LdapDriverException $ex) {
            $this->logger?->error('LDAP user update failed: username={username}, error={error}', [
                'username' => $user->getUserIdentifier(),
                'error' => $ex->getMessage(),
            ]);
            throw new BadCredentialsException('Fetching user data/roles failed, probably DN is expired.');
        }

        // make sure that the normal auth process is not triggered
        $passwordCredentials->markResolved(); // @phpstan-ignore method.internal
    }
}
