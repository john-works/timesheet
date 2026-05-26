<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

use App\Configuration\SystemConfiguration;
use App\Entity\Department as DepartmentEntity;
use App\Repository\DepartmentRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class DepartmentValidator extends ConstraintValidator
{
    public function __construct(
        private readonly SystemConfiguration $systemConfiguration,
        private readonly DepartmentRepository $departmentRepository
    )
    {
    }

    /**
     * @param DepartmentEntity|mixed $value
     */
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!($constraint instanceof Department)) {
            throw new UnexpectedTypeException($constraint, Department::class);
        }

        if (!($value instanceof DepartmentEntity)) {
            throw new UnexpectedTypeException($value, DepartmentEntity::class);
        }

        if ((bool) $this->systemConfiguration->find('department.rules.allow_duplicate_number') === false && (($number = $value->getNumber()) !== null)) {
            foreach ($this->departmentRepository->findBy(['number' => $number]) as $tmp) {
                if ($tmp->getId() !== $value->getId()) {
                    $this->context->buildViolation(Department::getErrorName(Department::DEPARTMENT_NUMBER_EXISTING))
                        ->setParameter('%number%', $number)
                        ->atPath('number')
                        ->setTranslationDomain('validators')
                        ->setCode(Department::DEPARTMENT_NUMBER_EXISTING)
                        ->addViolation();
                    break;
                }
            }
        }
    }
}
