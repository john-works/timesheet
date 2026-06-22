<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use App\Doctrine\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20260616000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create public_holidays table';
    }

    public function up(Schema $schema): void
    {
        if ($schema->hasTable('kimai2_public_holidays')) {
            return;
        }

        $table = $schema->createTable('kimai2_public_holidays');
        $table->addColumn('id', 'integer', ['autoincrement' => true, 'unsigned' => true]);
        $table->addColumn('day', 'date', ['notnull' => true]);
        $table->addColumn('name', 'string', ['length' => 255, 'notnull' => true]);
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['day']);
    }

    public function down(Schema $schema): void
    {
        if (!$schema->hasTable('kimai2_public_holidays')) {
            return;
        }

        $schema->dropTable('kimai2_public_holidays');
    }
}
