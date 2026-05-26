<?php

declare(strict_types=1);

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace DoctrineMigrations;

use App\Doctrine\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Types\Types;

/**
 * @version 1.15
 */
final class Version20210727104955 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Allows arbitrary length of meta columns';
    }

    public function up(Schema $schema): void
    {
        $activitiesMeta = $schema->getTable('kimai2_activities_meta');
        $activitiesMeta->getColumn('value')->setLength(65535)->setType(Type::getType(Types::TEXT));

        $departmentsMeta = $schema->getTable('kimai2_departments_meta');
        $departmentsMeta->getColumn('value')->setLength(65535)->setType(Type::getType(Types::TEXT));

        $projectsMeta = $schema->getTable('kimai2_projects_meta');
        $projectsMeta->getColumn('value')->setLength(65535)->setType(Type::getType(Types::TEXT));

        $timesheetMeta = $schema->getTable('kimai2_timesheet_meta');
        $timesheetMeta->getColumn('value')->setLength(65535)->setType(Type::getType(Types::TEXT));
    }

    public function down(Schema $schema): void
    {
        $activitiesMeta = $schema->getTable('kimai2_activities_meta');
        $activitiesMeta->getColumn('value')->setLength(255)->setType(Type::getType(Types::STRING));

        $departmentsMeta = $schema->getTable('kimai2_departments_meta');
        $departmentsMeta->getColumn('value')->setLength(255)->setType(Type::getType(Types::STRING));

        $projectsMeta = $schema->getTable('kimai2_projects_meta');
        $projectsMeta->getColumn('value')->setLength(255)->setType(Type::getType(Types::STRING));

        $timesheetMeta = $schema->getTable('kimai2_timesheet_meta');
        $timesheetMeta->getColumn('value')->setLength(255)->setType(Type::getType(Types::STRING));
    }
}
