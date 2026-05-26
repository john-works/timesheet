<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Command;

use App\Command\InvoiceCreateCommand;
use App\DataFixtures\UserFixtures;
use App\Entity\Department;
use App\Entity\Project;
use App\Invoice\InvoiceService;
use App\Repository\DepartmentRepository;
use App\Repository\InvoiceTemplateRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use App\Tests\DataFixtures\DepartmentFixtures;
use App\Tests\DataFixtures\InvoiceTemplateFixtures;
use App\Tests\DataFixtures\ProjectFixtures;
use App\Tests\DataFixtures\TimesheetFixtures;
use App\Tests\KernelTestTrait;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

#[CoversClass(InvoiceCreateCommand::class)]
#[Group('integration')]
class InvoiceCreateCommandTest extends KernelTestCase
{
    use KernelTestTrait;

    private Application $application;

    private function clearInvoiceFiles(): void
    {
        $path = __DIR__ . '/../_data/invoices/';

        if (is_dir($path)) {
            $files = glob($path . '*');
            if ($files === false) {
                return;
            }
            foreach ($files as $file) {
                unlink($file);
            }
        }
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->clearInvoiceFiles();
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->clearInvoiceFiles();
        $kernel = self::bootKernel();
        $this->application = new Application($kernel);
        $container = self::getContainer();

        $this->application->add(new InvoiceCreateCommand(
            $container->get(InvoiceService::class), // @phpstan-ignore argument.type
            $container->get(DepartmentRepository::class), // @phpstan-ignore argument.type
            $container->get(ProjectRepository::class), // @phpstan-ignore argument.type
            $container->get(InvoiceTemplateRepository::class), // @phpstan-ignore argument.type
            $container->get(UserRepository::class), // @phpstan-ignore argument.type
            $container->get('event_dispatcher') // @phpstan-ignore argument.type
        ));
    }

    /**
     * Allowed option: user
     * Allowed option: start
     * Allowed option: end
     * Allowed option: timezone
     * Allowed option: department
     * Allowed option: template
     * Allowed option: search
     * Allowed option: exported
     * Allowed option: by-department
     * Allowed option: by-project
     * Allowed option: template-meta
     *
     * @param array $options
     * @return CommandTester
     */
    protected function createInvoice(array $options = []): CommandTester
    {
        $command = $this->application->find('kimai:invoice:create');
        $commandTester = new CommandTester($command);
        $commandTester->execute(array_merge($options, [
            'command' => $command->getName(),
        ]));

        return $commandTester;
    }

    protected function assertCommandErrors(array $options = [], string $errorMessage = ''): void
    {
        $commandTester = $this->createInvoice($options);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('[ERROR] ' . $errorMessage, $output);
    }

    public function testCreateWithUnknownExportFilter(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--exported' => 'foo'], 'Unknown "exported" filter given');
    }

    public function testCreateWithMissingUser(): void
    {
        $this->assertCommandErrors([], 'You must set a "user" to create invoices');
    }

    public function testCreateWithInvalidUser(): void
    {
        $this->assertCommandErrors(['--user' => 'assdfd'], 'The given username "assdfd" could not be resolved');
    }

    public function testCreateWithMissingEnd(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--start' => '2020-01-01'], 'You need to supply a end date if a start date was given');
    }

    public function testCreateByDepartmentAndByProject(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--by-department' => null, '--by-project' => null], 'You cannot mix "by-department" and "by-project"');
    }

