<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Department;

use App\Configuration\SystemConfiguration;
use App\Entity\Department;
use App\Event\DepartmentCreateEvent;
use App\Event\DepartmentCreatePostEvent;
use App\Event\DepartmentCreatePreEvent;
use App\Event\DepartmentDeleteEvent;
use App\Event\DepartmentMetaDefinitionEvent;
use App\Event\DepartmentUpdatePostEvent;
use App\Event\DepartmentUpdatePreEvent;
use App\Repository\DepartmentRepository;
use App\Repository\Query\DepartmentQuery;
use App\Utils\NumberGenerator;
use App\Validator\ValidationFailedException;
use InvalidArgumentException;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class DepartmentService
{
    public function __construct(
        private readonly DepartmentRepository $repository,
        private readonly SystemConfiguration $configuration,
        private readonly ValidatorInterface $validator,
        private readonly EventDispatcherInterface $dispatcher
    ) {
    }

    private function getDefaultTimezone(): string
    {
        if (null === ($timezone = $this->configuration->getDepartmentDefaultTimezone())) {
            $timezone = date_default_timezone_get();
        }

        return $timezone;
    }

    public function loadMetaFields(Department $department): void
    {
        $this->dispatcher->dispatch(new DepartmentMetaDefinitionEvent($department));
    }

    public function createNewDepartment(string $name): Department
    {
        $department = new Department($name);
        $department->setTimezone($this->getDefaultTimezone());
        $department->setCountry($this->configuration->getDepartmentDefaultCountry());
        $department->setCurrency($this->configuration->getDefaultCurrency());
        $department->setNumber($this->calculateNextDepartmentNumber());

        $this->loadMetaFields($department);
        $this->dispatcher->dispatch(new DepartmentCreateEvent($department));

        return $department;
    }

    public function saveDepartment(Department $department): Department
    {
        if ($department->isNew()) {
            return $this->saveNewDepartment($department); // @phpstan-ignore method.deprecated
        } else {
            return $this->updateDepartment($department); // @phpstan-ignore method.deprecated
        }
    }

    /**
     * @deprecated since 2.35 - use saveDepartment() instead
     */
    public function saveNewDepartment(Department $department): Department
    {
        if (null !== $department->getId()) {
            throw new InvalidArgumentException('Cannot create department, already persisted');
        }

        $this->validateDepartment($department);

        $this->dispatcher->dispatch(new DepartmentCreatePreEvent($department));
        $this->repository->saveDepartment($department);
        $this->dispatcher->dispatch(new DepartmentCreatePostEvent($department));

        return $department;
    }

    public function deleteDepartment(Department $department, ?Department $replace = null): void
    {
        $this->dispatcher->dispatch(new DepartmentDeleteEvent($department, $replace));
        $this->repository->deleteDepartment($department, $replace);
    }

    /**
     * @param string[] $groups
     * @throws ValidationFailedException
     */
    private function validateDepartment(Department $department, array $groups = []): void
    {
        $errors = $this->validator->validate($department, null, $groups);

        if ($errors->count() > 0) {
            throw new ValidationFailedException($errors);
        }
    }

    /**
     * @deprecated since 2.35 - use saveDepartment() instead
     */
    public function updateDepartment(Department $department): Department
    {
        $this->validateDepartment($department);

        $this->dispatcher->dispatch(new DepartmentUpdatePreEvent($department));
        $this->repository->saveDepartment($department);
        $this->dispatcher->dispatch(new DepartmentUpdatePostEvent($department));

        return $department;
    }

    public function findDepartmentByName(string $name): ?Department
    {
        return $this->repository->findOneBy(['name' => $name]);
    }

    public function findDepartmentByNumber(string $number): ?Department
    {
        return $this->repository->findOneBy(['number' => $number]);
    }

    /**
     * @return iterable<Department>
     */
    public function findDepartment(DepartmentQuery $query): iterable
    {
        return $this->repository->getDepartmentsForQuery($query);
    }

    public function countDepartment(bool $visible = true): int
    {
        return $this->repository->countDepartment($visible);
    }

    private function calculateNextDepartmentNumber(): ?string
    {
        $format = $this->configuration->find('department.number_format');
        if (empty($format) || !\is_string($format)) {
            return null;
        }

        // we cannot use max(number) because a varchar column returns unexpected results
        $start = $this->repository->countDepartment();
        $i = 0;
        $createDate = new \DateTimeImmutable();

        do {
            $start++;

            $numberGenerator = new NumberGenerator($format, function (string $originalFormat, string $format, int $increaseBy) use ($start, $createDate): string|int {
                return match ($format) {
                    'Y' => $createDate->format('Y'),
                    'y' => $createDate->format('y'),
                    'M' => $createDate->format('m'),
                    'm' => $createDate->format('n'),
                    'D' => $createDate->format('d'),
                    'd' => $createDate->format('j'),
                    'YY' => (int) $createDate->format('Y') + $increaseBy,
                    'yy' => (int) $createDate->format('y') + $increaseBy,
                    'MM' => (int) $createDate->format('m') + $increaseBy,
                    'DD' => (int) $createDate->format('d') + $increaseBy,
                    'cc' => $start + $increaseBy,
                    default => $originalFormat,
                };
            });

            $number = $numberGenerator->getNumber();
            $department = $this->findDepartmentByNumber($number);
        } while ($department !== null && $i++ < 100);

        if ($department !== null) {
            return null;
        }

        return $number;
    }
}
