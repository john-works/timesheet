<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Controller;

use App\Entity\Department;
use App\Entity\DepartmentComment;
use App\Entity\DepartmentMeta;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Tests\DataFixtures\DepartmentFixtures;
use App\Tests\DataFixtures\ProjectFixtures;
use App\Tests\DataFixtures\TeamFixtures;
use App\Tests\DataFixtures\TimesheetFixtures;
use App\Tests\Mocks\DepartmentTestMetaFieldSubscriberMock;
use Doctrine\ORM\EntityManager;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use Symfony\Component\DomCrawler\Field\ChoiceFormField;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpKernel\HttpKernelBrowser;

#[Group('integration')]
class DepartmentControllerTest extends AbstractControllerBaseTestCase
{
    public function testIsSecure(): void
    {
        $this->assertUrlIsSecured('/admin/department/');
    }

    public function testIsSecureForRole(): void
    {
        $this->assertUrlIsSecuredForRole(User::ROLE_USER, '/admin/department/');
    }

    public function testIndexAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_TEAMLEAD);
        $this->assertAccessIsGranted($client, '/admin/department/');
        $this->assertHasDataTable($client);

        $this->assertPageActions($client, [
            'download toolbar-action' => $this->createUrl('/admin/department/export'),
        ]);
    }

    public function testIndexActionAsSuperAdmin(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_SUPER_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/');
        $this->assertHasDataTable($client);

        $this->assertPageActions($client, [
            'download toolbar-action' => $this->createUrl('/admin/department/export'),
            'create modal-ajax-form' => $this->createUrl('/admin/department/create'),
        ]);
    }

    public function testIndexActionWithSearchTermQuery(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);

        $fixture = new DepartmentFixtures();
        $fixture->setAmount(5);
        $fixture->setCallback(function (Department $department): void {
            $department->setVisible(true);
            $department->setComment('I am a foobar with tralalalala some more content');
            $department->setMetaField((new DepartmentMeta())->setName('location')->setValue('homeoffice'));
            $department->setMetaField((new DepartmentMeta())->setName('feature')->setValue('timetracking'));
        });
        $this->importFixture($fixture);

        $this->assertAccessIsGranted($client, '/admin/department/');

        $this->assertPageActions($client, [
            'download toolbar-action' => $this->createUrl('/admin/department/export'),
            'create modal-ajax-form' => $this->createUrl('/admin/department/create'),
        ]);

        $form = $client->getCrawler()->filter('form.searchform')->form();
        $client->submit($form, [
            'searchTerm' => 'feature:timetracking foo',
            'visibility' => 1,
            'size' => 50,
            'page' => 1,
        ]);

        self::assertTrue($client->getResponse()->isSuccessful());
        $this->assertHasDataTable($client);
        $this->assertDataTableRowCount($client, 'datatable_department_admin', 5);
    }

    public function testExportIsSecureForRole(): void
    {
        $this->assertUrlIsSecuredForRole(User::ROLE_USER, '/admin/department/export');
    }

    public function testExportAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_TEAMLEAD);
        $this->assertAccessIsGranted($client, '/admin/department/export');
        $this->assertExcelExportResponse($client, 'kimai-departments_');
    }

    public function testExportActionWithSearchTermQuery(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_TEAMLEAD);

        $this->request($client, '/admin/department/');
        self::assertTrue($client->getResponse()->isSuccessful());

        $form = $client->getCrawler()->filter('form.searchform')->form();
        $form->getFormNode()->setAttribute('action', $this->createUrl('/admin/department/export'));
        $client->submit($form, [
            'searchTerm' => 'feature:timetracking foo',
            'visibility' => 1,
            'size' => 50,
            'page' => 1,
        ]);

        $this->assertExcelExportResponse($client, 'kimai-departments_');
    }

    public function testDetailsAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $this->assertDetailsPage($client);
    }

    private function assertDetailsPage(HttpKernelBrowser $client)
    {
        self::assertHasProgressbar($client);

        $node = $client->getCrawler()->filter('div.card#department_details_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#project_list_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#time_budget_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#budget_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#team_listing_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#comments_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#team_listing_box .card-actions a.btn');
        self::assertEquals(2, $node->count());
        $node = $client->getCrawler()->filter('div.card#department_rates_box');
        self::assertEquals(1, $node->count());
    }

    public function testAddRateAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/rate');
        $form = $client->getCrawler()->filter('form[name=department_rate_form]')->form();
        $client->submit($form, [
            'department_rate_form' => [
                'rate' => 123.45,
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#department_rates_box');
        self::assertEquals(1, $node->count());
        $node = $client->getCrawler()->filter('div.card#department_rates_box table.dataTable tbody tr:not(.summary)');
        self::assertEquals(1, $node->count());
        self::assertStringContainsString('123.45', $node->text(null, true));
    }

    public function testAddCommentAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);

        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $form = $client->getCrawler()->filter('form[name=department_comment_form]')->form();
        $client->submit($form, [
            'department_comment_form' => [
                'message' => 'A beautiful and short comment **with some** markdown formatting',
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body');
        self::assertStringContainsString('A beautiful and short comment **with some** markdown formatting', $node->html());

        $this->setSystemConfiguration('timesheet.markdown_content', true);

        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $node = $client->getCrawler()->filter('div.card#comments_box .direct-chat-text');
        self::assertStringContainsString('<p>A beautiful and short comment <strong>with some</strong> markdown formatting</p>', $node->html());
    }

    public function testDeleteCommentAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $form = $client->getCrawler()->filter('form[name=department_comment_form]')->form();
        $client->submit($form, [
            'department_comment_form' => [
                'message' => 'Blah foo bar',
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();

        $node = $client->getCrawler()->filter('div.card#comments_box .card-body');
        self::assertStringContainsString('Blah foo bar', $node->html());
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body a.delete-comment-link');

        $this->request($client, $node->attr('href'));
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body');
        self::assertStringContainsString('There were no comments posted yet', $node->html());
    }

    public function testDeleteCommentActionWithoutToken(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $form = $client->getCrawler()->filter('form[name=department_comment_form]')->form();
        $client->submit($form, [
            'department_comment_form' => [
                'message' => 'Blah foo bar',
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();

        $comments = $this->getEntityManager()->getRepository(DepartmentComment::class)->findAll();
        $id = $comments[0]->getId();

        $this->request($client, '/admin/department/' . $id . '/comment_delete');

        $this->assertRouteNotFound($client);
    }

    public function testPinCommentAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $form = $client->getCrawler()->filter('form[name=department_comment_form]')->form();
        $client->submit($form, [
            'department_comment_form' => [
                'message' => 'Blah foo bar',
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body');
        self::assertStringContainsString('Blah foo bar', $node->html());
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body a.pin-comment-link.active');
        self::assertEquals(0, $node->count());
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body a.pin-comment-link');
        self::assertEquals(1, $node->count());
        $this->request($client, $node->attr('href'));
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#comments_box .card-body a.pin-comment-link.active');
        self::assertEquals(1, $node->count());
        self::assertStringContainsString('/admin/department/', $node->attr('href'));
        self::assertStringContainsString('/comment_pin/', $node->attr('href'));
    }

    public function testCreateDefaultTeamAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/details');
        $node = $client->getCrawler()->filter('div.card#team_listing_box .card-body');
        self::assertStringContainsString('Visible to everyone, as no team was assigned yet.', $node->text(null, true));

        $this->request($client, '/admin/department/1/create_team');
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $node = $client->getCrawler()->filter('div.card#team_listing_box .card-title');
        self::assertStringContainsString('Only visible to the following teams and all admins.', $node->text(null, true));
        $node = $client->getCrawler()->filter('div.card#team_listing_box .card-body table tbody tr');
        self::assertEquals(1, $node->count());
    }

    public function testProjectsAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/projects/1');
        $node = $client->getCrawler()->filter('div.card#project_list_box .card-body table tbody tr');
        self::assertEquals(1, $node->count());

        /** @var EntityManager $em */
        $em = $this->getEntityManager();
        $department = $em->getRepository(Department::class)->find(1);

        $fixture = new ProjectFixtures();
        $fixture->setAmount(9); // to trigger a second page (every third activity is hidden)
        $fixture->setDepartments([$department]);
        $this->importFixture($fixture);

        $this->assertAccessIsGranted($client, '/admin/department/1/projects/1');

        $node = $client->getCrawler()->filter('div.card#project_list_box .card-footer ul.pagination li');
        self::assertEquals(4, $node->count());

        $node = $client->getCrawler()->filter('div.card#project_list_box .card-body table tbody tr');
        self::assertEquals(5, $node->count());
    }

    public function testCreateAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/create');
        $form = $client->getCrawler()->filter('form[name=department_edit_form]')->form();

        $editForm = $client->getCrawler()->filter('form[name=department_edit_form]')->form();
        self::assertEquals(date_default_timezone_get(), $editForm->get('department_edit_form[timezone]')->getValue());

        $client->submit($form, [
            'department_edit_form' => [
                'name' => 'Test Department',
            ]
        ]);

        $location = $this->assertIsModalRedirect($client, '/details');
        $this->requestPure($client, $location);

        $this->assertDetailsPage($client);
        $this->assertHasFlashSuccess($client);
    }

    public function testCreateActionShowsMetaFields(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        /** @var EventDispatcher $dispatcher */
        $dispatcher = self::getContainer()->get('event_dispatcher');
        $dispatcher->addSubscriber(new DepartmentTestMetaFieldSubscriberMock());
        $this->assertAccessIsGranted($client, '/admin/department/create');
        self::assertTrue($client->getResponse()->isSuccessful());

        $form = $client->getCrawler()->filter('form[name=department_edit_form]')->form();
        self::assertTrue($form->has('department_edit_form[metaFields][metatestmock][value]'));
        self::assertTrue($form->has('department_edit_form[metaFields][foobar][value]'));
        self::assertFalse($form->has('department_edit_form[metaFields][0][value]'));
    }

    public function testEditAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $this->assertAccessIsGranted($client, '/admin/department/1/edit');
        $form = $client->getCrawler()->filter('form[name=department_edit_form]')->form();
        self::assertEquals('Test', $form->get('department_edit_form[name]')->getValue());
        $client->submit($form, [
            'department_edit_form' => [
                'name' => 'Test Department 2'
            ]
        ]);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));
        $client->followRedirect();
        $this->request($client, '/admin/department/1/edit');
        $editForm = $client->getCrawler()->filter('form[name=department_edit_form]')->form();
        self::assertEquals('Test Department 2', $editForm->get('department_edit_form[name]')->getValue());
    }

    public function testTeamPermissionAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $em = $this->getEntityManager();

        /** @var Department $department */
        $department = $em->getRepository(Department::class)->find(1);
        self::assertEquals(0, $department->getTeams()->count());

        $fixture = new TeamFixtures();
        $fixture->setAmount(2);
        $fixture->setAddDepartment(false);
        $this->importFixture($fixture);

        $this->assertAccessIsGranted($client, '/admin/department/1/permissions');
        $form = $client->getCrawler()->filter('form[name=department_team_permission_form]')->form();
        /** @var ChoiceFormField $team1 */
        $team1 = $form->get('department_team_permission_form[teams][0]');
        $team1->tick();
        /** @var ChoiceFormField $team2 */
        $team2 = $form->get('department_team_permission_form[teams][1]');
        $team2->tick();

        $client->submit($form);
        $this->assertIsRedirect($client, $this->createUrl('/admin/department/1/details'));

        /** @var Department $department */
        $department = $em->getRepository(Department::class)->find(1);
        self::assertEquals(2, $department->getTeams()->count());
    }

    public function testDeleteAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);

        $fixture = new DepartmentFixtures();
        $fixture->setAmount(1);
        $departments = $this->importFixture($fixture);
        $department = $departments[0];
        $id = $department->getId();

        $this->request($client, '/admin/department/' . $id . '/edit');
        self::assertTrue($client->getResponse()->isSuccessful());
        $this->request($client, '/admin/department/' . $id . '/delete');
        self::assertTrue($client->getResponse()->isSuccessful());

        $form = $client->getCrawler()->filter('form[name=form]')->form();
        self::assertStringEndsWith($this->createUrl('/admin/department/' . $id . '/delete'), $form->getUri());
        $client->submit($form);

        $client->followRedirect();
        $this->assertHasDataTable($client);
        $this->assertHasFlashSuccess($client);

        $this->request($client, '/admin/department/' . $id . '/edit');
        self::assertFalse($client->getResponse()->isSuccessful());
    }

    public function testDeleteActionWithTimesheetEntries(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);

        $em = $this->getEntityManager();
        $fixture = new TimesheetFixtures();
        $fixture->setUser($this->getUserByRole(User::ROLE_USER));
        $fixture->setAmount(10);
        $this->importFixture($fixture);

        $timesheets = $em->getRepository(Timesheet::class)->findAll();
        self::assertEquals(10, \count($timesheets));

        /** @var Timesheet $entry */
        foreach ($timesheets as $entry) {
            self::assertEquals(1, $entry->getActivity()->getId());
        }

        $this->request($client, '/admin/department/1/delete');
        self::assertTrue($client->getResponse()->isSuccessful());

        $form = $client->getCrawler()->filter('form[name=form]')->form();
        self::assertStringEndsWith($this->createUrl('/admin/department/1/delete'), $form->getUri());
        $client->submit($form);

        $this->assertIsRedirect($client, $this->createUrl('/admin/department/'));
        $client->followRedirect();
        $this->assertHasFlashDeleteSuccess($client);
        $this->assertHasNoEntriesWithFilter($client);

        $em->clear();
        $timesheets = $em->getRepository(Timesheet::class)->findAll();
        self::assertEquals(0, \count($timesheets));

        $this->request($client, '/admin/department/1/edit');
        self::assertFalse($client->getResponse()->isSuccessful());
    }

    public function testDeleteActionWithTimesheetEntriesAndReplacement(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);

        $em = $this->getEntityManager();
        $fixture = new TimesheetFixtures();
        $fixture->setUser($this->getUserByRole(User::ROLE_USER));
        $fixture->setAmount(10);
        $this->importFixture($fixture);
        $fixture = new DepartmentFixtures();
        $fixture->setAmount(1)->setIsVisible(true);
        $departments = $this->importFixture($fixture);
        $department = $departments[0];
        $id = $department->getId();

        $timesheets = $em->getRepository(Timesheet::class)->findAll();
        self::assertEquals(10, \count($timesheets));

        /** @var Timesheet $entry */
        foreach ($timesheets as $entry) {
            self::assertEquals(1, $entry->getProject()->getDepartment()->getId());
        }

        $this->request($client, '/admin/department/1/delete');
        self::assertTrue($client->getResponse()->isSuccessful());

        $form = $client->getCrawler()->filter('form[name=form]')->form();
        self::assertStringEndsWith($this->createUrl('/admin/department/1/delete'), $form->getUri());
        $client->submit($form, [
            'form' => [
                'department' => $id
            ]
        ]);

        $this->assertIsRedirect($client, $this->createUrl('/admin/department/'));
        $client->followRedirect();
        $this->assertHasDataTable($client);
        $this->assertHasFlashSuccess($client);

        $timesheets = $em->getRepository(Timesheet::class)->findAll();
        self::assertEquals(10, \count($timesheets));

        /** @var Timesheet $entry */
        foreach ($timesheets as $entry) {
            self::assertEquals($id, $entry->getProject()->getDepartment()->getId());
        }

        $this->request($client, '/admin/department/1/edit');
        self::assertFalse($client->getResponse()->isSuccessful());
    }

    #[DataProvider('getValidationTestData')]
    public function testValidationForCreateAction(array $formData, array $validationFields): void
    {
        $this->assertFormHasValidationError(
            User::ROLE_ADMIN,
            '/admin/department/create',
            'form[name=department_edit_form]',
            $formData,
            $validationFields
        );
    }

    public static function getValidationTestData()
    {
        return [
            [
                [
                    'department_edit_form' => [
                        'name' => '',
                        'country' => '00',
                        'currency' => '00',
                        'timezone' => 'XXX'
                    ]
                ],
                [
                    '#department_edit_form_name',
                    '#department_edit_form_country',
                    '#department_edit_form_currency',
                    '#department_edit_form_timezone',
                ]
            ],
        ];
    }
}
