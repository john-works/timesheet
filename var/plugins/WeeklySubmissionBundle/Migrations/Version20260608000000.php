<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add manager approval fields and department director';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            ADD COLUMN manager_approved_by INT DEFAULT NULL,
            ADD COLUMN manager_approved_at DATETIME DEFAULT NULL,
            ADD COLUMN manager_notes LONGTEXT DEFAULT NULL,
            ADD CONSTRAINT FK_WEEKLY_SUB_MGR_APPR FOREIGN KEY (manager_approved_by) REFERENCES kimai2_users (id) ON DELETE SET NULL');

        $this->addSql('ALTER TABLE kimai2_departments
            ADD COLUMN director_id INT DEFAULT NULL,
            ADD CONSTRAINT FK_DEPT_DIRECTOR FOREIGN KEY (director_id) REFERENCES kimai2_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            DROP FOREIGN KEY FK_WEEKLY_SUB_MGR_APPR,
            DROP COLUMN manager_approved_by,
            DROP COLUMN manager_approved_at,
            DROP COLUMN manager_notes');

        $this->addSql('ALTER TABLE kimai2_departments
            DROP FOREIGN KEY FK_DEPT_DIRECTOR,
            DROP COLUMN director_id');
    }
}
