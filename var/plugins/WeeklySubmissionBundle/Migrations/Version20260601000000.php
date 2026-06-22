<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260601000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create public_holidays table for WeeklySubmissionBundle';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE kimai2_public_holidays (
            id INT AUTO_INCREMENT NOT NULL,
            holiday_date DATE NOT NULL,
            name VARCHAR(255) NOT NULL,
            UNIQUE KEY UNIQ_HOLIDAY_DATE (holiday_date),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE kimai2_public_holidays');
    }
}
