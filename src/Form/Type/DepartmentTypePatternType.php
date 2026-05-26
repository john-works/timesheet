<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form\Type;

use App\Form\DataTransformer\StringToArrayTransformer;
use App\Form\Helper\DepartmentHelper;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\ReversedTransformer;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Select the pattern that will be used when rendering a custom select.
 */
final class DepartmentTypePatternType extends AbstractType
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addModelTransformer(new ReversedTransformer(new StringToArrayTransformer(DepartmentHelper::PATTERN_SPACER)), true);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $name = $this->translator->trans('name');
        $company = $this->translator->trans('company');
        $number = $this->translator->trans('number');
        $comment = $this->translator->trans('description');

        $resolver->setDefaults([
            'label' => 'choice_pattern',
            'multiple' => true,
            'choices' => [
                $number => DepartmentHelper::PATTERN_NUMBER,
                $name => DepartmentHelper::PATTERN_NAME,
                $company => DepartmentHelper::PATTERN_COMPANY,
                $comment => DepartmentHelper::PATTERN_COMMENT,
            ]
        ]);
    }

    public function getParent(): string
    {
        return ChoiceType::class;
    }
}
