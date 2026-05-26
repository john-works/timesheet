<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller;

use App\Department\DepartmentService;
use App\Department\DepartmentStatisticService;
use App\Entity\Department;
use App\Entity\DepartmentComment;
use App\Entity\DepartmentRate;
use App\Event\DepartmentDetailControllerEvent;
use App\Event\DepartmentMetaDisplayEvent;
use App\Export\Spreadsheet\EntityWithMetaFieldsExporter;
use App\Export\Spreadsheet\Writer\BinaryFileResponseWriter;
use App\Export\Spreadsheet\Writer\XlsxWriter;
use App\Form\DepartmentCommentForm;
use App\Form\DepartmentEditForm;
use App\Form\DepartmentRateForm;
use App\Form\DepartmentTeamPermissionForm;
use App\Form\Toolbar\DepartmentToolbarForm;
use App\Form\Type\DepartmentType;
use App\Repository\DepartmentRateRepository;
use App\Repository\DepartmentRepository;
use App\Repository\ProjectRepository;
use App\Repository\Query\DepartmentQuery;
use App\Repository\Query\ProjectQuery;
use App\Repository\Query\TeamQuery;
use App\Repository\Query\TimesheetQuery;
use App\Repository\Query\VisibilityInterface;
use App\Repository\TeamRepository;
use App\User\TeamService;
use App\Utils\DataTable;
use App\Utils\PageSetup;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Controller used to manage departments.
 */
#[Route(path: '/admin/department')]
final class DepartmentController extends AbstractController
{
    public function __construct(private readonly DepartmentRepository $repository)
    {
    }

    #[Route(path: '/', defaults: ['page' => 1], name: 'admin_department', methods: ['GET'])]
    #[Route(path: '/page/{page}', requirements: ['page' => '[1-9]\d*'], name: 'admin_department_paginated', methods: ['GET'])]
    #[IsGranted(new Expression("is_granted('listing', 'department')"))]
    public function indexAction(int $page, Request $request, EventDispatcherInterface $dispatcher): Response
    {
        $query = new DepartmentQuery();
        $query->loadTeams();
        $query->setCurrentUser($this->getUser());
        $query->setPage($page);

        $form = $this->getToolbarForm($query, $request);
        if ($this->handleSearch($form, $request)) {
            return $this->redirectToRoute('admin_department');
        }

        $entries = $this->repository->getPagerfantaForQuery($query);
        $event = new DepartmentMetaDisplayEvent($query, DepartmentMetaDisplayEvent::DEPARTMENT);
        $dispatcher->dispatch($event);
        $metaColumns = $event->getFields();

        $table = new DataTable('department_admin', $query);
        $table->setPagination($entries);
        $table->setSearchForm($form);
        $table->setPaginationRoute('admin_department_paginated');
        $table->setReloadEvents('kimai.departmentUpdate kimai.departmentDelete kimai.departmentTeamUpdate');

        $table->addColumn('name', ['class' => 'alwaysVisible']);
        $table->addColumn('comment', ['class' => 'd-none', 'title' => 'description']);
        $table->addColumn('number', ['class' => 'd-none w-min']);
        $table->addColumn('company', ['class' => 'd-none']);
        $table->addColumn('vat_id', ['class' => 'd-none w-min']);
        $table->addColumn('contact', ['class' => 'd-none']);
        $table->addColumn('city', ['class' => 'd-none']);
        $table->addColumn('country', ['class' => 'd-none w-min']);
        $table->addColumn('currency', ['class' => 'd-none w-min']);
        $table->addColumn('phone', ['class' => 'd-none']);
        $table->addColumn('fax', ['class' => 'd-none']);
        $table->addColumn('mobile', ['class' => 'd-none']);
        $table->addColumn('email', ['class' => 'd-none']);
        $table->addColumn('homepage', ['class' => 'd-none']);

        foreach ($metaColumns as $metaColumn) {
            $table->addColumn('mf_' . $metaColumn->getName(), ['title' => $metaColumn->getLabel(), 'class' => 'd-none', 'orderBy' => false, 'data' => $metaColumn]);
        }

        if ($this->isGranted('budget_money', 'department')) {
            $table->addColumn('budget', ['class' => 'd-none text-end w-min', 'title' => 'budget']);
        }

        if ($this->isGranted('budget_time', 'department')) {
            $table->addColumn('timeBudget', ['class' => 'd-none text-end w-min', 'title' => 'timeBudget']);
        }

        $table->addColumn('billable', ['class' => 'd-none text-center w-min', 'orderBy' => false]);
        $table->addColumn('team', ['class' => 'text-center w-min', 'orderBy' => false]);
        $table->addColumn('visible', ['class' => 'd-none text-center w-min']);
        $table->addColumn('actions', ['class' => 'actions']);

        $page = $this->createPageSetup();
        $page->setDataTable($table);
        $page->setActionName('departments');

        return $this->render('department/index.html.twig', [
            'page_setup' => $page,
            'dataTable' => $table,
            'metaColumns' => $metaColumns,
            'now' => $this->getDateTimeFactory()->createDateTime(),
        ]);
    }

