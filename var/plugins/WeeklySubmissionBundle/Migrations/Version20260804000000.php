<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260804000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add workflow_type column to users for explicit single/2-step workflow control';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE kimai2_users ADD COLUMN workflow_type VARCHAR(20) DEFAULT NULL");
        $this->addSql("UPDATE kimai2_users SET workflow_type = 'two-step' WHERE step2_approver_id IS NOT NULL");
        $this->addSql("UPDATE kimai2_users SET workflow_type = 'single' WHERE step2_approver_id IS NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_users DROP COLUMN workflow_type');
    }
}
