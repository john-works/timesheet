<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Voter;

use App\Entity\User;
use App\Security\RolePermissionManager;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * A voter to check permissions on user profiles.
 *
 * @extends Voter<string, User>
 */
final class UserVoter extends Voter
{
    private const ALLOWED_ATTRIBUTES = [
        'access_user',
        'view',
        'edit',
        'roles',
        'teams',
        'password',
        '2fa',
        'delete',
        'preferences',
        'api-token',
        'hourly-rate',
        'view_team_member',
        'contract',
        'hours',
        'supervisor',
        'departments',
    ];

    public function __construct(private readonly RolePermissionManager $permissionManager)
    {
    }

    public function supportsAttribute(string $attribute): bool
    {
        return \in_array($attribute, self::ALLOWED_ATTRIBUTES, true);
    }

    public function supportsType(string $subjectType): bool
    {
        return str_contains($subjectType, User::class);
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof User && $this->supportsAttribute($attribute);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!($user instanceof User)) {
            return false;
        }

        if (!($subject instanceof User)) {
            return false;
        }

        if ($attribute === 'contract') {
            return $this->permissionManager->hasRolePermission($user, 'contract_other_profile');
        }

        if ($attribute === 'access_user') {
            return $user->canSeeUser($subject);
        }

        if ($attribute === 'view_team_member') {
            if ($subject->getId() !== $user->getId()) {
                return false;
            }

            return $this->permissionManager->hasRolePermission($user, 'view_team_member');
        }

        if ($attribute === 'delete') {
            if ($subject->getId() === $user->getId()) {
                return false;
            }

            return $this->permissionManager->hasRolePermission($user, 'delete_user');
        }

        if ($attribute === 'password') {
            if (!$subject->isInternalUser()) {
                return false;
            }
        }

        if ($attribute === '2fa') {
            // 2fa is managed via standard permission checks (2fa_own_profile / 2fa_other_profile)
            // restricted to admin roles only - see kimai.yaml permissions
        }

        if ($attribute === 'supervisor' && $subject->getId() === $user->getId()) {
            return $user->isSuperAdmin();
        }

        $permission = $attribute;

        // extend me for "team" support later on
        if ($subject->getId() === $user->getId()) {
            $permission .= '_own';
        } else {
            $permission .= '_other';
        }

        $permission .= '_profile';

        return $this->permissionManager->hasRolePermission($user, $permission);
    }
}
