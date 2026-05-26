<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Select the pattern that will be used for calendar entry titles.
 */
final class CalendarTitlePatternType extends AbstractType
{
    public const PATTERN_DEPARTMENT = '{department}';
    public const PATTERN_PROJECT = '{project}';
    public const PATTERN_ACTIVITY = '{activity}';
    public const PATTERN_DESCRIPTION = '{description}';
    public const PATTERN_DURATION = '{duration}';
    public const SPACER = ' - ';
    public const PATTERN_ACTIVITY_DESCRIPTION = self::PATTERN_ACTIVITY . self::SPACER . self::PATTERN_DESCRIPTION;
    public const PATTERN_PROJECT_DESCRIPTION = self::PATTERN_PROJECT . self::SPACER . self::PATTERN_DESCRIPTION;
    public const PATTERN_DEPARTMENT_DESCRIPTION = self::PATTERN_DEPARTMENT . self::SPACER . self::PATTERN_DESCRIPTION;
    public const PATTERN_PROJECT_DEPARTMENT = self::PATTERN_PROJECT . self::SPACER . self::PATTERN_DEPARTMENT;
    public const PATTERN_DEPARTMENT_PROJECT = self::PATTERN_DEPARTMENT . self::SPACER . self::PATTERN_PROJECT;
    public const PATTERN_PROJECT_ACTIVITY = self::PATTERN_PROJECT . self::SPACER . self::PATTERN_ACTIVITY;

    public function __construct(private TranslatorInterface $translator)
    {
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $department = $this->translator->trans('department');
        $project = $this->translator->trans('project');
        $activity = $this->translator->trans('activity');
        $description = $this->translator->trans('description');
        $duration = $this->translator->trans('duration');

        $resolver->setDefaults([
            'label' => 'choice_pattern',
            'choices' => [
                $activity => CalendarTitlePatternType::PATTERN_ACTIVITY,
                $project => CalendarTitlePatternType::PATTERN_PROJECT,
                $department => CalendarTitlePatternType::PATTERN_DEPARTMENT,
                $description => CalendarTitlePatternType::PATTERN_DESCRIPTION,
                $duration => CalendarTitlePatternType::PATTERN_DURATION,
                $activity . self::SPACER . $description => CalendarTitlePatternType::PATTERN_ACTIVITY_DESCRIPTION,
                $project . self::SPACER . $description => CalendarTitlePatternType::PATTERN_PROJECT_DESCRIPTION,
                $department . self::SPACER . $description => CalendarTitlePatternType::PATTERN_DEPARTMENT_DESCRIPTION,
                $project . self::SPACER . $department => CalendarTitlePatternType::PATTERN_PROJECT_DEPARTMENT,
                $department . self::SPACER . $project => CalendarTitlePatternType::PATTERN_DEPARTMENT_PROJECT,
                $project . self::SPACER . $activity => CalendarTitlePatternType::PATTERN_PROJECT_ACTIVITY,
            ]
        ]);
    }

    public function getParent(): string
    {
        return ChoiceType::class;
    }
}
