<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260722000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Manager HR approval fields to weekly submissions for overtime';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            ADD COLUMN manager_hr_approved_by INT DEFAULT NULL,
            ADD COLUMN manager_hr_approved_at DATETIME DEFAULT NULL,
            ADD COLUMN manager_hr_notes TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            DROP COLUMN manager_hr_approved_by,
            DROP COLUMN manager_hr_approved_at,
            DROP COLUMN manager_hr_notes');
    }
}
