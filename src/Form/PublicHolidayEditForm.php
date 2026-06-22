<?php

namespace App\Form;

use App\Entity\PublicHoliday;
use App\Form\Type\DatePickerType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PublicHolidayEditForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('holidayDate', DatePickerType::class, [
                'label' => 'Date',
                'attr' => [
                    'autofocus' => 'autofocus',
                ],
            ])
            ->add('name', TextType::class, [
                'label' => 'Holiday Name',
                'attr' => [
                    'maxlength' => 255,
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => PublicHoliday::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'public_holiday_edit',
        ]);
    }
}
