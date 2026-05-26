<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use App\Form\Type\ActivityType;
use App\Form\Type\DepartmentType;
use App\Form\Type\ProjectType;
use App\Repository\ProjectRepository;
use App\Repository\Query\ProjectFormTypeQuery;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * Helper functions to manage dependent department-project-activity fields.
 *
 * If you always want to show the list of all available projects/activities, use the form types directly.
 */
trait FormTrait
{
    protected function addDepartment(FormBuilderInterface $builder, ?Department $department = null): void
    {
        $builder->add('department', DepartmentType::class, [
            'query_builder_for_user' => true,
            'departments' => $department,
            'data' => $department,
            'required' => false,
            'placeholder' => '',
            'mapped' => false,
            'project_enabled' => true,
        ]);
    }

    protected function addProject(FormBuilderInterface $builder, bool $isNew, ?Project $project = null, ?Department $department = null, array $options = []): void
    {
        $options = array_merge([
            'placeholder' => '',
            'activity_enabled' => true,
            'query_builder_for_user' => true,
            'join_department' => true
        ], $options);

        $builder->add('project', ProjectType::class, array_merge($options, [
            'projects' => $project,
            'departments' => $department,
        ]));

        // replaces the project select after submission, to make sure only projects for the selected department are displayed
        $builder->addEventListener(
            FormEvents::PRE_SUBMIT,
            function (FormEvent $event) use ($builder, $project, $department, $isNew, $options): void {
                /** @var array<string, mixed> $data */
                $data = $event->getData();
                $department = \array_key_exists('department', $data) && $data['department'] !== '' ? $data['department'] : null;
                $project = \array_key_exists('project', $data) && $data['project'] !== '' ? $data['project'] : $project;

                $event->getForm()->add('project', ProjectType::class, array_merge($options, [
                    'group_by' => null,
                    'query_builder' => function (ProjectRepository $repo) use ($builder, $project, $department, $isNew) {
                        // is there a better way to prevent starting a record with a hidden project ?
                        $project = \is_string($project) ? (int) $project : $project;
                        $department = \is_string($department) ? (int) $department : $department;
                        if ($isNew && \is_int($project)) {
                            /** @var Project $project */
                            $project = $repo->find($project);
                            if ($project !== null) {
                                if (!$project->getDepartment()->isVisible()) {
                                    $department = null;
                                    $project = null;
                                } elseif (!$project->isVisible()) {
                                    $project = null;
                                }
                            }
                        }

                        if ($project !== null && !\is_int($project) && !($project instanceof Project)) {
                            throw new \InvalidArgumentException('Project type needs a project object or an ID');
                        }

                        if ($department !== null && !\is_int($department) && !($department instanceof Department)) {
                            throw new \InvalidArgumentException('Project type needs a department object or an ID');
                        }

                        $query = new ProjectFormTypeQuery($project, $department);
                        $query->setUser($builder->getOption('user'));
                        $query->setWithDepartment(true);

                        return $repo->getQueryBuilderForFormType($query);
                    },
                ]));
            }
        );
    }

    protected function addActivity(FormBuilderInterface $builder, ?Activity $activity = null, ?Project $project = null, array $options = []): void
    {
        $options = array_merge(['placeholder' => '', 'query_builder_for_user' => true], $options);

        $options['projects'] = $project;
        $options['activities'] = $activity;

        $builder->add('activity', ActivityType::class, $options);

        // replaces the activity select after submission, to make sure only activities for the selected project are displayed
        $builder->addEventListener(
            FormEvents::PRE_SUBMIT,
            function (FormEvent $event) use ($options): void {
                /** @var array<string, mixed> $data */
                $data = $event->getData();

                if (!\array_key_exists('project', $data) || $data['project'] === '' || $data['project'] === null) {
                    return;
                }

                $options['projects'] = \is_string($data['project']) ? (int) $data['project'] : $data['project'];

                $event->getForm()->add('activity', ActivityType::class, $options);
            }
        );
    }
}
