<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Export;

use App\Entity\Department;
use App\Entity\Project;
use App\Entity\User;
use App\Repository\Query\TimesheetQuery;
use App\Utils\FileHelper;

final class ExportFilename
{
    private ?string $filename = null;
    private ?Department $department = null;
    private ?Project $project = null;
    private ?User $user = null;

    public function __construct(TimesheetQuery $query)
    {
        $departments = $query->getDepartments();
        if (\count($departments) === 1) {
            $this->department = $departments[0];
        }

        $projects = $query->getProjects();
        if (\count($projects) === 1) {
            $this->project = $projects[0];
        }

        $users = $query->getUsers();
        if (\count($users) === 1) {
            $this->user = $users[0];
        }
    }

    private function getDepartmentName(Department $department): string
    {
        $company = $department->getCompany();
        if (empty($company)) {
            $company = $department->getName();
        }

        return $company;
    }

    private function convert(string $filename): string
    {
        return FileHelper::convertToAsciiFilename($filename);
    }

    public function getFilename(): string
    {
        if ($this->filename === null) {
            $filename = date('Ymd');
            $hasName = false;

            if ($this->department !== null) {
                $filename .= '-' . $this->convert($this->getDepartmentName($this->department));
                $hasName = true;
            }

            if ($this->project !== null) {
                if (!$hasName) {
                    $filename .= '-' . $this->convert($this->getDepartmentName($this->project->getDepartment()));
                }
                $filename .= '-' . $this->convert($this->project->getName());
                $hasName = true;
            }

            if ($this->user !== null) {
                $filename .= '-' . $this->convert($this->user->getDisplayName());
                $hasName = true;
            }

            if (!$hasName) {
                $filename .= '-kimai-export';
            }

            $filename = str_replace(['/', '\\'], '-', $filename);

            $this->filename = $filename;
        }

        return $this->filename;
    }

    public function __toString(): string
    {
        return $this->getFilename();
    }
}
