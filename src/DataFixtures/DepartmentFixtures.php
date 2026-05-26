<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\DataFixtures;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Faker\Generator;

/**
 * Defines the sample data to load in the database when running the unit and
 * functional tests or while development.
 *
 * Execute this command to load the data:
 * bin/console doctrine:fixtures:load
 *
 * @codeCoverageIgnore
 */
final class DepartmentFixtures extends Fixture
{
    public const MIN_DEPARTMENTS = 5;
    public const MAX_DEPARTMENTS = 15;
    public const MIN_BUDGET = 0;
    public const MAX_BUDGET = 100000;
    public const MIN_TIME_BUDGET = 0;
    public const MAX_TIME_BUDGET = 10000000;
    public const MIN_GLOBAL_ACTIVITIES = 5;
    public const MAX_GLOBAL_ACTIVITIES = 30;
    public const MIN_PROJECTS_PER_DEPARTMENT = 2;
    public const MAX_PROJECTS_PER_DEPARTMENT = 25;
    public const MIN_ACTIVITIES_PER_PROJECT = 0;
    public const MAX_ACTIVITIES_PER_PROJECT = 25;

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('en_US');

        $amountDepartments = rand(self::MIN_DEPARTMENTS, self::MAX_DEPARTMENTS);
        for ($c = 1; $c <= $amountDepartments; $c++) {
            $visibleDepartment = 0 !== $c % 5;
            $department = $this->createDepartment($faker, $visibleDepartment);
            $manager->persist($department);

            $projectForDepartment = rand(self::MIN_PROJECTS_PER_DEPARTMENT, self::MAX_PROJECTS_PER_DEPARTMENT);
            for ($p = 1; $p <= $projectForDepartment; $p++) {
                $visibleProject = 0 !== $p % 7;
                $project = $this->createProject($faker, $department, $visibleProject);
                $manager->persist($project);

                $activityForProject = rand(self::MIN_ACTIVITIES_PER_PROJECT, self::MAX_ACTIVITIES_PER_PROJECT);
                for ($a = 1; $a <= $activityForProject; $a++) {
                    $visibleActivity = 0 !== $a % 6;
                    $activity = $this->createActivity($faker, $project, $visibleActivity);
                    $manager->persist($activity);
                }
            }

            $manager->flush();
            $manager->clear();
        }

        $amountGlobalActivities = rand(self::MIN_GLOBAL_ACTIVITIES, self::MAX_GLOBAL_ACTIVITIES);
        for ($c = 1; $c <= $amountGlobalActivities; $c++) {
            $visibleActivity = 0 !== $c % 4;
            $activity = $this->createActivity($faker, null, $visibleActivity);
            $manager->persist($activity);
        }

        $manager->flush();
        $manager->clear();
    }

    private function createDepartment(Generator $faker, bool $visible): Department
    {
        $entry = new Department($faker->company());
        $entry->setCurrency($faker->currencyCode());
        $entry->setAddress($faker->address());
        $entry->setEmail($faker->safeEmail());
        $entry->setComment($faker->realText());
        $entry->setNumber('C-' . $faker->ean8());
        $entry->setCountry($faker->countryCode());
        $entry->setTimezone($faker->timezone());
        $entry->setVisible($visible);
        $entry->setVatId($faker->creditCardNumber());
        $entry->setPostCode($faker->postcode());
        $entry->setCity($faker->city());
        $entry->setAddressLine1($faker->streetAddress());
        $entry->setAddressLine2($faker->streetAddress());

        if (rand(0, 3) % 3) {
            $entry->setBudget(rand(self::MIN_BUDGET, self::MAX_BUDGET));
        }

        if (rand(0, 3) % 3) {
            $entry->setTimeBudget(rand(self::MIN_TIME_BUDGET, self::MAX_TIME_BUDGET));
        }

        return $entry;
    }

    private function createProject(Generator $faker, Department $department, bool $visible): Project
    {
        $entry = new Project();

        $entry->setName(ucfirst($faker->catchPhrase()));
        $entry->setComment($faker->realText());
        $entry->setDepartment($department);
        $entry->setOrderNumber('P-' . $faker->ean8());
        $entry->setVisible($visible);

        if (rand(0, 3) % 3) {
            $entry->setBudget(rand(self::MIN_BUDGET, self::MAX_BUDGET));
        }

        if (rand(0, 3) % 3) {
            $entry->setTimeBudget(rand(self::MIN_TIME_BUDGET, self::MAX_TIME_BUDGET));
        }

        return $entry;
    }

    private function createActivity(Generator $faker, ?Project $project, bool $visible): Activity
    {
        $entry = new Activity();
        $entry->setName(ucfirst($faker->bs()));
        $entry->setProject($project);
        $entry->setComment($faker->realText());
        $entry->setVisible($visible);

        if (rand(0, 3) % 3) {
            $entry->setBudget(rand(self::MIN_BUDGET, self::MAX_BUDGET));
        }

        if (rand(0, 3) % 3) {
            $entry->setTimeBudget(rand(self::MIN_TIME_BUDGET, self::MAX_TIME_BUDGET));
        }

        return $entry;
    }
}
