<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\API;

use App\Department\DepartmentService;
use App\Entity\Department;
use App\Entity\DepartmentRate;
use App\Entity\User;
use App\Form\API\DepartmentApiEditForm;
use App\Form\API\DepartmentRateApiForm;
use App\Repository\DepartmentRateRepository;
use App\Repository\DepartmentRepository;
use App\Repository\Query\DepartmentQuery;
use App\Utils\SearchTerm;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\View\View;
use FOS\RestBundle\View\ViewHandlerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(path: '/departments')]
#[IsGranted('API')]
#[OA\Tag(name: 'Department')]
final class DepartmentController extends BaseApiController
{
    public const GROUPS_ENTITY = ['Default', 'Entity', 'Department', 'Department_Entity'];
    public const GROUPS_COLLECTION = ['Default', 'Collection', 'Department'];
    public const GROUPS_RATE = ['Default', 'Entity', 'Department_Rate'];

    public function __construct(
        private readonly ViewHandlerInterface $viewHandler,
        private readonly DepartmentRepository $repository,
        private readonly DepartmentRateRepository $departmentRateRepository,
        private readonly DepartmentService $departmentService,
    ) {
    }

    /**
     * Fetch departments
     */
    #[OA\Response(response: 200, description: 'Returns a collection of departments', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/DepartmentCollection')))]
    #[Route(methods: ['GET'], path: '', name: 'get_departments')]
    #[Rest\QueryParam(name: 'visible', requirements: '1|2|3', default: 1, strict: true, nullable: true, description: 'Visibility status to filter departments: 1=visible, 2=hidden, 3=both')]
    #[Rest\QueryParam(name: 'order', requirements: 'ASC|DESC', strict: true, nullable: true, description: 'The result order. Allowed values: ASC, DESC (default: ASC)')]
    #[Rest\QueryParam(name: 'orderBy', requirements: 'id|name', strict: true, nullable: true, description: 'The field by which results will be ordered. Allowed values: id, name (default: name)')]
    #[Rest\QueryParam(name: 'term', description: 'Free search term', nullable: true)]
    public function cgetAction(ParamFetcherInterface $paramFetcher): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $query = new DepartmentQuery();
        $query->loadTeams();
        $query->setCurrentUser($user);

        $order = $paramFetcher->get('order');
        if (\is_string($order) && $order !== '') {
            $query->setOrder($order);
        }

        $orderBy = $paramFetcher->get('orderBy');
        if (\is_string($orderBy) && $orderBy !== '') {
            $query->setOrderBy($orderBy);
        }

        $visible = $paramFetcher->get('visible');
        if (is_numeric($visible)) {
            $query->setVisibility((int) $visible);
        }

        $term = $paramFetcher->get('term');
        if (\is_string($term) && $term !== '') {
            $query->setSearchTerm(new SearchTerm($term));
        }

        $query->setIsApiCall(true);
        $data = $this->repository->getDepartmentsForQuery($query);
        $view = new View($data, 200);
        $view->getContext()->setGroups(self::GROUPS_COLLECTION);

