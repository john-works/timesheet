<?php

namespace App\Form\Type;

use App\Form\Model\TaskRow;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

final class TaskRowType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('task', TextareaType::class, [
            'label' => 'Activity Details',
            'required' => false,
            'attr' => [
                'rows' => 1,
                'placeholder' => 'e.g. Working on report, attending meeting, ...',
            ],
        ]);

        $builder->add('status', ChoiceType::class, [
            'label' => 'Status',
            'required' => false,
            'choices' => [
                'In Progress' => 'In Progress',
                'Completed' => 'Completed',
                'Pending' => 'Pending',
            ],
            'placeholder' => '',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => TaskRow::class,
        ]);
    }
}
