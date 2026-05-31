<?php

declare(strict_types=1);

namespace KimaiPlugin\WeeklySubmissionBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260525000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create weekly_submissions table for WeeklySubmissionBundle';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE kimai2_weekly_submissions (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            approved_by INT,
            week_start DATE NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT "draft",
            submitted_at DATETIME,
            approved_at DATETIME,
            supervisor_notes LONGTEXT,
            total_duration INT NOT NULL DEFAULT 0,
            UNIQUE KEY UNIQ_USER_WEEK (user_id, week_start),
            CONSTRAINT FK_WEEKLY_SUB_USER FOREIGN KEY (user_id) REFERENCES kimai2_users (id) ON DELETE CASCADE,
            CONSTRAINT FK_WEEKLY_SUB_APPROVER FOREIGN KEY (approved_by) REFERENCES kimai2_users (id) ON DELETE SET NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE kimai2_weekly_submissions');
    }
}