    #[Route(path: '/create', name: 'admin_department_create', methods: ['GET', 'POST'])]
    #[IsGranted('create_department')]
    public function createAction(Request $request, DepartmentService $departmentService): Response
    {
        $department = $departmentService->createNewDepartment('');

        return $this->renderDepartmentForm($department, $request, $departmentService);
    }

    #[Route(path: '/{id}/permissions', name: 'admin_department_permissions', methods: ['GET', 'POST'])]
    #[IsGranted('permissions', 'department')]
    public function teamPermissionsAction(Department $department, Request $request): Response
    {
        $form = $this->createForm(DepartmentTeamPermissionForm::class, $department, [
            'action' => $this->generateUrl('admin_department_permissions', ['id' => $department->getId()]),
            'method' => 'POST',
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $this->repository->saveDepartment($department);
                $this->flashSuccess('action.update.success');

                if ($this->isGranted('view', $department)) {
                    return $this->redirectToRoute('department_details', ['id' => $department->getId()]);
                }

                return $this->redirectToRoute('admin_department');
            } catch (\Exception $ex) {
                $this->flashUpdateException($ex);
            }
        }

        return $this->render('department/permissions.html.twig', [
            'page_setup' => $this->createPageSetup(),
            'department' => $department,
            'form' => $form->createView()
        ]);
    }

    #[Route(path: '/{id}/comment_delete/{token}', name: 'department_comment_delete', methods: ['GET'])]
    #[IsGranted(new Expression("is_granted('edit', subject.getDepartment()) and is_granted('comments', subject.getDepartment())"), 'comment')]
    public function deleteCommentAction(DepartmentComment $comment, string $token, CsrfTokenManagerInterface $csrfTokenManager): Response
    {
        $departmentId = $comment->getDepartment()->getId();

        if (!$csrfTokenManager->isTokenValid(new CsrfToken('comment.delete', $token))) {
            $this->flashError('action.csrf.error');

            return $this->redirectToRoute('department_details', ['id' => $departmentId]);
        }

        $csrfTokenManager->refreshToken('comment.delete');

        try {
            $this->repository->deleteComment($comment);
        } catch (\Exception $ex) {
            $this->flashDeleteException($ex);
        }

        return $this->redirectToRoute('department_details', ['id' => $departmentId]);
    }

