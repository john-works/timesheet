<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Validator\Constraints;

use App\Configuration\ConfigLoaderInterface;
use App\Repository\DepartmentRepository;
use App\Tests\Mocks\SystemConfigurationFactory;
use App\Validator\Constraints\Department as DepartmentConstraint;
use App\Validator\Constraints\DepartmentValidator;
use PHPUnit\Framework\Attributes\CoversClass;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Test\ConstraintValidatorTestCase;

/**
 * @extends ConstraintValidatorTestCase<DepartmentValidator>
 */
#[CoversClass(DepartmentConstraint::class)]
#[CoversClass(DepartmentValidator::class)]
class DepartmentValidatorTest extends ConstraintValidatorTestCase
{
    protected function createValidator(): DepartmentValidator
    {
        $loader = $this->createMock(ConfigLoaderInterface::class);
        $config = SystemConfigurationFactory::create($loader, []);
        $repository = $this->createMock(DepartmentRepository::class);

        return new DepartmentValidator($config, $repository);
    }

    public function testConstraintIsInvalid(): void
    {
        $this->expectException(UnexpectedTypeException::class);

        $this->validator->validate('foo', new NotBlank());
    }

    public function testGetTargets(): void
    {
        $constraint = new DepartmentConstraint();
        self::assertEquals('class', $constraint->getTargets());
    }
}
