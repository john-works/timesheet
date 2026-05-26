<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form\Type;

use App\Entity\Department;
use App\Form\Helper\DepartmentHelper;
use App\Repository\DepartmentRepository;
use App\Repository\Query\DepartmentFormTypeQuery;
use App\Repository\Query\ProjectQuery;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Custom form field type to select a department.
 */
final class DepartmentType extends AbstractType
{
    public function __construct(private DepartmentHelper $departmentHelper)
    {
    }

    public function getChoiceLabel(Department $department): string
    {
        return $this->departmentHelper->getChoiceLabel($department);
    }

    public function getChoiceAttributes(Department $department, $key, $value): array
    {
        return ['data-currency' => $department->getCurrency()];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // documentation is for NelmioApiDocBundle
            'documentation' => [
                'type' => 'integer',
                'description' => 'Department ID',
            ],
            'label' => 'department',
            'class' => Department::class,
            'choice_label' => [$this, 'getChoiceLabel'],
            'choice_attr' => [$this, 'getChoiceAttributes'],
            'query_builder_for_user' => true,
            'project_enabled' => false,
            'project_select' => 'project',
            'start_date_param' => '%begin_date%',
            'end_date_param' => '%end_date%',
            'ignore_date' => false,
            'project_visibility' => ProjectQuery::SHOW_VISIBLE,
            // @var Department|null
            'ignore_department' => null,
            // @var Department|Department[]|null
            'departments' => null,
            'pre_select_department' => false,
        ]);

        $resolver->setDefault('query_builder', function (Options $options) {
            return function (DepartmentRepository $repo) use ($options) {
                $query = new DepartmentFormTypeQuery($options['departments']);

                if (true === $options['pre_select_department']) {
                    $query->setAllowDepartmentPreselect(true);
                }

                if (true === $options['query_builder_for_user']) {
                    $query->setUser($options['user']);
                }

                if (null !== $options['ignore_department']) {
                    $query->setDepartmentToIgnore($options['ignore_department']);
                }

                return $repo->getQueryBuilderForFormType($query);
            };
        });

        $resolver->setDefault('api_data', function (Options $options) {
            if (false !== $options['project_enabled']) {
                $name = \is_string($options['project_enabled']) ? $options['project_enabled'] : 'department';
                $routeParams = [$name => '%' . $name . '%', 'visible' => $options['project_visibility']];
                $emptyRouteParams = ['visible' => $options['project_visibility']];

                if (!$options['ignore_date']) {
                    if (!empty($options['start_date_param'])) {
                        $routeParams['start'] = $options['start_date_param'];
                        $emptyRouteParams['start'] = $options['start_date_param'];
                    }

                    if (!empty($options['end_date_param'])) {
                        $routeParams['end'] = $options['end_date_param'];
                        $emptyRouteParams['end'] = $options['end_date_param'];
                    }
                } else {
                    $routeParams['ignoreDates'] = 1;
                    $emptyRouteParams['ignoreDates'] = 1;
                }

                return [
                    'reload' => 'get_departments',
                    'select' => $options['project_select'],
                    'route' => 'get_projects',
                    'route_params' => $routeParams,
                    'empty_route_params' => $emptyRouteParams,
                ];
            }

            return [];
        });
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['attr'] = array_merge($view->vars['attr'], [
            'data-option-pattern' => $this->departmentHelper->getChoicePattern(),
        ]);
    }

    public function getParent(): string
    {
        return EntityType::class;
    }
}