    #[Route(path: '/{id}/comment_add', name: 'department_comment_add', methods: ['POST'])]
    #[IsGranted('comments', 'department')]
    public function addCommentAction(Department $department, Request $request): Response
    {
        $comment = new DepartmentComment($department);
        $form = $this->getCommentForm($comment);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $this->repository->saveComment($comment);
            } catch (\Exception $ex) {
                $this->flashUpdateException($ex);
            }
        }

        return $this->redirectToRoute('department_details', ['id' => $department->getId()]);
    }

    #[Route(path: '/{id}/comment_pin/{token}', name: 'department_comment_pin', methods: ['GET'])]
    #[IsGranted(new Expression("is_granted('edit', subject.getDepartment()) and is_granted('comments', subject.getDepartment())"), 'comment')]
    public function pinCommentAction(DepartmentComment $comment, string $token, CsrfTokenManagerInterface $csrfTokenManager): Response
    {
        $departmentId = $comment->getDepartment()->getId();

        if (!$csrfTokenManager->isTokenValid(new CsrfToken('comment.pin', $token))) {
            $this->flashError('action.csrf.error');

            return $this->redirectToRoute('department_details', ['id' => $departmentId]);
        }

        $csrfTokenManager->refreshToken('comment.pin');

        $comment->setPinned(!$comment->isPinned());
        try {
            $this->repository->saveComment($comment);
        } catch (\Exception $ex) {
            $this->flashUpdateException($ex);
        }

        return $this->redirectToRoute('department_details', ['id' => $departmentId]);
    }

    #[Route(path: '/{id}/create_team', name: 'department_team_create', methods: ['GET'])]
    #[IsGranted('create_team')]
    #[IsGranted('permissions', 'department')]
    public function createDefaultTeamAction(Department $department, TeamService $teamService): Response
    {
        $name = $department->getName();
        if ($name === null) {
            throw new BadRequestHttpException('Cannot create default team for department with empty name: ' . $department->getId());
        }

        $defaultTeam = $teamService->findTeamByName($name);

        if (null === $defaultTeam) {
            $defaultTeam = $teamService->createNewTeam($name);
        }

        $defaultTeam->addTeamlead($this->getUser());
        $defaultTeam->addDepartment($department);

        try {
            $teamService->saveTeam($defaultTeam);
        } catch (\Exception $ex) {
            $this->flashUpdateException($ex);
        }

        return $this->redirectToRoute('department_details', ['id' => $department->getId()]);
    }

    #[Route(path: '/{id}/projects/{page}', defaults: ['page' => 1], name: 'department_projects', methods: ['GET', 'POST'])]
    #[IsGranted('view', 'department')]
    public function projectsAction(Department $department, int $page, ProjectRepository $projectRepository): Response
    {
        $query = new ProjectQuery();
        $query->setCurrentUser($this->getUser());
        $query->setPage($page);
        $query->setPageSize(5);
        $query->addDepartment($department);
        $query->setVisibility(VisibilityInterface::SHOW_BOTH);
        $query->addOrderGroup('visible', ProjectQuery::ORDER_DESC);
        $query->addOrderGroup('name', ProjectQuery::ORDER_ASC);

        $entries = $projectRepository->getPagerfantaForQuery($query);

        return $this->render('department/embed_projects.html.twig', [
            'department' => $department,
            'projects' => $entries,
            'page' => $page,
            'now' => $this->getDateTimeFactory()->createDateTime(),
        ]);
    }

    #[Route(path: '/{id}/details', name: 'department_details', methods: ['GET', 'POST'])]
    #[IsGranted('view', 'department')]
    public function detailsAction(Department $department, TeamRepository $teamRepository, DepartmentRateRepository $rateRepository, DepartmentStatisticService $statisticService, DepartmentService $departmentService, EventDispatcherInterface $dispatcher): Response
    {
        $departmentService->loadMetaFields($department);

        $stats = null;
        $timezone = null;
        $defaultTeam = null;
        $commentForm = null;
        $attachments = [];
        $comments = null;
        $teams = null;
        $rates = [];
        $now = $this->getDateTimeFactory()->createDateTime();

        $exportUrl = null;
        $invoiceUrl = null;
        if ($this->isGranted('create_export')) {
            $exportUrl = $this->generateUrl('export', ['departments[]' => $department->getId(), 'projects[]' => '', 'daterange' => '', 'exported' => TimesheetQuery::STATE_NOT_EXPORTED, 'preview' => true, 'billable' => true]);
        }
        if ($this->isGranted('view_invoice')) {
            $invoiceUrl = $this->generateUrl('invoice', ['departments[]' => $department->getId(), 'projects[]' => '', 'daterange' => '', 'exported' => TimesheetQuery::STATE_NOT_EXPORTED, 'billable' => true]);
        }

        if ($this->isGranted('edit', $department)) {
            if ($this->isGranted('create_team')) {
                $defaultTeam = $teamRepository->findOneBy(['name' => $department->getName()]);
            }
            $rates = $rateRepository->getRatesForDepartment($department);
        }

        if ($department->getTimezone() !== null && $department->getTimezone() !== '') {
            $timezone = new \DateTimeZone($department->getTimezone());
        }

        if ($this->isGranted('budget', $department) || $this->isGranted('time', $department)) {
            $stats = $statisticService->getBudgetStatisticModel($department, $now);
        }

        if ($this->isGranted('comments', $department)) {
            $comments = $this->repository->getComments($department);
            $commentForm = $this->getCommentForm(new DepartmentComment($department))->createView();
        }

        if ($this->isGranted('permissions', $department) || $this->isGranted('details', $department) || $this->isGranted('view_team')) {
            $query = new TeamQuery();
            $query->addDepartment($department);
            $teams = $teamRepository->getTeamsForQuery($query);
        }

        // additional boxes by plugins
        $event = new DepartmentDetailControllerEvent($department);
        $dispatcher->dispatch($event);
        $boxes = $event->getController();

        $page = $this->createPageSetup();
        $page->setActionName('department');
        $page->setActionView('department_details');
        $page->setActionPayload(['department' => $department]);

        return $this->render('department/details.html.twig', [
            'page_setup' => $page,
            'department' => $department,
            'comments' => $comments,
            'commentForm' => $commentForm,
            'attachments' => $attachments,
            'stats' => $stats,
            'team' => $defaultTeam,
            'teams' => $teams,
            'department_now' => new \DateTime('now', $timezone),
            'rates' => $rates,
            'now' => $now,
            'boxes' => $boxes,
            'export_url' => $exportUrl,
            'invoice_url' => $invoiceUrl,
        ]);
    }

    #[Route(path: '/{id}/rate/{rate}', name: 'admin_department_rate_edit', methods: ['GET', 'POST'])]
    #[IsGranted('edit', 'department')]
    public function editRateAction(Department $department, DepartmentRate $rate, Request $request, DepartmentRateRepository $repository): Response
    {
        return $this->rateFormAction($department, $rate, $request, $repository, $this->generateUrl('admin_department_rate_edit', ['id' => $department->getId(), 'rate' => $rate->getId()]));
    }

    #[Route(path: '/{id}/rate', name: 'admin_department_rate_add', methods: ['GET', 'POST'])]
    #[IsGranted('edit', 'department')]
    public function addRateAction(Department $department, Request $request, DepartmentRateRepository $repository): Response
    {
        $rate = new DepartmentRate();
        $rate->setDepartment($department);

        return $this->rateFormAction($department, $rate, $request, $repository, $this->generateUrl('admin_department_rate_add', ['id' => $department->getId()]));
    }

    private function rateFormAction(Department $department, DepartmentRate $rate, Request $request, DepartmentRateRepository $repository, string $formUrl): Response
    {
        $form = $this->createForm(DepartmentRateForm::class, $rate, [
            'action' => $formUrl,
            'method' => 'POST',
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $repository->saveRate($rate);
                $this->flashSuccess('action.update.success');

                return $this->redirectToRoute('department_details', ['id' => $department->getId()]);
            } catch (\Exception $ex) {
                $this->flashUpdateException($ex);
            }
        }

        return $this->render('department/rates.html.twig', [
            'page_setup' => $this->createPageSetup(),
            'department' => $department,
            'form' => $form->createView()
        ]);
    }

    #[Route(path: '/{id}/edit', name: 'admin_department_edit', methods: ['GET', 'POST'])]
    #[IsGranted('edit', 'department')]
    public function editAction(Department $department, Request $request, DepartmentService $departmentService): Response
    {
        $departmentService->loadMetaFields($department);

        return $this->renderDepartmentForm($department, $request, $departmentService);
    }

    #[Route(path: '/{id}/delete', name: 'admin_department_delete', methods: ['GET', 'POST'])]
    #[IsGranted('delete', 'department')]
    public function deleteAction(Department $department, Request $request, DepartmentStatisticService $statisticService, DepartmentService $departmentService): Response
    {
        $stats = $statisticService->getDepartmentStatistics($department);

        $deleteForm = $this->createFormBuilder(null, [
                'attr' => [
                    'data-form-event' => 'kimai.departmentDelete',
                    'data-msg-success' => 'action.delete.success',
                    'data-msg-error' => 'action.delete.error',
                ]
            ])
            ->add('department', DepartmentType::class, [
                'query_builder_for_user' => true,
                'ignore_department' => $department,
                'required' => false,
            ])
            ->setAction($this->generateUrl('admin_department_delete', ['id' => $department->getId()]))
            ->setMethod('POST')
            ->getForm();

        $deleteForm->handleRequest($request);

        if ($deleteForm->isSubmitted() && $deleteForm->isValid()) {
            try {
                /** @var Department|null $replace */
                $replace = $deleteForm->get('department')->getData();
                $departmentService->deleteDepartment($department, $replace);
                $this->flashSuccess('action.delete.success');
            } catch (\Exception $ex) {
                $this->flashDeleteException($ex);
            }

            return $this->redirectToRoute('admin_department');
        }

        return $this->render('department/delete.html.twig', [
            'page_setup' => $this->createPageSetup(),
            'department' => $department,
            'stats' => $stats,
            'form' => $deleteForm->createView(),
        ]);
    }

    #[Route(path: '/export', name: 'department_export', methods: ['GET'])]
    #[IsGranted(new Expression("is_granted('listing', 'department')"))]
    public function exportAction(Request $request, EntityWithMetaFieldsExporter $exporter): Response
    {
        $query = new DepartmentQuery();
        $query->setCurrentUser($this->getUser());

        $form = $this->getToolbarForm($query, $request);
        $form->setData($query);
        $form->submit($request->query->all(), false);

        if (!$form->isValid()) {
            $query->resetByFormError($form->getErrors());
        }

        $entries = $this->repository->getDepartmentsForQuery($query);

        $spreadsheet = $exporter->export(
            Department::class,
            $entries,
            new DepartmentMetaDisplayEvent($query, DepartmentMetaDisplayEvent::EXPORT)
        );
        $writer = new BinaryFileResponseWriter(new XlsxWriter(), 'kimai-departments');

        return $writer->getFileResponse($spreadsheet);
    }

    private function renderDepartmentForm(Department $department, Request $request, DepartmentService $departmentService): Response
    {
        $create = ($department->getId() === null);

        if ($create) {
            $url = $this->generateUrl('admin_department_create');
        } else {
            $url = $this->generateUrl('admin_department_edit', ['id' => $department->getId()]);
        }

        $editForm = $this->createForm(DepartmentEditForm::class, $department, [
            'action' => $url,
            'method' => 'POST',
            'include_budget' => $this->isGranted('budget', $department),
            'include_time' => $this->isGranted('time', $department),
        ]);

        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            try {
                $departmentService->saveDepartment($department);
                $this->flashSuccess('action.update.success');

                if ($create) {
                    return $this->redirectToRouteAfterCreate('department_details', ['id' => $department->getId()]);
                }

                if ($this->isGranted('view', $department)) {
                    return $this->redirectToRoute('department_details', ['id' => $department->getId()]);
                } else {
                    return new Response();
                }
            } catch (\Exception $ex) {
                $this->handleFormUpdateException($ex, $editForm);
            }
        }

        return $this->render('department/edit.html.twig', [
            'page_setup' => $this->createPageSetup(),
            'department' => $department,
            'form' => $editForm->createView()
        ]);
    }

    /**
     * @return FormInterface<DepartmentQuery>
     */
    private function getToolbarForm(DepartmentQuery $query, Request $request): FormInterface
    {
        return $this->createSearchForm(DepartmentToolbarForm::class, $query, [
            'locale' => $request->getLocale(),
            'action' => $this->generateUrl('admin_department', [
                'page' => $query->getPage(),
            ])
        ]);
    }

    /**
     * @return FormInterface<mixed>
     */
    private function getCommentForm(DepartmentComment $comment): FormInterface
    {
        if (null === $comment->getId()) {
            $comment->setCreatedBy($this->getUser());
        }

        return $this->createForm(DepartmentCommentForm::class, $comment, [
            'action' => $this->generateUrl('department_comment_add', ['id' => $comment->getDepartment()->getId()]),
            'method' => 'POST',
        ]);
    }

    private function createPageSetup(): PageSetup
    {
        $page = new PageSetup('departments');
        $page->setHelp('department.html');

        return $page;
    }
}
