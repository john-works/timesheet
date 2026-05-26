<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\DataFixtures;

use App\Entity\Department;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

/**
 * Defines the sample data to load in during controller tests.
 * @implements TestFixture<Department>
 */
final class DepartmentFixtures implements TestFixture
{
    private int $amount = 0;
    private ?bool $isVisible = null;
    /**
     * @var callable
     */
    private $callback;

    public function __construct(int $amount = 0)
    {
        $this->amount = $amount;
    }

    /**
     * Will be called prior to persisting the object.
     *
     * @param callable $callback
     */
    public function setCallback(callable $callback): DepartmentFixtures
    {
        $this->callback = $callback;

        return $this;
    }

    public function getAmount(): int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): DepartmentFixtures
    {
        $this->amount = $amount;

        return $this;
    }

    public function setIsVisible(bool $visible): DepartmentFixtures
    {
        $this->isVisible = $visible;

        return $this;
    }

    /**
     * @return Department[]
     */
    public function load(ObjectManager $manager): array
    {
        $created = [];

        $faker = Factory::create();

        for ($i = 0; $i < $this->amount; $i++) {
            $visible = 0 != $i % 3;
            if (null !== $this->isVisible) {
                $visible = $this->isVisible;
            }
            $department = new Department($faker->company() . ($visible ? '' : ' (x)'));
            $department->setCurrency($faker->currencyCode());
            $department->setAddress($faker->address());
            $department->setEmail($faker->safeEmail());
            $department->setComment($faker->text());
            $department->setNumber('C-' . $faker->ean8());
            $department->setCountry($faker->countryCode());
            $department->setTimezone($faker->timezone());
            $department->setVisible($visible);

            if (null !== $this->callback) {
                \call_user_func($this->callback, $department);
            }
            $manager->persist($department);
            $created[] = $department;
        }

        $manager->flush();

        return $created;
    }
}
