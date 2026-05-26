<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Invoice\Hydrator;

use App\Department\DepartmentStatisticService;
use App\Invoice\InvoiceModel;
use App\Invoice\InvoiceModelHydrator;
use Symfony\Component\Intl\Countries;

final class InvoiceModelDepartmentHydrator implements InvoiceModelHydrator
{
    use BudgetHydratorTrait;

    public function __construct(private readonly DepartmentStatisticService $departmentStatisticService)
    {
    }

    public function hydrate(InvoiceModel $model): array
    {
        $department = $model->getDepartment();

        $prefix = 'department.';
        $language = $model->getTemplate()->getLanguage();
        $country = $department->getCountry();

        $values = [
            $prefix . 'id' => $department->getId(),
            $prefix . 'address' => $department->getFormattedAddress() ?? '', // deprecated since 2.44
            $prefix . 'address_line1' => $department->getAddressLine1() ?? '',
            $prefix . 'address_line2' => $department->getAddressLine2() ?? '',
            $prefix . 'address_line3' => $department->getAddressLine3() ?? '',
            $prefix . 'postcode' => $department->getPostCode() ?? '',
            $prefix . 'city' => $department->getCity() ?? '',
            $prefix . 'name' => $department->getName() ?? '',
            $prefix . 'contact' => $department->getContact() ?? '',
            $prefix . 'company' => $department->getCompany() ?? '',
            $prefix . 'vat' => $department->getVatId() ?? '', // deprecated since 2.0.15
            $prefix . 'vat_id' => $department->getVatId() ?? '',
            $prefix . 'number' => $department->getNumber() ?? '',
            $prefix . 'country' => $country,
            $prefix . 'country_name' => $country !== null ? Countries::getName($country, $language) : null,
            $prefix . 'homepage' => $department->getHomepage() ?? '',
            $prefix . 'comment' => $department->getComment() ?? '',
            $prefix . 'email' => $department->getEmail() ?? '',
            $prefix . 'fax' => $department->getFax() ?? '',
            $prefix . 'phone' => $department->getPhone() ?? '',
            $prefix . 'mobile' => $department->getMobile() ?? '',
            $prefix . 'invoice_text' => $department->getInvoiceText() ?? '',
            $prefix . 'buyer_reference' => $department->getBuyerReference() ?? '',
        ];

        $end = $model->getQuery()?->getEnd();
        if ($end !== null) {
            $statistic = $this->departmentStatisticService->getBudgetStatisticModel($department, $end);

            $values = array_merge($values, $this->getBudgetValues($prefix, $statistic, $model));
        }

        foreach ($department->getMetaFields() as $metaField) {
            $values = array_merge($values, [
                $prefix . 'meta.' . $metaField->getName() => $metaField->getValue(),
            ]);
        }

        return $values;
    }
}
