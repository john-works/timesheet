<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Timesheet\Calculator;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\Project;
use App\Entity\Timesheet;
use App\Timesheet\Calculator\BillableCalculator;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

#[CoversClass(BillableCalculator::class)]
class BillableCalculatorTest extends TestCase
{
    #[DataProvider('getTestData')]
    public function testCalculate(bool $billable, string $mode, bool $expected, ?Department $department, ?Project $project, ?Activity $activity): void
    {
        $sut = new BillableCalculator();

        $timesheet = new Timesheet();
        if ($project !== null) {
            $project = clone $project;
            if ($department !== null) {
                $department = clone $department;
                $project->setDepartment($department);
            }
            $timesheet->setProject($project);
        }
        if ($activity !== null) {
            $timesheet->setActivity(clone $activity);
        }
        $timesheet->setBillable($billable);
        $timesheet->setBillableMode($mode);
        $sut->calculate($timesheet, []);
        self::assertEquals($mode, $timesheet->getBillableMode());
        self::assertEquals($expected, $timesheet->isBillable());
    }

    public static function getTestData()
    {
        $departmentYes = new Department('foo');
        $departmentYes->setBillable(true);

        $departmentNo = new Department('foo');
        $departmentNo->setBillable(false);

        $projectYes = new Project();
        $projectYes->setBillable(true);

        $projectNo = new Project();
        $projectNo->setBillable(false);

        $activityYes = new Activity();
        $activityYes->setBillable(true);

        $activityNo = new Activity();
        $activityNo->setBillable(false);

        return [
            0 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   null, null, null],
            1 => [false, Timesheet::BILLABLE_DEFAULT,    false,  null, null, null],
            2 => [true,  Timesheet::BILLABLE_NO,         false,  null, null, null],
            3 => [false, Timesheet::BILLABLE_NO,         false,  null, null, null],
            4 => [true,  Timesheet::BILLABLE_YES,        true,   null, null, null],
            5 => [false, Timesheet::BILLABLE_YES,        true,   null, null, null],
            6 => [true,  Timesheet::BILLABLE_AUTOMATIC,  true,   null, null, null],
            7 => [false, Timesheet::BILLABLE_AUTOMATIC,  true,   null, null, null],
            8 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentYes, $projectYes, $activityYes],
            9 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentYes, $projectYes, $activityYes],
            10 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectYes, $activityYes],
            11 => [false, Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectYes, $activityYes],
            12 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectYes, $activityYes],
            13 => [false, Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectYes, $activityYes],
            14 => [true,  Timesheet::BILLABLE_AUTOMATIC,  true,   $departmentYes, $projectYes, $activityYes],
            15 => [false, Timesheet::BILLABLE_AUTOMATIC,  true,   $departmentYes, $projectYes, $activityYes],
            16 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentNo, $projectNo, $activityNo],
            17 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentNo, $projectNo, $activityNo],
            18 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectNo, $activityNo],
            19 => [false, Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectNo, $activityNo],
            20 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectNo, $activityNo],
            21 => [false, Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectNo, $activityNo],
            22 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentNo, $projectNo, $activityNo],
            23 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentNo, $projectNo, $activityNo],
            24 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentNo, $projectYes, $activityNo],
            25 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentNo, $projectYes, $activityNo],
            26 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectYes, $activityNo],
            27 => [false, Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectYes, $activityNo],
            28 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectYes, $activityNo],
            29 => [false, Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectYes, $activityNo],
            30 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentNo, $projectYes, $activityNo],
            31 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentNo, $projectYes, $activityNo],
            32 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentNo, $projectNo, $activityYes],
            33 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentNo, $projectNo, $activityYes],
            34 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectNo, $activityYes],
            35 => [false, Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectNo, $activityYes],
            36 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectNo, $activityYes],
            37 => [false, Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectNo, $activityYes],
            38 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentNo, $projectNo, $activityYes],
            39 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentNo, $projectNo, $activityYes],
            40 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentYes, $projectNo, $activityNo],
            41 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentYes, $projectNo, $activityNo],
            42 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectNo, $activityNo],
            43 => [false, Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectNo, $activityNo],
            44 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectNo, $activityNo],
            45 => [false, Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectNo, $activityNo],
            46 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentYes, $projectNo, $activityNo],
            47 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentYes, $projectNo, $activityNo],
            48 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentYes, $projectNo, $activityYes],
            49 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentYes, $projectNo, $activityYes],
            50 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectNo, $activityYes],
            51 => [false, Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectNo, $activityYes],
            52 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectNo, $activityYes],
            53 => [false, Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectNo, $activityYes],
            54 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentYes, $projectNo, $activityYes],
            55 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentYes, $projectNo, $activityYes],
            56 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentYes, $projectYes, $activityNo],
            57 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentYes, $projectYes, $activityNo],
            58 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectYes, $activityNo],
            59 => [false, Timesheet::BILLABLE_NO,         false,  $departmentYes, $projectYes, $activityNo],
            60 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectYes, $activityNo],
            61 => [false, Timesheet::BILLABLE_YES,        true,   $departmentYes, $projectYes, $activityNo],
            62 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentYes, $projectYes, $activityNo],
            63 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentYes, $projectYes, $activityNo],
            64 => [true,  Timesheet::BILLABLE_DEFAULT,    true,   $departmentNo, $projectYes, $activityYes],
            65 => [false, Timesheet::BILLABLE_DEFAULT,    false,  $departmentNo, $projectYes, $activityYes],
            66 => [true,  Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectYes, $activityYes],
            67 => [false, Timesheet::BILLABLE_NO,         false,  $departmentNo, $projectYes, $activityYes],
            68 => [true,  Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectYes, $activityYes],
            69 => [false, Timesheet::BILLABLE_YES,        true,   $departmentNo, $projectYes, $activityYes],
            70 => [true,  Timesheet::BILLABLE_AUTOMATIC,  false,   $departmentNo, $projectYes, $activityYes],
            71 => [false, Timesheet::BILLABLE_AUTOMATIC,  false,  $departmentNo, $projectYes, $activityYes],
        ];
    }
}
