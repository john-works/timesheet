<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Invoice\Hydrator;

use App\Department\DepartmentStatisticService;
use App\Invoice\Hydrator\InvoiceModelDepartmentHydrator;
use App\Tests\Invoice\Renderer\RendererTestTrait;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(InvoiceModelDepartmentHydrator::class)]
class InvoiceModelDepartmentHydratorTest extends TestCase
{
    use RendererTestTrait;

    public function testHydrate(): void
    {
        $model = $this->getInvoiceModel();

        $sut = new InvoiceModelDepartmentHydrator($this->createMock(DepartmentStatisticService::class));

        $result = $sut->hydrate($model);
        $this->assertModelStructure($result);

        $result = $sut->hydrate($model);

        $this->assertModelStructure($result);

        self::assertEquals([
            'department.id' => null,
            'department.address' => "Foo\nStreet\n1111 City",
            'department.address_line1' => '',
            'department.address_line2' => '',
            'department.address_line3' => '',
            'department.buyer_reference' => '',
            'department.city' => '',
            'department.postcode' => '',
            'department.name' => 'department,with/special#name',
            'department.contact' => '',
            'department.company' => '',
            'department.vat' => '',
            'department.vat_id' => '',
            'department.number' => '',
            'department.country' => 'AT',
            'department.country_name' => 'Austria',
            'department.homepage' => '',
            'department.comment' => '',
            'department.email' => '',
            'department.fax' => '',
            'department.phone' => '',
            'department.mobile' => '',
            'department.invoice_text' => '',
            'department.budget_open' => '€0.00',
            'department.budget_open_plain' => 0.0,
            'department.time_budget_open' => '0.00',
            'department.time_budget_open_plain' => 0,
            'department.meta.foo-department' => 'bar-department',
        ], $result);
    }

    protected function assertModelStructure(array $model): void
    {
        $keys = [
            'department.id',
            'department.address',
            'department.address_line1',
            'department.address_line2',
            'department.address_line3',
            'department.buyer_reference',
            'department.city',
            'department.postcode',
            'department.name',
            'department.contact',
            'department.company',
            'department.vat',
            'department.vat_id',
            'department.country',
            'department.country_name',
            'department.number',
            'department.homepage',
            'department.comment',
            'department.email',
            'department.fax',
            'department.phone',
            'department.mobile',
            'department.meta.foo-department',
            'department.budget_open',
            'department.budget_open_plain',
            'department.time_budget_open',
            'department.time_budget_open_plain',
            'department.invoice_text',
        ];

        $givenKeys = array_keys($model);
        sort($keys);
        sort($givenKeys);

        self::assertEquals($keys, $givenKeys);
    }
}
