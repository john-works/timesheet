<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

use App\Entity\Department;
use App\Entity\Invoice;
use App\Form\Model\DateRange;

/**
 * Query for created invoices.
 */
class InvoiceArchiveQuery extends BaseQuery implements DateRangeInterface
{
    use DateRangeTrait;

    public const INVOICE_ARCHIVE_ORDER_ALLOWED = [
        'date', 'invoice.number', 'status', 'total_rate'
        // TODO other fields have a problem with translation
        // , 'tax', 'payed'
    ];

    /**
     * Filter for invoice status (by default all)
     * @var string[]
     */
    private array $status = [];
    /**
     * @var Department[]
     */
    private array $departments = [];

    public function __construct()
    {
        $this->setDefaults([
            'orderBy' => 'date',
            'order' => self::ORDER_DESC,
            'dateRange' => new DateRange(),
            'departments' => [],
            'status' => [],
        ]);
    }

    public function addDepartment(Department $department): void
    {
        $this->departments[] = $department;
    }

    public function setDepartments(array $departments): void
    {
        foreach ($departments as $department) {
            $this->addDepartment($department);
        }
    }

    /**
     * @return Department[]
     */
    public function getDepartments(): array
    {
        return $this->departments;
    }

    public function hasDepartments(): bool
    {
        return !empty($this->departments);
    }

    public function hasStatus(): bool
    {
        return !empty($this->status);
    }

    public function getStatus(): array
    {
        return $this->status;
    }

    /**
     * @param string[] $status
     */
    public function setStatus(array $status): void
    {
        foreach ($status as $s) {
            $this->addStatus($s);
        }
    }

    public function addStatus(string $status): void
    {
        if (!\in_array($status, [Invoice::STATUS_NEW, Invoice::STATUS_PENDING, Invoice::STATUS_PAID, Invoice::STATUS_CANCELED])) {
            throw new \InvalidArgumentException('Unknown invoice status given.');
        }

        if (!\in_array($status, $this->status)) {
            $this->status[] = $status;
        }
    }
}
