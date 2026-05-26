<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Department;

use App\Configuration\SystemConfiguration;
use App\Department\DepartmentService;
use App\Entity\Department;
use App\Event\DepartmentCreateEvent;
use App\Event\DepartmentCreatePostEvent;
use App\Event\DepartmentCreatePreEvent;
use App\Event\DepartmentMetaDefinitionEvent;
use App\Event\DepartmentUpdatePostEvent;
use App\Event\DepartmentUpdatePreEvent;
use App\Repository\DepartmentRepository;
use App\Tests\Mocks\SystemConfigurationFactory;
use App\Validator\ValidationFailedException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[CoversClass(DepartmentService::class)]
class DepartmentServiceTest extends TestCase
{
    private function getSut(
        ?EventDispatcherInterface $dispatcher = null,
        ?ValidatorInterface $validator = null,
        ?SystemConfiguration $configuration = null
    ): DepartmentService {
        $repository = $this->createMock(DepartmentRepository::class);

        if ($dispatcher === null) {
            $dispatcher = $this->createMock(EventDispatcherInterface::class);
            $dispatcher->method('dispatch')->willReturnCallback(function ($event) {
                return $event;
            });
        }

        if ($validator === null) {
            $validator = $this->createMock(ValidatorInterface::class);
            $validator->method('validate')->willReturn(new ConstraintViolationList());
        }

        if ($configuration === null) {
            $configuration = SystemConfigurationFactory::createStub([
                'defaults' => [
                    'department' => [
                        'timezone' => 'Europe/Vienna',
                        'country' => 'IN',
                        'currency' => 'RUB',
                    ]
                ]
            ]);
        }

        return new DepartmentService($repository, $configuration, $validator, $dispatcher);
    }

    public function testSaveNewDepartmentHasValidationError(): void
    {
        $constraints = new ConstraintViolationList();
        $constraints->add(new ConstraintViolation('toooo many tests', 'abc.def', [], '$root', 'begin', 4, null, null, null, '$cause'));

        $validator = $this->createMock(ValidatorInterface::class);
        $validator->method('validate')->willReturn($constraints);

        $sut = $this->getSut(null, $validator);

        $this->expectException(ValidationFailedException::class);
        $this->expectExceptionMessage('Validation Failed');

        $sut->saveDepartment(new Department('foo'));
    }

    public function testUpdateDispatchesEvents(): void
    {
        $Department = $this->createMock(Department::class);
        $Department->method('getId')->willReturn(1);

        $dispatcher = $this->createMock(EventDispatcherInterface::class);
        $dispatcher->expects($this->exactly(2))->method('dispatch')->willReturnCallback(function ($event) use ($Department) {
            if ($event instanceof DepartmentUpdatePostEvent) {
                self::assertSame($Department, $event->getDepartment());
            } elseif ($event instanceof DepartmentUpdatePreEvent) {
                self::assertSame($Department, $event->getDepartment());
            } else {
                $this->fail('Invalid event received');
            }

            return $event;
        });

        $sut = $this->getSut($dispatcher);

        $sut->saveDepartment($Department);
    }

    public function testCreateNewDepartmentDispatchesEvents(): void
    {
        $dispatcher = $this->createMock(EventDispatcherInterface::class);
        $dispatcher->expects($this->exactly(2))->method('dispatch')->willReturnCallback(function ($event) {
            if (!$event instanceof DepartmentMetaDefinitionEvent && !$event instanceof DepartmentCreateEvent) {
                $this->fail('Invalid event received');
            }

            return $event;
        });

        $sut = $this->getSut($dispatcher);

        $department = $sut->createNewDepartment('');

        self::assertEquals('Europe/Vienna', $department->getTimezone());
        self::assertEquals('IN', $department->getCountry());
        self::assertEquals('RUB', $department->getCurrency());
    }

    public function testSaveNewDepartmentDispatchesEvents(): void
    {
        $dispatcher = $this->createMock(EventDispatcherInterface::class);
        $dispatcher->expects($this->exactly(2))->method('dispatch')->willReturnCallback(function ($event) {
            if (!$event instanceof DepartmentCreatePreEvent && !$event instanceof DepartmentCreatePostEvent) {
                $this->fail('Invalid event received');
            }

            return $event;
        });

        $sut = $this->getSut($dispatcher);

        $Department = new Department('foo');
        $sut->saveDepartment($Department);
    }

    #[DataProvider('getTestData')]
    public function testDepartmentNumber(string $format, int|string $expected): void
    {
        $configuration = SystemConfigurationFactory::createStub([
            'defaults' => [
                'department' => [
                    'timezone' => 'Europe/Vienna',
                    'country' => 'IN',
                    'currency' => 'RUB',
                ]
            ],
            'department' => [
                'number_format' => $format
            ]
        ]);

        $sut = $this->getSut(null, null, $configuration);
        $department = $sut->createNewDepartment('Test');

        self::assertEquals((string) $expected, $department->getNumber());
    }

    /**
     * @return array<int, array<int, string|\DateTime|int>>
     */
    public static function getTestData(): array
    {
        $dateTime = new \DateTime();

        $yearLong = (int) $dateTime->format('Y');
        $yearShort = (int) $dateTime->format('y');
        $monthLong = $dateTime->format('m');
        $monthShort = (int) $dateTime->format('n');
        $dayLong = $dateTime->format('d');
        $dayShort = (int) $dateTime->format('j');

        return [
            // simple tests for single calls
            ['{cc,1}', '2'],
            ['{cc,2}', '02'],
            ['{cc,3}', '002'],
            ['{cc,4}', '0002'],
            ['{Y}', $yearLong],
            ['{y}', $yearShort],
            ['{M}', $monthLong],
            ['{m}', $monthShort],
            ['{D}', $dayLong],
            ['{d}', $dayShort],
            // number formatting (not testing the lower case versions, as the tests might break depending on the date)
            ['{Y,6}', '00' . $yearLong],
            ['{M,3}', '0' . $monthLong],
            ['{D,3}', '0' . $dayLong],
            // increment dates
            ['{YY}', $yearLong + 1],
            ['{YY+1}', $yearLong + 1],
            ['{YY+2}', $yearLong + 2],
            ['{YY+3}', $yearLong + 3],
            ['{YY-1}', $yearLong - 1],
            ['{YY-2}', $yearLong - 2],
            ['{YY-3}', $yearLong - 3],
            ['{yy}', $yearShort + 1],
            ['{yy+1}', $yearShort + 1],
            ['{yy+2}', $yearShort + 2],
            ['{yy+3}', $yearShort + 3],
            ['{yy-1}', $yearShort - 1],
            ['{yy-2}', $yearShort - 2],
            ['{yy-3}', $yearShort - 3],
            ['{MM}', $monthShort + 1], // cast to int removes leading zero
            ['{MM+1}', $monthShort + 1], // cast to int removes leading zero
            ['{MM+2}', $monthShort + 2], // cast to int removes leading zero
            ['{MM+3}', $monthShort + 3], // cast to int removes leading zero
            ['{DD}', $dayShort + 1], // cast to int removes leading zero
            ['{DD+1}', $dayShort + 1], // cast to int removes leading zero
            ['{DD+2}', $dayShort + 2], // cast to int removes leading zero
            ['{DD+3}', $dayShort + 3], // cast to int removes leading zero
        ];
    }
}
