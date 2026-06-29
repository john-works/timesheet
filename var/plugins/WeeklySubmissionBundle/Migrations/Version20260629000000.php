<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260629000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add reassigned_to column for temporary submission reassignment';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions
            ADD COLUMN reassigned_to INT DEFAULT NULL,
            ADD CONSTRAINT FK_WEEKLY_SUB_REASSIGNED FOREIGN KEY (reassigned_to) REFERENCES kimai2_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_weekly_submissions DROP FOREIGN KEY FK_WEEKLY_SUB_REASSIGNED');
        $this->addSql('ALTER TABLE kimai2_weekly_submissions DROP COLUMN reassigned_to');
    }
}
