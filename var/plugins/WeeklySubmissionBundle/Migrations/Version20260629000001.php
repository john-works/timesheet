<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260629000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add original_supervisor column';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            ADD COLUMN original_supervisor INT DEFAULT NULL,
            ADD CONSTRAINT FK_WEEKLY_SUB_ORIG_SUPER FOREIGN KEY (original_supervisor) REFERENCES kimai2_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions DROP FOREIGN KEY FK_WEEKLY_SUB_ORIG_SUPER');
        $this->addSql('ALTER TABLE kimai2_weekly_submissions DROP COLUMN original_supervisor');
    }
}
