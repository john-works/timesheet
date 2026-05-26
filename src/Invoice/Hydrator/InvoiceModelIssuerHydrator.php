<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Invoice\Hydrator;

use App\Invoice\InvoiceModel;
use App\Invoice\InvoiceModelHydrator;
use Symfony\Component\Intl\Countries;

final class InvoiceModelIssuerHydrator implements InvoiceModelHydrator
{
    /**
     * @return array<string, mixed>
     */
    public function hydrate(InvoiceModel $model): array
    {
        $department = $model->getTemplate()->getDepartment();
        if (null === $department) {
            return [];
        }

        $prefix = 'issuer.';
        $language = $model->getTemplate()->getLanguage();
        $country = $department->getCountry();

        $values = [
            $prefix . 'id' => $department->getId(),
            $prefix . 'address' => $department->getFormattedAddress() ?? '',
            $prefix . 'address_line1' => $department->getAddressLine1() ?? '',
            $prefix . 'address_line2' => $department->getAddressLine2() ?? '',
            $prefix . 'address_line3' => $department->getAddressLine3() ?? '',
            $prefix . 'postcode' => $department->getPostCode() ?? '',
            $prefix . 'city' => $department->getCity() ?? '',
            $prefix . 'name' => $department->getName() ?? '',
            $prefix . 'contact' => $department->getContact() ?? '',
            $prefix . 'company' => $department->getCompany() ?? '',
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

        foreach ($department->getMetaFields() as $metaField) {
            $values = array_merge($values, [
                $prefix . 'meta.' . $metaField->getName() => $metaField->getValue(),
            ]);
        }

        return $values;
    }
}
