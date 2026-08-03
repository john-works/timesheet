<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260803000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add step2_approver_id column to users for the configured Step 2 approver';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE kimai2_users ADD COLUMN step2_approver_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE kimai2_users ADD CONSTRAINT FK_USERS_STEP2_APPROVER FOREIGN KEY (step2_approver_id) REFERENCES kimai2_users (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_USERS_STEP2_APPROVER ON kimai2_users (step2_approver_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_USERS_STEP2_APPROVER ON kimai2_users');
        $this->addSql('ALTER TABLE kimai2_users DROP FOREIGN KEY FK_USERS_STEP2_APPROVER');
        $this->addSql('ALTER TABLE kimai2_users DROP COLUMN step2_approver_id');
    }
}
