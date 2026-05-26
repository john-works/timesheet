<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository\Query;

class DepartmentQuery extends BaseQuery implements VisibilityInterface
{
    use VisibilityTrait;

    public const DEPARTMENT_ORDER_ALLOWED = [
        'name',
        'description' => 'comment',
        'country',
        'number',
        'homepage',
        'email',
        'mobile',
        'fax',
        'phone',
        'currency',
        'contact',
        'company',
        'vat_id',
        'budget',
        'timeBudget',
        'visible'
    ];

    private ?string $country = null;
    /**
     * @var array<int>
     */
    private array $departmentIds = [];
    /**
     * @var array<DepartmentQueryHydrate>
     */
    private array $hydrate = [];

    public function __construct()
    {
        $this->setDefaults([
            'orderBy' => 'name',
            'visibility' => VisibilityInterface::SHOW_VISIBLE,
            'country' => null,
            'departmentIds' => [],
        ]);
    }

    protected function copyFrom(BaseQuery $query): void
    {
        parent::copyFrom($query);

        if ($query instanceof DepartmentQuery) {
            $this->setDepartmentIds($query->getDepartmentIds());
            $this->setCountry($query->getCountry());
            foreach ($query->getHydrate() as $hydrate) {
                $this->addHydrate($hydrate);
            }
        }
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): void
    {
        $this->country = $country;
    }

    /**
     * @param array<int> $ids
     */
    public function setDepartmentIds(array $ids): void
    {
        $this->departmentIds = $ids;
    }

    /**
     * @return int[]
     */
    public function getDepartmentIds(): array
    {
        return $this->departmentIds;
    }

    private function addHydrate(DepartmentQueryHydrate $hydrate): void
    {
        if (!\in_array($hydrate, $this->hydrate, true)) {
            $this->hydrate[] = $hydrate;
        }
    }

    /**
     * @return DepartmentQueryHydrate[]
     */
    public function getHydrate(): array
    {
        return $this->hydrate;
    }

    public function loadTeams(): void
    {
        $this->addHydrate(DepartmentQueryHydrate::TEAMS);
    }
}
