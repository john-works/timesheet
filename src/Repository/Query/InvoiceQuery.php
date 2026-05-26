<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

use App\Entity\Activity;
use App\Entity\Department;
use App\Entity\InvoiceTemplate;
use App\Entity\Project;

/**
 * Find items (e.g. timesheets) for creating a new invoice.
 */
class InvoiceQuery extends TimesheetQuery
{
    private ?InvoiceTemplate $template = null;
    private ?\DateTime $invoiceDate = null;
    private bool $allowTemplateOverwrite = true;

    public function __construct()
    {
        parent::__construct();
        $this->setDefaults([
            'order' => self::ORDER_ASC,
            'exported' => self::STATE_NOT_EXPORTED,
            'state' => self::STATE_STOPPED,
            'billable' => true,
            'invoiceDate' => null,
        ]);
    }

    public function getTemplate(): ?InvoiceTemplate
    {
        return $this->template;
    }

    public function setTemplate(InvoiceTemplate $template): InvoiceQuery
    {
        $this->template = $template;

        return $this;
    }

    /**
     * Helper method, because many templates access {{ model.query.department }} directly.
     *
     * @return Department|null
     */
    public function getDepartment(): ?Department
    {
        $departments = $this->getDepartments();
        if (\count($departments) === 1) {
            return $departments[0];
        }

        return null;
    }

    /**
     * Helper method, because many templates access {{ model.query.project }} directly.
     *
     * @return Project|null
     */
    public function getProject(): ?Project
    {
        $projects = $this->getProjects();
        if (\count($projects) === 1) {
            return $projects[0];
        }

        return null;
    }

    /**
     * Helper method, because many templates access {{ model.query.activity }} directly.
     *
     * @return Activity|null
     */
    public function getActivity(): ?Activity
    {
        $activities = $this->getActivities();
        if (\count($activities) === 1) {
            return $activities[0];
        }

        return null;
    }

    public function getInvoiceDate(): ?\DateTime
    {
        return $this->invoiceDate;
    }

    public function setInvoiceDate(?\DateTime $invoiceDate): void
    {
        $this->invoiceDate = $invoiceDate;
    }

    public function isAllowTemplateOverwrite(): bool
    {
        return $this->allowTemplateOverwrite;
    }

    public function setAllowTemplateOverwrite(bool $allowTemplateOverwrite): void
    {
        $this->allowTemplateOverwrite = $allowTemplateOverwrite;
    }
}