    public function testCreateWithMissingGenerationMode(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN], 'Could not determine generation mode');
    }

    public function testCreateWithInvalidStart(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => 1, '--exported' => 'exported', '--template' => 'x', '--start' => 'öäüß', '--end' => '2020-01-01'], 'Invalid start date given');
    }

    public function testCreateWithInvalidEnd(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => 1, '--template' => 'x', '--start' => '2020-01-01', '--end' => 'öäüß'], 'Invalid end date given');
    }

    public function testCreateWithInvalidPreviewDirectory(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => 1, '--template' => 'x', '--start' => '2020-01-01', '--end' => '2020-01-02', '--preview' => '/kjhg/'], 'Invalid preview directory given');
    }

    public function testCreateWithInvalidDepartment(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => PHP_INT_MAX, '--template' => 'x'], 'Unknown department ID: ' . PHP_INT_MAX);
    }

    public function testCreateWithInvalidProject(): void
    {
        $this->assertCommandErrors(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--project' => PHP_INT_MAX, '--template' => 'x'], 'Unknown project ID: ' . PHP_INT_MAX);
    }

    public function testCreateInvoice(): void
    {
        $start = new \DateTime('2020-01-01');

        $department = $this->prepareFixtures($start)[0];

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => $department->getId(), '--template' => 'Invoice', '--start' => '2020-01-01', '--end' => '2020-03-01']);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s)', $output);
        self::assertStringContainsString('| ID', $output);
        self::assertStringContainsString('| Department', $output);
        self::assertStringContainsString('| Total', $output);
        self::assertStringContainsString('| Filename', $output);
        self::assertStringContainsString('/tests/_data/invoices/' . ((new \DateTime())->format('Y')) . '-001', $output);
    }

    /**
     * @return array{0: Department, 1: Project}
     */
    protected function prepareFixtures(\DateTime $start, bool $withTimesheets = true): array
    {
        $fixture = new InvoiceTemplateFixtures();
        $invoiceTemplate = $this->importFixture($fixture);

        $fixture = new DepartmentFixtures();
        $fixture->setAmount(1);
        $fixture->setCallback(function (Department $department) use ($invoiceTemplate): void {
            $department->setInvoiceTemplate($invoiceTemplate[0]);
        });
        $department = $this->importFixture($fixture)[0];

        $fixture = new ProjectFixtures();
        $fixture->setDepartments([$department]);
        $fixture->setAmount(1);
        $projects = $this->importFixture($fixture);

        if ($withTimesheets) {
            $fixture = new TimesheetFixtures();
            $fixture->setUser($this->getUserByName(UserFixtures::USERNAME_SUPER_ADMIN));
            $fixture->setAmount(20);
            $fixture->setStartDate($start);
            $fixture->setProjects($projects);
            $this->importFixture($fixture);
        }

        return [$department, $projects[0]];
    }

    public function testCreateInvoiceByDepartment(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $this->prepareFixtures($start);

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--by-department' => null, '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s) ', $output);
    }

    public function testCreateInvoiceByDepartmentId(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $department = $this->prepareFixtures($start)[0];

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => $department->getId(), '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s) ', $output);
    }

    public function testCreateInvoiceByDepartmentIdWithoutTimesheets(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $department = $this->prepareFixtures($start, false)[0];

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--department' => $department->getId(), '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('No invoice was generated', $output);
    }

    public function testCreateInvoiceByProject(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $this->prepareFixtures($start);

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--exported' => 'all', '--by-project' => null, '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s) ', $output);
    }

    public function testCreateInvoiceByProjectId(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $project = $this->prepareFixtures($start)[1];

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--exported' => 'all', '--project' => $project->getId(), '--template' => 'Invoice', '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s) ', $output);
    }

    public function testCreateInvoiceByProjectIdWithoutTimesheets(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $project = $this->prepareFixtures($start, false)[1];

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--exported' => 'all', '--project' => $project->getId(), '--template' => 'Invoice', '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('No invoice was generated', $output);
    }

    public function testCreateInvoiceByProjectWithPreview(): void
    {
        $start = new \DateTime('-2 months');
        $end = new \DateTime();

        $this->prepareFixtures($start);

        $commandTester = $this->createInvoice(['--user' => UserFixtures::USERNAME_SUPER_ADMIN, '--exported' => 'all', '--preview' => sys_get_temp_dir(), '--by-project' => null, '--start' => $start->format('Y-m-d'), '--end' => $end->format('Y-m-d')]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('Created 1 invoice(s) ', $output);
    }
}