        return $this->viewHandler->handle($view);
    }

    /**
     * Fetch department
     */
    #[OA\Response(response: 200, description: 'Returns one department entity', content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEntity'))]
    #[Route(methods: ['GET'], path: '/{id}', name: 'get_department', requirements: ['id' => '\d+'])]
    #[IsGranted('view', 'department')]
    public function getAction(Department $department): Response
    {
        $view = new View($department, 200);
        $view->getContext()->setGroups(self::GROUPS_ENTITY);

        return $this->viewHandler->handle($view);
    }

    /**
     * Create department
     */
    #[OA\Post(description: 'Creates a new department and returns it afterwards', responses: [new OA\Response(response: 200, description: 'Returns the new created department', content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEntity'))])]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEditForm'))]
    #[Route(methods: ['POST'], path: '', name: 'post_department')]
    public function postAction(Request $request, DepartmentService $departmentService): Response
    {
        if (!$this->isGranted('create_department')) {
            throw $this->createAccessDeniedException('User cannot create departments');
        }

        $department = $departmentService->createNewDepartment('');

        $form = $this->createForm(DepartmentApiEditForm::class, $department, [
            'include_budget' => $this->isGranted('budget', $department),
            'include_time' => $this->isGranted('time', $department),
        ]);

        $form->submit($request->request->all());

        if ($form->isValid()) {
            $this->departmentService->saveDepartment($department);

            $view = new View($department, 200);
            $view->getContext()->setGroups(self::GROUPS_ENTITY);

            return $this->viewHandler->handle($view);
        }

        $view = new View($form);
        $view->getContext()->setGroups(self::GROUPS_ENTITY);

        return $this->viewHandler->handle($view);
    }

    /**
     * Update department
     */
    #[IsGranted('edit', 'department')]
    #[OA\Patch(description: 'Update an existing department, you can pass all or just a subset of all attributes', responses: [new OA\Response(response: 200, description: 'Returns the updated department', content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEntity'))])]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEditForm'))]
    #[OA\Parameter(name: 'id', in: 'path', description: 'Department ID to update', required: true)]
    #[Route(methods: ['PATCH'], path: '/{id}', name: 'patch_department', requirements: ['id' => '\d+'])]
    public function patchAction(Request $request, Department $department): Response
    {
        $this->departmentService->loadMetaFields($department);

        $form = $this->createForm(DepartmentApiEditForm::class, $department, [
            'include_budget' => $this->isGranted('budget', $department),
            'include_time' => $this->isGranted('time', $department),
        ]);

        $form->setData($department);
        $form->submit($request->request->all(), false);

        if (false === $form->isValid()) {
            $view = new View($form, Response::HTTP_OK);
            $view->getContext()->setGroups(self::GROUPS_ENTITY);

            return $this->viewHandler->handle($view);
        }

        $this->departmentService->saveDepartment($department);

        $view = new View($department, Response::HTTP_OK);
        $view->getContext()->setGroups(self::GROUPS_ENTITY);

        return $this->viewHandler->handle($view);
    }

    /**
     * Delete department
     *
     * [DANGER] This will also delete ALL linked projects, project activities and timesheets.
     * Do you want to use `PATCH` instead and mark it as inactive with `{visible: false}` instead?
     */
    #[IsGranted('delete', 'department')]
    #[OA\Delete(responses: [new OA\Response(response: 204, description: 'Delete one department')])]
    #[OA\Parameter(name: 'id', description: 'Department ID to delete', in: 'path', required: true)]
    #[Route(path: '/{id}', name: 'delete_department', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function deleteAction(Department $department): Response
    {
        $this->departmentService->deleteDepartment($department);

        $view = new View(null, Response::HTTP_NO_CONTENT);

        return $this->viewHandler->handle($view);
    }

    /**
     * Update department custom-field
     */
    #[IsGranted('edit', 'department')]
    #[OA\Response(response: 200, description: 'Sets the value of an existing/configured meta-field. You cannot create unknown meta-fields, if the given name is not a configured meta-field, this will return an exception.', content: new OA\JsonContent(ref: '#/components/schemas/DepartmentEntity'))]
    #[OA\Parameter(name: 'id', in: 'path', description: 'Department record ID to set the meta-field value for', required: true)]
    #[Route(methods: ['PATCH'], path: '/{id}/meta', requirements: ['id' => '\d+'])]
    #[Rest\RequestParam(name: 'name', strict: true, nullable: false, description: 'The meta-field name')]
    #[Rest\RequestParam(name: 'value', strict: true, nullable: false, description: 'The meta-field value')]
    public function metaAction(Department $department, ParamFetcherInterface $paramFetcher): Response
    {
        $this->departmentService->loadMetaFields($department);

        $name = $paramFetcher->get('name');
        $value = $paramFetcher->get('value');

        if (null === ($meta = $department->getMetaField($name))) {
            throw $this->createNotFoundException('Unknown meta-field requested');
        }

        $meta->setValue($value);

        $this->departmentService->saveDepartment($department);

        $view = new View($department, 200);
        $view->getContext()->setGroups(self::GROUPS_ENTITY);

        return $this->viewHandler->handle($view);
    }

    /**
     * Fetch rates for department
     */
    #[IsGranted('edit', 'department')]
    #[OA\Response(response: 200, description: 'Returns a collection of department rate entities', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/DepartmentRate')))]
    #[OA\Parameter(name: 'id', in: 'path', description: 'The department whose rates will be returned', required: true)]
    #[Route(methods: ['GET'], path: '/{id}/rates', name: 'get_department_rates', requirements: ['id' => '\d+'])]
    public function getRatesAction(Department $department): Response
    {
        $rates = $this->departmentRateRepository->getRatesForDepartment($department);

        $view = new View($rates, 200);
        $view->getContext()->setGroups(self::GROUPS_RATE);

        return $this->viewHandler->handle($view);
    }

    /**
     * Delete rate for department
     */
    #[IsGranted('edit', 'department')]
    #[OA\Delete(responses: [new OA\Response(response: 204, description: 'Returns no content: 204 on successful delete')])]
    #[OA\Parameter(name: 'id', in: 'path', description: 'The department whose rate will be removed', required: true)]
    #[OA\Parameter(name: 'rateId', in: 'path', description: 'The rate to remove', required: true)]
    #[Route(methods: ['DELETE'], path: '/{id}/rates/{rateId}', name: 'delete_department_rate', requirements: ['id' => '\d+', 'rateId' => '\d+'])]
    public function deleteRateAction(Department $department, #[MapEntity(mapping: ['rateId' => 'id'])] DepartmentRate $rate): Response
    {
        if ($rate->getDepartment() !== $department) {
            throw $this->createNotFoundException();
        }

        $this->departmentRateRepository->deleteRate($rate);

        $view = new View(null, Response::HTTP_NO_CONTENT);

        return $this->viewHandler->handle($view);
    }

    /**
     * Add rate for department
     */
    #[IsGranted('edit', 'department')]
    #[OA\Post(responses: [new OA\Response(response: 200, description: 'Returns the new created rate', content: new OA\JsonContent(ref: '#/components/schemas/DepartmentRate'))])]
    #[OA\Parameter(name: 'id', in: 'path', description: 'The department to add the rate for', required: true)]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/DepartmentRateForm'))]
    #[Route(methods: ['POST'], path: '/{id}/rates', name: 'post_department_rate', requirements: ['id' => '\d+'])]
    public function postRateAction(Department $department, Request $request): Response
    {
        $rate = new DepartmentRate();
        $rate->setDepartment($department);

        $form = $this->createForm(DepartmentRateApiForm::class, $rate, [
            'method' => 'POST',
        ]);

        $form->setData($rate);
        $form->submit($request->request->all(), false);

        if (false === $form->isValid()) {
            $view = new View($form, Response::HTTP_OK);
            $view->getContext()->setGroups(self::GROUPS_RATE);

            return $this->viewHandler->handle($view);
        }

        $this->departmentRateRepository->saveRate($rate);

        $view = new View($rate, Response::HTTP_OK);
        $view->getContext()->setGroups(self::GROUPS_RATE);

        return $this->viewHandler->handle($view);
    }
}
