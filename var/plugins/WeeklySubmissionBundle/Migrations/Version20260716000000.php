<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260716000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add overtime fields to weekly submissions';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            ADD COLUMN is_overtime TINYINT(1) NOT NULL DEFAULT 0,
            ADD COLUMN overtime_hours INT NOT NULL DEFAULT 0,
            ADD COLUMN hr_approved_by INT DEFAULT NULL,
            ADD COLUMN hr_approved_at DATETIME(6) DEFAULT NULL,
            ADD COLUMN hr_notes TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            DROP COLUMN is_overtime,
            DROP COLUMN overtime_hours,
            DROP COLUMN hr_approved_by,
            DROP COLUMN hr_approved_at,
            DROP COLUMN hr_notes');
    }
}
