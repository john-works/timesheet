/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: timesheet_new
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `kimai2_access_token`
--

DROP TABLE IF EXISTS `kimai2_access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_access_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `last_usage` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `expires_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_6FB0DB1E5F37A13B` (`token`),
  KEY `IDX_6FB0DB1EA76ED395` (`user_id`),
  CONSTRAINT `FK_6FB0DB1EA76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_access_token`
--

LOCK TABLES `kimai2_access_token` WRITE;
/*!40000 ALTER TABLE `kimai2_access_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_access_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_activities`
--

DROP TABLE IF EXISTS `kimai2_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `comment` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `time_budget` int(11) NOT NULL DEFAULT 0,
  `budget` double NOT NULL DEFAULT 0,
  `budget_type` varchar(10) DEFAULT NULL,
  `billable` tinyint(1) NOT NULL DEFAULT 1,
  `invoice_text` longtext DEFAULT NULL,
  `number` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  PRIMARY KEY (`id`),
  KEY `IDX_8811FE1C166D1F9C` (`project_id`),
  KEY `IDX_8811FE1C7AB0E859166D1F9C` (`visible`,`project_id`),
  KEY `IDX_8811FE1C7AB0E859166D1F9C5E237E06` (`visible`,`project_id`,`name`),
  KEY `IDX_8811FE1C7AB0E8595E237E06` (`visible`,`name`),
  CONSTRAINT `FK_8811FE1C166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=683 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_activities`
--

LOCK TABLES `kimai2_activities` WRITE;
/*!40000 ALTER TABLE `kimai2_activities` DISABLE KEYS */;
INSERT INTO `kimai2_activities` VALUES
(679,NULL,'Leave','Leave',1,'#ff0000',0,0,NULL,1,NULL,'0003','2026-06-03 12:58:03'),
(680,NULL,'Normal Work','Normal Work',1,'#008000',0,0,NULL,1,NULL,'0001','2026-06-03 12:59:03'),
(682,NULL,'Public Holiday',NULL,1,NULL,0,0,NULL,1,NULL,NULL,'2026-06-16 08:40:15');
/*!40000 ALTER TABLE `kimai2_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_activities_meta`
--

DROP TABLE IF EXISTS `kimai2_activities_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_activities_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_A7C0A43D81C060965E237E06` (`activity_id`,`name`),
  KEY `IDX_A7C0A43D81C06096` (`activity_id`),
  CONSTRAINT `FK_A7C0A43D81C06096` FOREIGN KEY (`activity_id`) REFERENCES `kimai2_activities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_activities_meta`
--

LOCK TABLES `kimai2_activities_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_activities_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_activities_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_activities_rates`
--

DROP TABLE IF EXISTS `kimai2_activities_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_activities_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `activity_id` int(11) DEFAULT NULL,
  `rate` double NOT NULL,
  `fixed` tinyint(1) NOT NULL,
  `internal_rate` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_4A7F11BEA76ED39581C06096` (`user_id`,`activity_id`),
  KEY `IDX_4A7F11BEA76ED395` (`user_id`),
  KEY `IDX_4A7F11BE81C06096` (`activity_id`),
  CONSTRAINT `FK_4A7F11BE81C06096` FOREIGN KEY (`activity_id`) REFERENCES `kimai2_activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_4A7F11BEA76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_activities_rates`
--

LOCK TABLES `kimai2_activities_rates` WRITE;
/*!40000 ALTER TABLE `kimai2_activities_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_activities_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_activities_teams`
--

DROP TABLE IF EXISTS `kimai2_activities_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_activities_teams` (
  `activity_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  PRIMARY KEY (`activity_id`,`team_id`),
  KEY `IDX_986998DA81C06096` (`activity_id`),
  KEY `IDX_986998DA296CD8AE` (`team_id`),
  CONSTRAINT `FK_986998DA296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `kimai2_teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_986998DA81C06096` FOREIGN KEY (`activity_id`) REFERENCES `kimai2_activities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_activities_teams`
--

LOCK TABLES `kimai2_activities_teams` WRITE;
/*!40000 ALTER TABLE `kimai2_activities_teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_activities_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_bookmarks`
--

DROP TABLE IF EXISTS `kimai2_bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_bookmarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `content` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_4016EF25A76ED3955E237E06` (`user_id`,`name`),
  KEY `IDX_4016EF25A76ED395` (`user_id`),
  CONSTRAINT `FK_4016EF25A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_bookmarks`
--

LOCK TABLES `kimai2_bookmarks` WRITE;
/*!40000 ALTER TABLE `kimai2_bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_configuration`
--

DROP TABLE IF EXISTS `kimai2_configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1C5D63D85E237E06` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_configuration`
--

LOCK TABLES `kimai2_configuration` WRITE;
/*!40000 ALTER TABLE `kimai2_configuration` DISABLE KEYS */;
INSERT INTO `kimai2_configuration` VALUES
(1,'defaults.department.timezone','Africa/Kampala'),
(2,'defaults.department.country','UG'),
(3,'department.choice_pattern','{name}'),
(4,'department.number_format','{cc,4}'),
(5,'department.rules.allow_duplicate_number','0'),
(6,'timesheet.default_begin','08:00');
/*!40000 ALTER TABLE `kimai2_configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_departments`
--

DROP TABLE IF EXISTS `kimai2_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `number` varchar(50) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `country` varchar(2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `fax` varchar(30) DEFAULT NULL,
  `mobile` varchar(30) DEFAULT NULL,
  `email` varchar(75) DEFAULT NULL,
  `homepage` varchar(100) DEFAULT NULL,
  `timezone` varchar(64) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `time_budget` int(11) NOT NULL DEFAULT 0,
  `budget` double NOT NULL DEFAULT 0,
  `vat_id` varchar(50) DEFAULT NULL,
  `budget_type` varchar(10) DEFAULT NULL,
  `billable` tinyint(1) NOT NULL DEFAULT 1,
  `invoice_template_id` int(11) DEFAULT NULL,
  `invoice_text` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `address_line1` varchar(150) DEFAULT NULL,
  `address_line2` varchar(150) DEFAULT NULL,
  `address_line3` varchar(150) DEFAULT NULL,
  `postcode` varchar(20) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `buyer_reference` varchar(50) DEFAULT NULL,
  `director_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_5A9760447AB0E859` (`visible`),
  KEY `IDX_5A97604412946D8B` (`invoice_template_id`),
  KEY `FK_DEPT_DIRECTOR` (`director_id`),
  CONSTRAINT `FK_5A97604412946D8B` FOREIGN KEY (`invoice_template_id`) REFERENCES `kimai2_invoice_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_DEPT_DIRECTOR` FOREIGN KEY (`director_id`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_departments`
--

LOCK TABLES `kimai2_departments` WRITE;
/*!40000 ALTER TABLE `kimai2_departments` DISABLE KEYS */;
INSERT INTO `kimai2_departments` VALUES
(57,'Strategy  And Planning',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,144),
(58,'Performance Monitoring Central Government',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,99),
(60,'Performance Monitoring Regional Offices',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,218),
(61,'Executive Director\'s Office',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,243),
(62,'Procurement and Disposal Capacity Building',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,135),
(63,'Human Resources and Administration',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,225),
(64,'Risk and Audit',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,171),
(65,'Legal and Board Affairs',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,201),
(66,'Finance',NULL,NULL,1,'Public Procurement and Disposal of Public Assets Authority',NULL,NULL,'UG','EUR',NULL,NULL,NULL,NULL,NULL,'Africa/Kampala',NULL,0,0,NULL,NULL,1,NULL,NULL,'2026-06-03 12:38:25',NULL,NULL,NULL,NULL,NULL,NULL,137);
/*!40000 ALTER TABLE `kimai2_departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_departments_comments`
--

DROP TABLE IF EXISTS `kimai2_departments_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_departments_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `created_by_id` int(11) NOT NULL,
  `message` longtext NOT NULL,
  `created_at` datetime NOT NULL,
  `pinned` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_A5B142D99395C3F3` (`department_id`),
  KEY `IDX_3CA9544DB03A8386` (`created_by_id`),
  CONSTRAINT `FK_A5B142D99395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_A5B142D9B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_departments_comments`
--

LOCK TABLES `kimai2_departments_comments` WRITE;
/*!40000 ALTER TABLE `kimai2_departments_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_departments_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_departments_meta`
--

DROP TABLE IF EXISTS `kimai2_departments_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_departments_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_A48A760F9395C3F35E237E06` (`department_id`,`name`),
  KEY `IDX_A48A760F9395C3F3` (`department_id`),
  CONSTRAINT `FK_A48A760F9395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_departments_meta`
--

LOCK TABLES `kimai2_departments_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_departments_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_departments_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_departments_rates`
--

DROP TABLE IF EXISTS `kimai2_departments_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_departments_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `rate` double NOT NULL,
  `fixed` tinyint(1) NOT NULL,
  `internal_rate` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_82AB0AECA76ED3959395C3F3` (`user_id`,`department_id`),
  KEY `IDX_CE4AA843A76ED395` (`user_id`),
  KEY `IDX_CE4AA843AE80F5DF` (`department_id`),
  CONSTRAINT `FK_82AB0AEC9395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_82AB0AECA76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_departments_rates`
--

LOCK TABLES `kimai2_departments_rates` WRITE;
/*!40000 ALTER TABLE `kimai2_departments_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_departments_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_departments_teams`
--

DROP TABLE IF EXISTS `kimai2_departments_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_departments_teams` (
  `department_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  PRIMARY KEY (`department_id`,`team_id`),
  KEY `IDX_1C5C2127AE80F5DF` (`department_id`),
  KEY `IDX_1C5C2127296CD8AE` (`team_id`),
  CONSTRAINT `FK_50BD8388296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `kimai2_teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_50BD83889395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_departments_teams`
--

LOCK TABLES `kimai2_departments_teams` WRITE;
/*!40000 ALTER TABLE `kimai2_departments_teams` DISABLE KEYS */;
INSERT INTO `kimai2_departments_teams` VALUES
(57,110),
(57,118),
(57,124),
(57,126),
(58,111),
(58,140),
(58,141),
(60,113),
(60,114),
(60,115),
(60,122),
(60,152),
(61,136),
(61,137),
(61,155),
(62,120),
(63,134),
(63,135),
(64,127),
(65,119),
(66,138),
(66,139),
(66,156),
(66,157);
/*!40000 ALTER TABLE `kimai2_departments_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_export_templates`
--

DROP TABLE IF EXISTS `kimai2_export_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_export_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `renderer` varchar(20) NOT NULL,
  `language` varchar(6) DEFAULT NULL,
  `columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`columns`)),
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`options`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_2F0CA26F2B36786B` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_export_templates`
--

LOCK TABLES `kimai2_export_templates` WRITE;
/*!40000 ALTER TABLE `kimai2_export_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_export_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_invoice_templates`
--

DROP TABLE IF EXISTS `kimai2_invoice_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_invoice_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `due_days` int(11) NOT NULL,
  `vat` double DEFAULT 0,
  `calculator` varchar(20) NOT NULL,
  `number_generator` varchar(20) NOT NULL,
  `renderer` varchar(20) NOT NULL,
  `payment_terms` text DEFAULT NULL,
  `vat_id` varchar(50) DEFAULT NULL,
  `contact` longtext DEFAULT NULL,
  `payment_details` longtext DEFAULT NULL,
  `language` varchar(6) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1626CFE95E237E06` (`name`),
  KEY `IDX_1626CFE99395C3F3` (`department_id`),
  CONSTRAINT `FK_1626CFE99395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_invoice_templates`
--

LOCK TABLES `kimai2_invoice_templates` WRITE;
/*!40000 ALTER TABLE `kimai2_invoice_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_invoice_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_invoice_templates_meta`
--

DROP TABLE IF EXISTS `kimai2_invoice_templates_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_invoice_templates_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_A165B0555DA0FB85E237E06` (`template_id`,`name`),
  KEY `IDX_A165B0555DA0FB8` (`template_id`),
  CONSTRAINT `FK_A165B0555DA0FB8` FOREIGN KEY (`template_id`) REFERENCES `kimai2_invoice_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_invoice_templates_meta`
--

LOCK TABLES `kimai2_invoice_templates_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_invoice_templates_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_invoice_templates_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_invoices`
--

DROP TABLE IF EXISTS `kimai2_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `timezone` varchar(64) NOT NULL,
  `total` double NOT NULL,
  `tax` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `status` varchar(20) NOT NULL,
  `due_days` int(11) NOT NULL,
  `vat` double NOT NULL,
  `invoice_filename` varchar(150) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_76C38E372DA68207` (`invoice_number`),
  UNIQUE KEY `UNIQ_76C38E372323B33D` (`invoice_filename`),
  KEY `IDX_76C38E37A76ED395` (`user_id`),
  KEY `IDX_76C38E37AE80F5DF` (`department_id`),
  CONSTRAINT `FK_76C38E379395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_76C38E37A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_invoices`
--

LOCK TABLES `kimai2_invoices` WRITE;
/*!40000 ALTER TABLE `kimai2_invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_invoices_meta`
--

DROP TABLE IF EXISTS `kimai2_invoices_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_invoices_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_7EDC37D92989F1FD5E237E06` (`invoice_id`,`name`),
  KEY `IDX_7EDC37D92989F1FD` (`invoice_id`),
  CONSTRAINT `FK_7EDC37D92989F1FD` FOREIGN KEY (`invoice_id`) REFERENCES `kimai2_invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_invoices_meta`
--

LOCK TABLES `kimai2_invoices_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_invoices_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_invoices_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_projects`
--

DROP TABLE IF EXISTS `kimai2_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `order_number` tinytext DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `budget` double NOT NULL DEFAULT 0,
  `color` varchar(7) DEFAULT NULL,
  `time_budget` int(11) NOT NULL DEFAULT 0,
  `order_date` datetime DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  `timezone` varchar(64) DEFAULT NULL,
  `budget_type` varchar(10) DEFAULT NULL,
  `billable` tinyint(1) NOT NULL DEFAULT 1,
  `invoice_text` longtext DEFAULT NULL,
  `global_activities` tinyint(1) NOT NULL DEFAULT 1,
  `number` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  PRIMARY KEY (`id`),
  KEY `IDX_407F12069395C3F3` (`department_id`),
  KEY `IDX_407F12069395C3F37AB0E8595E237E06` (`department_id`,`visible`,`name`),
  KEY `IDX_407F12069395C3F37AB0E859BF396750` (`department_id`,`visible`,`id`),
  CONSTRAINT `FK_407F12069395C3F3` FOREIGN KEY (`department_id`) REFERENCES `kimai2_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_projects`
--

LOCK TABLES `kimai2_projects` WRITE;
/*!40000 ALTER TABLE `kimai2_projects` DISABLE KEYS */;
INSERT INTO `kimai2_projects` VALUES
(53,57,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(54,58,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(55,60,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(56,61,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(57,62,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(58,63,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(59,64,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(60,65,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL),
(61,66,'PPDA',NULL,NULL,1,0,NULL,0,NULL,NULL,NULL,NULL,NULL,1,NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `kimai2_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_projects_comments`
--

DROP TABLE IF EXISTS `kimai2_projects_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_projects_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `created_by_id` int(11) NOT NULL,
  `message` longtext NOT NULL,
  `created_at` datetime NOT NULL,
  `pinned` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_29A23638166D1F9C` (`project_id`),
  KEY `IDX_29A23638B03A8386` (`created_by_id`),
  CONSTRAINT `FK_29A23638166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_29A23638B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_projects_comments`
--

LOCK TABLES `kimai2_projects_comments` WRITE;
/*!40000 ALTER TABLE `kimai2_projects_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_projects_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_projects_meta`
--

DROP TABLE IF EXISTS `kimai2_projects_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_projects_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_50536EF2166D1F9C5E237E06` (`project_id`,`name`),
  KEY `IDX_50536EF2166D1F9C` (`project_id`),
  CONSTRAINT `FK_50536EF2166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_projects_meta`
--

LOCK TABLES `kimai2_projects_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_projects_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_projects_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_projects_rates`
--

DROP TABLE IF EXISTS `kimai2_projects_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_projects_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `rate` double NOT NULL,
  `fixed` tinyint(1) NOT NULL,
  `internal_rate` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_41535D55A76ED395166D1F9C` (`user_id`,`project_id`),
  KEY `IDX_41535D55A76ED395` (`user_id`),
  KEY `IDX_41535D55166D1F9C` (`project_id`),
  CONSTRAINT `FK_41535D55166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_41535D55A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_projects_rates`
--

LOCK TABLES `kimai2_projects_rates` WRITE;
/*!40000 ALTER TABLE `kimai2_projects_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_projects_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_projects_teams`
--

DROP TABLE IF EXISTS `kimai2_projects_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_projects_teams` (
  `project_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  PRIMARY KEY (`project_id`,`team_id`),
  KEY `IDX_9345D431166D1F9C` (`project_id`),
  KEY `IDX_9345D431296CD8AE` (`team_id`),
  CONSTRAINT `FK_9345D431166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_9345D431296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `kimai2_teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_projects_teams`
--

LOCK TABLES `kimai2_projects_teams` WRITE;
/*!40000 ALTER TABLE `kimai2_projects_teams` DISABLE KEYS */;
INSERT INTO `kimai2_projects_teams` VALUES
(53,110),
(53,118),
(53,124),
(53,126),
(54,111),
(55,113),
(55,114),
(55,115),
(55,122),
(56,136),
(56,137),
(57,120),
(58,134),
(58,135),
(59,127),
(60,119),
(61,138),
(61,139);
/*!40000 ALTER TABLE `kimai2_projects_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_public_holidays`
--

DROP TABLE IF EXISTS `kimai2_public_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_public_holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_HOLIDAY_DATE` (`holiday_date`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_public_holidays`
--

LOCK TABLES `kimai2_public_holidays` WRITE;
/*!40000 ALTER TABLE `kimai2_public_holidays` DISABLE KEYS */;
INSERT INTO `kimai2_public_holidays` VALUES
(1,'2026-01-01','New Year\'s Day'),
(2,'2026-01-26','NRM Liberation Day'),
(3,'2026-02-16','Archbishop Janani Luwum Day'),
(4,'2026-03-08','International Women\'s Day'),
(5,'2026-05-01','Labour Day'),
(6,'2026-06-03','Martyrs\' Day'),
(7,'2026-06-09','National Heroes Day'),
(8,'2026-10-09','Independence Day'),
(9,'2026-12-25','Christmas Day'),
(10,'2026-12-26','Boxing Day'),
(11,'2026-04-03','Good Friday'),
(12,'2026-04-06','Easter Monday'),
(13,'2027-01-01','New Year\'s Day'),
(14,'2027-01-26','NRM Liberation Day'),
(15,'2027-02-16','Archbishop Janani Luwum Day'),
(16,'2027-03-08','International Women\'s Day'),
(17,'2027-05-01','Labour Day'),
(18,'2027-06-03','Martyrs\' Day'),
(19,'2027-06-09','National Heroes Day'),
(20,'2027-10-09','Independence Day'),
(21,'2027-12-25','Christmas Day'),
(22,'2027-12-26','Boxing Day'),
(23,'2027-03-26','Good Friday'),
(24,'2027-03-29','Easter Monday'),
(25,'2028-01-01','New Year\'s Day'),
(26,'2028-01-26','NRM Liberation Day'),
(27,'2028-02-16','Archbishop Janani Luwum Day'),
(28,'2028-03-08','International Women\'s Day'),
(29,'2028-05-01','Labour Day'),
(30,'2028-06-03','Martyrs\' Day'),
(31,'2028-06-09','National Heroes Day'),
(32,'2028-10-09','Independence Day'),
(33,'2028-12-25','Christmas Day'),
(34,'2028-12-26','Boxing Day'),
(35,'2028-04-14','Good Friday'),
(36,'2028-04-17','Easter Monday'),
(37,'2029-01-01','New Year\'s Day'),
(38,'2029-01-26','NRM Liberation Day'),
(39,'2029-02-16','Archbishop Janani Luwum Day'),
(40,'2029-03-08','International Women\'s Day'),
(41,'2029-05-01','Labour Day'),
(42,'2029-06-03','Martyrs\' Day'),
(43,'2029-06-09','National Heroes Day'),
(44,'2029-10-09','Independence Day'),
(45,'2029-12-25','Christmas Day'),
(46,'2029-12-26','Boxing Day'),
(47,'2029-03-30','Good Friday'),
(48,'2029-04-02','Easter Monday'),
(49,'2030-01-01','New Year\'s Day'),
(50,'2030-01-26','NRM Liberation Day'),
(51,'2030-02-16','Archbishop Janani Luwum Day'),
(52,'2030-03-08','International Women\'s Day'),
(53,'2030-05-01','Labour Day'),
(54,'2030-06-03','Martyrs\' Day'),
(55,'2030-06-09','National Heroes Day'),
(56,'2030-10-09','Independence Day'),
(57,'2030-12-25','Christmas Day'),
(58,'2030-12-26','Boxing Day'),
(59,'2030-04-19','Good Friday'),
(60,'2030-04-22','Easter Monday'),
(61,'2031-01-01','New Year\'s Day'),
(62,'2031-01-26','NRM Liberation Day'),
(63,'2031-02-16','Archbishop Janani Luwum Day'),
(64,'2031-03-08','International Women\'s Day'),
(65,'2031-05-01','Labour Day'),
(66,'2031-06-03','Martyrs\' Day'),
(67,'2031-06-09','National Heroes Day'),
(68,'2031-10-09','Independence Day'),
(69,'2031-12-25','Christmas Day'),
(70,'2031-12-26','Boxing Day'),
(71,'2031-04-11','Good Friday'),
(72,'2031-04-14','Easter Monday'),
(73,'2032-01-01','New Year\'s Day'),
(74,'2032-01-26','NRM Liberation Day'),
(75,'2032-02-16','Archbishop Janani Luwum Day'),
(76,'2032-03-08','International Women\'s Day'),
(77,'2032-05-01','Labour Day'),
(78,'2032-06-03','Martyrs\' Day'),
(79,'2032-06-09','National Heroes Day'),
(80,'2032-10-09','Independence Day'),
(81,'2032-12-25','Christmas Day'),
(82,'2032-12-26','Boxing Day'),
(83,'2032-03-26','Good Friday'),
(84,'2032-03-29','Easter Monday'),
(85,'2033-01-01','New Year\'s Day'),
(86,'2033-01-26','NRM Liberation Day'),
(87,'2033-02-16','Archbishop Janani Luwum Day'),
(88,'2033-03-08','International Women\'s Day'),
(89,'2033-05-01','Labour Day'),
(90,'2033-06-03','Martyrs\' Day'),
(91,'2033-06-09','National Heroes Day'),
(92,'2033-10-09','Independence Day'),
(93,'2033-12-25','Christmas Day'),
(94,'2033-12-26','Boxing Day'),
(95,'2033-04-15','Good Friday'),
(96,'2033-04-18','Easter Monday'),
(97,'2034-01-01','New Year\'s Day'),
(98,'2034-01-26','NRM Liberation Day'),
(99,'2034-02-16','Archbishop Janani Luwum Day'),
(100,'2034-03-08','International Women\'s Day'),
(101,'2034-05-01','Labour Day'),
(102,'2034-06-03','Martyrs\' Day'),
(103,'2034-06-09','National Heroes Day'),
(104,'2034-10-09','Independence Day'),
(105,'2034-12-25','Christmas Day'),
(106,'2034-12-26','Boxing Day'),
(107,'2034-04-07','Good Friday'),
(108,'2034-04-10','Easter Monday'),
(109,'2035-01-01','New Year\'s Day'),
(110,'2035-01-26','NRM Liberation Day'),
(111,'2035-02-16','Archbishop Janani Luwum Day'),
(112,'2035-03-08','International Women\'s Day'),
(113,'2035-05-01','Labour Day'),
(114,'2035-06-03','Martyrs\' Day'),
(115,'2035-06-09','National Heroes Day'),
(116,'2035-10-09','Independence Day'),
(117,'2035-12-25','Christmas Day'),
(118,'2035-12-26','Boxing Day'),
(119,'2035-03-23','Good Friday'),
(120,'2035-03-26','Easter Monday'),
(121,'2036-01-01','New Year\'s Day'),
(122,'2036-01-26','NRM Liberation Day'),
(123,'2036-02-16','Archbishop Janani Luwum Day'),
(124,'2036-03-08','International Women\'s Day'),
(125,'2036-05-01','Labour Day'),
(126,'2036-06-03','Martyrs\' Day'),
(127,'2036-06-09','National Heroes Day'),
(128,'2036-10-09','Independence Day'),
(129,'2036-12-25','Christmas Day'),
(130,'2036-12-26','Boxing Day'),
(131,'2036-04-11','Good Friday'),
(132,'2036-04-14','Easter Monday'),
(133,'2037-01-01','New Year\'s Day'),
(134,'2037-01-26','NRM Liberation Day'),
(135,'2037-02-16','Archbishop Janani Luwum Day'),
(136,'2037-03-08','International Women\'s Day'),
(137,'2037-05-01','Labour Day'),
(138,'2037-06-03','Martyrs\' Day'),
(139,'2037-06-09','National Heroes Day'),
(140,'2037-10-09','Independence Day'),
(141,'2037-12-25','Christmas Day'),
(142,'2037-12-26','Boxing Day'),
(143,'2037-04-03','Good Friday'),
(144,'2037-04-06','Easter Monday'),
(145,'2038-01-01','New Year\'s Day'),
(146,'2038-01-26','NRM Liberation Day'),
(147,'2038-02-16','Archbishop Janani Luwum Day'),
(148,'2038-03-08','International Women\'s Day'),
(149,'2038-05-01','Labour Day'),
(150,'2038-06-03','Martyrs\' Day'),
(151,'2038-06-09','National Heroes Day'),
(152,'2038-10-09','Independence Day'),
(153,'2038-12-25','Christmas Day'),
(154,'2038-12-26','Boxing Day'),
(155,'2038-04-23','Good Friday'),
(156,'2038-04-26','Easter Monday'),
(157,'2039-01-01','New Year\'s Day'),
(158,'2039-01-26','NRM Liberation Day'),
(159,'2039-02-16','Archbishop Janani Luwum Day'),
(160,'2039-03-08','International Women\'s Day'),
(161,'2039-05-01','Labour Day'),
(162,'2039-06-03','Martyrs\' Day'),
(163,'2039-06-09','National Heroes Day'),
(164,'2039-10-09','Independence Day'),
(165,'2039-12-25','Christmas Day'),
(166,'2039-12-26','Boxing Day'),
(167,'2039-04-08','Good Friday'),
(168,'2039-04-11','Easter Monday'),
(169,'2040-01-01','New Year\'s Day'),
(170,'2040-01-26','NRM Liberation Day'),
(171,'2040-02-16','Archbishop Janani Luwum Day'),
(172,'2040-03-08','International Women\'s Day'),
(173,'2040-05-01','Labour Day'),
(174,'2040-06-03','Martyrs\' Day'),
(175,'2040-06-09','National Heroes Day'),
(176,'2040-10-09','Independence Day'),
(177,'2040-12-25','Christmas Day'),
(178,'2040-12-26','Boxing Day'),
(179,'2040-03-30','Good Friday'),
(180,'2040-04-02','Easter Monday'),
(181,'2041-01-01','New Year\'s Day'),
(182,'2041-01-26','NRM Liberation Day'),
(183,'2041-02-16','Archbishop Janani Luwum Day'),
(184,'2041-03-08','International Women\'s Day'),
(185,'2041-05-01','Labour Day'),
(186,'2041-06-03','Martyrs\' Day'),
(187,'2041-06-09','National Heroes Day'),
(188,'2041-10-09','Independence Day'),
(189,'2041-12-25','Christmas Day'),
(190,'2041-12-26','Boxing Day'),
(191,'2041-04-19','Good Friday'),
(192,'2041-04-22','Easter Monday'),
(193,'2042-01-01','New Year\'s Day'),
(194,'2042-01-26','NRM Liberation Day'),
(195,'2042-02-16','Archbishop Janani Luwum Day'),
(196,'2042-03-08','International Women\'s Day'),
(197,'2042-05-01','Labour Day'),
(198,'2042-06-03','Martyrs\' Day'),
(199,'2042-06-09','National Heroes Day'),
(200,'2042-10-09','Independence Day'),
(201,'2042-12-25','Christmas Day'),
(202,'2042-12-26','Boxing Day'),
(203,'2042-04-04','Good Friday'),
(204,'2042-04-07','Easter Monday'),
(205,'2043-01-01','New Year\'s Day'),
(206,'2043-01-26','NRM Liberation Day'),
(207,'2043-02-16','Archbishop Janani Luwum Day'),
(208,'2043-03-08','International Women\'s Day'),
(209,'2043-05-01','Labour Day'),
(210,'2043-06-03','Martyrs\' Day'),
(211,'2043-06-09','National Heroes Day'),
(212,'2043-10-09','Independence Day'),
(213,'2043-12-25','Christmas Day'),
(214,'2043-12-26','Boxing Day'),
(215,'2043-03-27','Good Friday'),
(216,'2043-03-30','Easter Monday'),
(217,'2044-01-01','New Year\'s Day'),
(218,'2044-01-26','NRM Liberation Day'),
(219,'2044-02-16','Archbishop Janani Luwum Day'),
(220,'2044-03-08','International Women\'s Day'),
(221,'2044-05-01','Labour Day'),
(222,'2044-06-03','Martyrs\' Day'),
(223,'2044-06-09','National Heroes Day'),
(224,'2044-10-09','Independence Day'),
(225,'2044-12-25','Christmas Day'),
(226,'2044-12-26','Boxing Day'),
(227,'2044-04-15','Good Friday'),
(228,'2044-04-18','Easter Monday'),
(229,'2045-01-01','New Year\'s Day'),
(230,'2045-01-26','NRM Liberation Day'),
(231,'2045-02-16','Archbishop Janani Luwum Day'),
(232,'2045-03-08','International Women\'s Day'),
(233,'2045-05-01','Labour Day'),
(234,'2045-06-03','Martyrs\' Day'),
(235,'2045-06-09','National Heroes Day'),
(236,'2045-10-09','Independence Day'),
(237,'2045-12-25','Christmas Day'),
(238,'2045-12-26','Boxing Day'),
(239,'2045-04-07','Good Friday'),
(240,'2045-04-10','Easter Monday');
/*!40000 ALTER TABLE `kimai2_public_holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_roles`
--

DROP TABLE IF EXISTS `kimai2_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_roles`
--

LOCK TABLES `kimai2_roles` WRITE;
/*!40000 ALTER TABLE `kimai2_roles` DISABLE KEYS */;
INSERT INTO `kimai2_roles` VALUES
(3,'ROLE_ADMIN'),
(5,'ROLE_DIRECTOR'),
(4,'ROLE_SUPER_ADMIN'),
(2,'ROLE_TEAMLEAD'),
(1,'ROLE_USER');
/*!40000 ALTER TABLE `kimai2_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_roles_permissions`
--

DROP TABLE IF EXISTS `kimai2_roles_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_roles_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission` varchar(50) NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permission` (`role_id`,`permission`),
  KEY `IDX_D263A3B8D60322AC` (`role_id`),
  CONSTRAINT `FK_D263A3B8D60322AC` FOREIGN KEY (`role_id`) REFERENCES `kimai2_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_roles_permissions`
--

LOCK TABLES `kimai2_roles_permissions` WRITE;
/*!40000 ALTER TABLE `kimai2_roles_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_roles_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_sessions`
--

DROP TABLE IF EXISTS `kimai2_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_sessions` (
  `id` varchar(128) NOT NULL,
  `data` blob NOT NULL,
  `time` int(10) unsigned NOT NULL,
  `lifetime` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_sessions`
--

LOCK TABLES `kimai2_sessions` WRITE;
/*!40000 ALTER TABLE `kimai2_sessions` DISABLE KEYS */;
INSERT INTO `kimai2_sessions` VALUES
('4midi7cp8i1s1m6llq2m3vvb08','_sf2_attributes|a:3:{s:12:\"_csrf/search\";s:43:\"JuyeINXlOyX_UWVfRPHYaeWb9heIdmEuCxUSzCwhtt8\";s:22:\"_csrf/datatable_update\";s:43:\"Sj3LQgfWorjcry9Aefik9Fxe5OYnM2i4p2O3BK9mEJw\";s:22:\"_security_secured_area\";s:464:\"O:68:\"Symfony\\Component\\Security\\Core\\Authentication\\Token\\RememberMeToken\":3:{i:0;s:31:\"change_this_to_something_unique\";i:1;s:12:\"secured_area\";i:2;a:5:{i:0;O:15:\"App\\Entity\\User\":5:{s:2:\"id\";i:144;s:8:\"username\";s:19:\"mnsereko@ppda.go.ug\";s:7:\"enabled\";b:1;s:5:\"email\";s:19:\"mnsereko@ppda.go.ug\";s:8:\"password\";s:60:\"$2y$13$8PPdNmEoqZfMkLBW664xOOBPqqGjkjxHQ0RRv.G4hy3Jf3Zc0ugsi\";}i:1;b:1;i:2;N;i:3;a:0:{}i:4;a:2:{i:0;s:13:\"ROLE_DIRECTOR\";i:1;s:9:\"ROLE_USER\";}}}\";}_sf2_meta|a:3:{s:1:\"u\";i:1785163366;s:1:\"c\";i:1785163366;s:1:\"l\";i:0;}',1785163378,1785164818),
('51rr4tllvk8bgjbvflrmv9fp31','_sf2_attributes|a:3:{s:12:\"_csrf/search\";s:43:\"_y4S7Gi91neBaU1wf9zvuvZO5EMzBBIDWUAz3IgsANU\";s:22:\"_csrf/datatable_update\";s:43:\"Y7h899-b74GdS42p4EGa9MWTPW028oHZRfeZacshbn0\";s:22:\"_security_secured_area\";s:464:\"O:68:\"Symfony\\Component\\Security\\Core\\Authentication\\Token\\RememberMeToken\":3:{i:0;s:31:\"change_this_to_something_unique\";i:1;s:12:\"secured_area\";i:2;a:5:{i:0;O:15:\"App\\Entity\\User\":5:{s:2:\"id\";i:144;s:8:\"username\";s:19:\"mnsereko@ppda.go.ug\";s:7:\"enabled\";b:1;s:5:\"email\";s:19:\"mnsereko@ppda.go.ug\";s:8:\"password\";s:60:\"$2y$13$8PPdNmEoqZfMkLBW664xOOBPqqGjkjxHQ0RRv.G4hy3Jf3Zc0ugsi\";}i:1;b:1;i:2;N;i:3;a:0:{}i:4;a:2:{i:0;s:13:\"ROLE_DIRECTOR\";i:1;s:9:\"ROLE_USER\";}}}\";}_sf2_meta|a:3:{s:1:\"u\";i:1785163758;s:1:\"c\";i:1785163375;s:1:\"l\";i:0;}',1785163758,1785165198),
('lj9bdgbu2t605j4opg1207830q','_sf2_attributes|a:4:{s:23:\"_security.last_username\";s:19:\"mnsereko@ppda.go.ug\";s:22:\"_security_secured_area\";s:433:\"O:74:\"Symfony\\Component\\Security\\Core\\Authentication\\Token\\UsernamePasswordToken\":3:{i:0;N;i:1;s:12:\"secured_area\";i:2;a:5:{i:0;O:15:\"App\\Entity\\User\":5:{s:2:\"id\";i:144;s:8:\"username\";s:19:\"mnsereko@ppda.go.ug\";s:7:\"enabled\";b:1;s:5:\"email\";s:19:\"mnsereko@ppda.go.ug\";s:8:\"password\";s:60:\"$2y$13$8PPdNmEoqZfMkLBW664xOOBPqqGjkjxHQ0RRv.G4hy3Jf3Zc0ugsi\";}i:1;b:1;i:2;N;i:3;a:0:{}i:4;a:2:{i:0;s:13:\"ROLE_DIRECTOR\";i:1;s:9:\"ROLE_USER\";}}}\";s:12:\"_csrf/search\";s:43:\"mmadce8PTx85perw4b_d25kqUgRqKtaZouraiesJvOE\";s:22:\"_csrf/datatable_update\";s:43:\"PqfzSSlqMm90FRgroZIjeluxKLpCkPa_LhhXX-2M2To\";}_sf2_meta|a:3:{s:1:\"u\";i:1784794547;s:1:\"c\";i:1784792888;s:1:\"l\";i:0;}',1784794547,1784795987);
/*!40000 ALTER TABLE `kimai2_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_tags`
--

DROP TABLE IF EXISTS `kimai2_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_27CAF54C5E237E06` (`name`),
  KEY `IDX_27CAF54C7AB0E859` (`visible`)
) ENGINE=InnoDB AUTO_INCREMENT=927 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_tags`
--

LOCK TABLES `kimai2_tags` WRITE;
/*!40000 ALTER TABLE `kimai2_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_teams`
--

DROP TABLE IF EXISTS `kimai2_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_3BEDDC7F5E237E06` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_teams`
--

LOCK TABLES `kimai2_teams` WRITE;
/*!40000 ALTER TABLE `kimai2_teams` DISABLE KEYS */;
INSERT INTO `kimai2_teams` VALUES
(110,'ICT Unit (Strategy)',NULL),
(111,'Perfomance Monitoring - Central (Performance Monitoring Central Government)',NULL),
(113,'Mbarara Regional Office (Performance Monitoring Regional Offices)',NULL),
(114,'Central Regional Office (Performance Monitoring Regional Offices)',NULL),
(115,'Gulu Regional Office (Performance Monitoring Regional Offices)',NULL),
(118,'Planning (Strategy)',NULL),
(119,'Legal and Board Affairs (Legal and Board Affairs)',NULL),
(120,'Procurment Capacity Building (Procurement and Disposal Capacity Building)',NULL),
(122,'Mbale Regional Office (Performance Monitoring Regional Offices)',NULL),
(124,'Resource Mobilisation (Strategy)',NULL),
(126,'Research (Strategy)',NULL),
(127,'Internal Audit (Risk and Audit)',NULL),
(134,'Human Resources Unit',NULL),
(135,'Administration (HR) Unit',NULL),
(136,'Corporate and Public Affairs',NULL),
(137,'ROP',NULL),
(138,'Finance Unit',NULL),
(139,'Procurement',NULL),
(140,'Compliance Unit',NULL),
(141,'Performance Monitoring Audit  (Businge)',NULL),
(152,'Hoima Regional Office (Performance Monitoring Regional Offices)',NULL),
(154,'ICT Unit (Strategy Planning And Monitoring)',NULL),
(155,'ED Office (Executive Director\'s Office)',NULL),
(156,'Finance (Finance)',NULL),
(157,'Perfomance Monitoring - Central (Finance)',NULL);
/*!40000 ALTER TABLE `kimai2_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_timesheet`
--

DROP TABLE IF EXISTS `kimai2_timesheet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_timesheet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `rate` double NOT NULL,
  `fixed_rate` double DEFAULT NULL,
  `hourly_rate` double DEFAULT NULL,
  `exported` tinyint(1) NOT NULL DEFAULT 0,
  `timezone` varchar(64) NOT NULL,
  `internal_rate` double DEFAULT NULL,
  `billable` tinyint(1) DEFAULT 1,
  `category` varchar(10) NOT NULL DEFAULT 'work',
  `modified_at` datetime DEFAULT NULL,
  `date_tz` date NOT NULL,
  `break` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_4F60C6B18D93D649` (`user`),
  KEY `IDX_4F60C6B181C06096` (`activity_id`),
  KEY `IDX_4F60C6B1166D1F9C` (`project_id`),
  KEY `IDX_4F60C6B18D93D649502DF587` (`user`,`start_time`),
  KEY `IDX_4F60C6B1502DF587` (`start_time`),
  KEY `IDX_4F60C6B1502DF58741561401` (`start_time`,`end_time`),
  KEY `IDX_4F60C6B1502DF587415614018D93D649` (`start_time`,`end_time`,`user`),
  KEY `IDX_4F60C6B1BDF467148D93D649` (`date_tz`,`user`),
  KEY `IDX_4F60C6B1415614018D93D649` (`end_time`,`user`),
  KEY `IDX_TIMESHEET_TICKTAC` (`end_time`,`user`,`start_time`),
  KEY `IDX_TIMESHEET_RECENT_ACTIVITIES` (`user`,`project_id`,`activity_id`),
  KEY `IDX_TIMESHEET_RESULT_STATS` (`user`,`id`,`duration`),
  CONSTRAINT `FK_4F60C6B1166D1F9C` FOREIGN KEY (`project_id`) REFERENCES `kimai2_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_4F60C6B181C06096` FOREIGN KEY (`activity_id`) REFERENCES `kimai2_activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_4F60C6B18D93D649` FOREIGN KEY (`user`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_timesheet`
--

LOCK TABLES `kimai2_timesheet` WRITE;
/*!40000 ALTER TABLE `kimai2_timesheet` DISABLE KEYS */;
INSERT INTO `kimai2_timesheet` VALUES
(1,186,679,53,'2026-07-13 05:00:00','2026-07-13 14:00:00',28800,'Maternity Leave - Single Birth',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:20:53','2026-07-13',3600),
(2,186,680,53,'2026-07-14 05:00:00','2026-07-14 19:15:00',47700,'[{\"task\":\"testing2\",\"status\":\"In Progress\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 17:33:04','2026-07-14',3600),
(3,186,679,53,'2026-07-15 05:00:00','2026-07-15 14:00:00',28800,'Maternity Leave - Single Birth',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:20:53','2026-07-15',3600),
(4,186,679,53,'2026-07-16 05:00:00','2026-07-16 14:00:00',28800,'Maternity Leave - Single Birth',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:20:53','2026-07-16',3600),
(5,186,679,53,'2026-07-17 05:00:00','2026-07-17 14:00:00',28800,'Maternity Leave - Single Birth',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:20:53','2026-07-17',3600),
(6,186,680,53,'2026-07-20 05:00:00','2026-07-20 14:00:00',28800,'[{\"task\":\"testing2\",\"status\":\"In Progress\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:21:07','2026-07-20',3600),
(7,186,680,53,'2026-07-21 05:00:00','2026-07-21 14:00:00',28800,'[{\"task\":\"testing 4\",\"status\":\"Completed\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:21:19','2026-07-21',3600),
(8,186,680,53,'2026-07-22 05:00:00','2026-07-22 14:00:00',28800,'[{\"task\":\"testing\",\"status\":\"In Progress\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-22 16:21:30','2026-07-22',3600),
(13,231,680,53,'2026-07-23 05:00:00','2026-07-23 20:30:00',52200,'[{\"task\":\"testing2\",\"status\":\"Completed\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 06:04:06','2026-07-23',3600),
(14,231,680,53,'2026-07-22 05:00:00','2026-07-22 20:30:00',52200,'[{\"task\":\"testing 4\",\"status\":\"In Progress\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 06:04:25','2026-07-22',3600),
(15,231,680,53,'2026-07-21 05:00:00','2026-07-21 20:30:00',52200,'[{\"task\":\"rrr\",\"status\":\"Pending\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 06:05:03','2026-07-21',3600),
(16,231,680,53,'2026-07-20 05:00:00','2026-07-20 20:30:00',52200,'[{\"task\":\"test\",\"status\":\"Completed\"}]',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 06:05:25','2026-07-20',3600),
(53,271,679,53,'2026-07-24 05:00:00','2026-07-24 14:00:00',28800,'Study Leave - With Pay',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 07:03:42','2026-07-24',3600),
(54,271,679,53,'2026-07-27 05:00:00','2026-07-27 14:00:00',28800,'Study Leave - With Pay',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 07:03:42','2026-07-27',3600),
(55,271,679,53,'2026-07-28 05:00:00','2026-07-28 14:00:00',28800,'Study Leave - With Pay',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 07:03:42','2026-07-28',3600),
(56,271,679,53,'2026-07-29 05:00:00','2026-07-29 14:00:00',28800,'Study Leave - With Pay',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 07:03:42','2026-07-29',3600),
(57,271,679,53,'2026-07-30 05:00:00','2026-07-30 14:00:00',28800,'Study Leave - With Pay',0,NULL,0,0,'Africa/Kampala',0,1,'work','2026-07-23 07:03:42','2026-07-30',3600);
/*!40000 ALTER TABLE `kimai2_timesheet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_timesheet_meta`
--

DROP TABLE IF EXISTS `kimai2_timesheet_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_timesheet_meta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timesheet_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_CB606CBAABDD46BE5E237E06` (`timesheet_id`,`name`),
  KEY `IDX_CB606CBAABDD46BE` (`timesheet_id`),
  CONSTRAINT `FK_CB606CBAABDD46BE` FOREIGN KEY (`timesheet_id`) REFERENCES `kimai2_timesheet` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_timesheet_meta`
--

LOCK TABLES `kimai2_timesheet_meta` WRITE;
/*!40000 ALTER TABLE `kimai2_timesheet_meta` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_timesheet_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_timesheet_tags`
--

DROP TABLE IF EXISTS `kimai2_timesheet_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_timesheet_tags` (
  `timesheet_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`timesheet_id`,`tag_id`),
  KEY `IDX_E3284EFEABDD46BE` (`timesheet_id`),
  KEY `IDX_E3284EFEBAD26311` (`tag_id`),
  CONSTRAINT `FK_732EECA9ABDD46BE` FOREIGN KEY (`timesheet_id`) REFERENCES `kimai2_timesheet` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_732EECA9BAD26311` FOREIGN KEY (`tag_id`) REFERENCES `kimai2_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_timesheet_tags`
--

LOCK TABLES `kimai2_timesheet_tags` WRITE;
/*!40000 ALTER TABLE `kimai2_timesheet_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_timesheet_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_user_preferences`
--

DROP TABLE IF EXISTS `kimai2_user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_8D08F631A76ED3955E237E06` (`user_id`,`name`),
  KEY `IDX_8D08F631A76ED395` (`user_id`),
  CONSTRAINT `FK_8D08F631A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1973 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_user_preferences`
--

LOCK TABLES `kimai2_user_preferences` WRITE;
/*!40000 ALTER TABLE `kimai2_user_preferences` DISABLE KEYS */;
INSERT INTO `kimai2_user_preferences` VALUES
(63,45,'ldap_dn','CN=Management Report,CN=Users,DC=ppda,DC=go,DC=ug'),
(64,46,'ldap_dn','CN=Knowbe4,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(65,46,'ad_ou','Service Accounts'),
(76,52,'ldap_dn','CN=EDMS Admin,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(77,52,'ad_ou','Service Accounts'),
(78,53,'ldap_dn','CN=SCCM Admin,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(79,53,'ad_ou','Service Accounts'),
(84,56,'ldap_dn','CN=PPDA Share,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(85,56,'ad_ou','Service Accounts'),
(86,57,'ldap_dn','CN=Mail-backup,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(87,57,'ad_ou','Service Accounts'),
(88,58,'ldap_dn','CN=Solomon Admin,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(89,58,'ad_ou','Service Accounts'),
(92,60,'ldap_dn','CN=AD Mail Authentication,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(93,60,'ad_ou','Service Accounts'),
(94,61,'ldap_dn','CN=Jenipher Kaggwa,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(95,61,'ad_department','Strategy Planning And Monitoring'),
(96,61,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(97,61,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(98,62,'ldap_dn','CN=Vivacious Mugisha,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(99,62,'ad_department','Strategy Planning And Monitoring'),
(100,62,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(101,62,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(102,63,'ldap_dn','CN=po-intern,CN=Users,DC=ppda,DC=go,DC=ug'),
(103,64,'ldap_dn','CN=Research Intern,CN=Users,DC=ppda,DC=go,DC=ug'),
(104,65,'ldap_dn','CN=Pr Intern.,CN=Users,DC=ppda,DC=go,DC=ug'),
(105,66,'ldap_dn','CN=PM Intern2,CN=Users,DC=ppda,DC=go,DC=ug'),
(106,67,'ldap_dn','CN=PM Intern,CN=Users,DC=ppda,DC=go,DC=ug'),
(107,68,'ldap_dn','CN=Legal Intern2,CN=Users,DC=ppda,DC=go,DC=ug'),
(108,69,'ldap_dn','CN=Legal Intern,CN=Users,DC=ppda,DC=go,DC=ug'),
(109,70,'ldap_dn','CN=Faith Mbabazi,CN=Users,DC=ppda,DC=go,DC=ug'),
(110,71,'ldap_dn','CN=Rose Nalukwago,CN=Users,DC=ppda,DC=go,DC=ug'),
(113,74,'ldap_dn','CN=Godfrey Sempangama,CN=Users,DC=ppda,DC=go,DC=ug'),
(114,75,'ldap_dn','CN=Benard Obonyo,CN=Users,DC=ppda,DC=go,DC=ug'),
(115,76,'ldap_dn','CN=lintern,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(116,76,'ad_ou','Departments > HR and Admin'),
(117,77,'ldap_dn','CN=Shadad Yiga,CN=Users,DC=ppda,DC=go,DC=ug'),
(120,80,'ldap_dn','CN=Intern Proc,CN=Users,DC=ppda,DC=go,DC=ug'),
(121,81,'ldap_dn','CN=Registry Intern,CN=Users,DC=ppda,DC=go,DC=ug'),
(122,82,'ldap_dn','CN=SCCM-SQLReporting,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(123,82,'ad_ou','Service Accounts'),
(124,83,'ldap_dn','CN=SCCM-DomainJoin,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(125,83,'ad_ou','Service Accounts'),
(126,84,'ldap_dn','CN=Angella ayebale,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(127,84,'ad_ou','Departments > HR and Admin'),
(128,85,'ldap_dn','CN=Arnold Illango,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(129,85,'ad_department','Performance Monitoring Central Government'),
(130,85,'ad_ou','Departments > Perfomance Monitoring - Central'),
(131,85,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(132,86,'ldap_dn','CN=Anita Nnuwahereza,OU=Library,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(133,86,'ad_department','Library and Documentation'),
(134,86,'ad_ou','Departments > Strategy and Planning > Library'),
(135,86,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(136,87,'ldap_dn','CN=Ambrose tumwesigye,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(137,87,'ad_department','Performance Monitoring Regional Offices'),
(138,87,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(139,87,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(140,88,'ldap_dn','CN=Caroline Ankunda,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(141,88,'ad_department','Performance Monitoring Regional Offices'),
(142,88,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(143,88,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(144,89,'ldap_dn','CN=David Biriija,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(145,89,'ad_department','Performance Monitoring Regional Offices'),
(146,89,'ad_ou','Disabled > Users'),
(147,89,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(148,90,'ldap_dn','CN=Eric Aisu,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(149,90,'ad_ou','Departments > HR and Admin'),
(150,91,'ldap_dn','CN=Josephine Awor,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(151,91,'ad_department','Performance Monitoring Central Government'),
(152,91,'ad_ou','Disabled > Users'),
(153,91,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(154,92,'ldap_dn','CN=John Ndyanabo,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(155,92,'ad_department','Performance Monitoring Regional Offices'),
(156,92,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(157,92,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(158,93,'ldap_dn','CN=Mark Hasibe,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(159,93,'ad_department','Performance Monitoring Regional Offices'),
(160,93,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(161,93,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(162,94,'ldap_dn','CN=Patricia Acen,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(163,94,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(164,95,'ldap_dn','CN=Rahim batwaala,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(165,95,'ad_ou','Departments > Legal and Board Affairs'),
(166,96,'ldap_dn','CN=Robert Kasule,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(167,96,'ad_department','Performance Monitoring Regional Offices'),
(168,96,'ad_ou','Disabled > Users'),
(169,96,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(170,97,'ldap_dn','CN=Sarah Aalok,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(171,97,'ad_ou','Departments > Perfomance Monitoring - Central'),
(172,98,'ldap_dn','CN=Shawn Niwamanya,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(173,98,'ad_ou','Departments > Legal and Board Affairs'),
(174,99,'ldap_dn','CN=Aloysious Byaruhanga,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(175,99,'ad_department','Performance Monitoring Central Government'),
(176,99,'ad_ou','Disabled > Users'),
(177,99,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(178,100,'ldap_dn','CN=Bridget Opany,CN=Users,DC=ppda,DC=go,DC=ug'),
(179,101,'ldap_dn','CN=David Matovu,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(180,101,'ad_department','Executive Director\'s Office'),
(181,101,'ad_ou','Disabled > Users'),
(182,101,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(183,102,'ldap_dn','CN=Hassam Dalia,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(184,102,'ad_department','Procurement and Disposal Capacity Building'),
(185,102,'ad_ou','Disabled > Users'),
(186,102,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(187,103,'ldap_dn','CN=Hannah Padde Blessed,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(188,103,'ad_department','Executive Director\'s Office'),
(189,103,'ad_ou','Departments > ED Office'),
(190,103,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(193,105,'ldap_dn','CN=Maurice Barole,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(194,105,'ad_department','Performance Monitoring Regional Offices'),
(195,105,'ad_ou','Disabled > Users'),
(196,105,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(197,106,'ldap_dn','CN=Moses Kwiringira,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(198,106,'ad_department','Human Resources and Administration'),
(199,106,'ad_ou','Disabled > Users'),
(200,106,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(201,107,'ldap_dn','CN=Mary Sharon Nassaza,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(202,107,'ad_department','Risk and Audit'),
(203,107,'ad_ou','Disabled > Users'),
(204,107,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(205,108,'ldap_dn','CN=Martin Sekwe John,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(206,108,'ad_department','Performance Monitoring Central Government'),
(207,108,'ad_ou','Disabled > Users'),
(208,108,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(209,109,'ldap_dn','CN=Nathan Birungi,CN=Users,DC=ppda,DC=go,DC=ug'),
(210,110,'ldap_dn','CN=Patricia Ikuret,CN=Users,DC=ppda,DC=go,DC=ug'),
(211,111,'ldap_dn','CN=Patrick Katongole,CN=Users,DC=ppda,DC=go,DC=ug'),
(212,111,'ad_department','Performance Monitoring Regional Offices'),
(213,111,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(214,112,'ldap_dn','CN=Sophia Masagazi,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(215,112,'ad_department','Legal and Board Affairs'),
(216,112,'ad_ou','Disabled > Users'),
(217,112,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(218,113,'ldap_dn','CN=Simon Onen,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(219,113,'ad_department','Performance Monitoring Central Government'),
(220,113,'ad_ou','Departments > Perfomance Monitoring - Central'),
(221,113,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(222,114,'ldap_dn','CN=Vinceny Talyeba,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(223,114,'ad_department','Human Resources and Administration'),
(224,114,'ad_ou','Disabled > Users'),
(225,114,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(226,115,'ldap_dn','CN=Richard Turyatunga,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(227,115,'ad_ou','Departments > HR and Admin'),
(228,116,'ldap_dn','CN=Francis Bumba,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(229,116,'ad_department','Human Resources and Administration'),
(230,116,'ad_ou','Disabled > Users'),
(231,116,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(232,117,'ldap_dn','CN=Joseph Kintu,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(233,117,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(234,118,'ldap_dn','CN=Yassin Kalange,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(235,118,'ad_department','Human Resources and Administration'),
(236,118,'ad_ou','Departments > HR and Admin'),
(237,118,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(238,119,'ldap_dn','CN=Jenavive Akello,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(239,119,'ad_department','Performance Monitoring Central Government'),
(240,119,'ad_ou','Departments > Perfomance Monitoring - Central'),
(241,119,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(242,120,'ldap_dn','CN=Jordan Mujuni,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(243,120,'ad_department','Strategy Planning And Monitoring'),
(244,120,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(245,120,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(246,121,'ldap_dn','CN=Priscilla namasopo,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(247,121,'ad_ou','Departments > HR and Admin'),
(248,122,'ldap_dn','CN=Oward asiimwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(249,122,'ad_ou','Departments > Perfomance Monitoring - Central'),
(250,123,'ldap_dn','CN=Richard Kalule,OU=Planning,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(251,123,'ad_department','Strategy Planning And Monitoring'),
(252,123,'ad_ou','Departments > Strategy and Planning > Planning'),
(253,123,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(254,124,'ldap_dn','CN=Sheila Nakiwala,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(255,124,'ad_department','Legal and Board Affairs'),
(256,124,'ad_ou','Departments > Legal and Board Affairs'),
(257,124,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(258,125,'ldap_dn','CN=Morris Area,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(259,125,'ad_department','Human Resources and Administration'),
(260,125,'ad_ou','Departments > HR and Admin'),
(261,125,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(264,127,'ldap_dn','CN=Walter Ojok,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(265,127,'ad_department','Procurement and Disposal Capacity Building'),
(266,127,'ad_ou','Departments > Procurment Capacity Building'),
(267,127,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(268,128,'ldap_dn','CN=Olga Kanyangye,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(269,128,'ad_department','Performance Monitoring Central Government'),
(270,128,'ad_ou','Departments > Perfomance Monitoring - Central'),
(271,128,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(272,129,'ldap_dn','CN=Iga Bamanya,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(273,129,'ad_department','Performance Monitoring Regional Offices'),
(274,129,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(275,129,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(276,130,'ldap_dn','CN=vpn,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(277,130,'ad_ou','Service Accounts'),
(278,131,'ldap_dn','CN=Gladys Komugisha,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(279,131,'ad_department','Performance Monitoring Central Government'),
(280,131,'ad_ou','Departments > Perfomance Monitoring - Central'),
(281,131,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(282,132,'ldap_dn','CN=Ziadah Kagoya,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(283,132,'ad_department','Performance Monitoring Regional Offices'),
(284,132,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(285,132,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(286,133,'ldap_dn','CN=Moses Eyou,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(287,133,'ad_department','Human Resources and Administration'),
(288,133,'ad_ou','Departments > HR and Admin'),
(289,133,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(290,134,'ldap_dn','CN=Emily Kemigisha,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(291,134,'ad_department','Strategy Planning And Monitoring'),
(292,134,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(293,134,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(294,135,'ldap_dn','CN=Mercy Kyoshabire,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(295,135,'ad_department','Procurement and Disposal Capacity Building'),
(296,135,'ad_ou','Departments > Procurment Capacity Building'),
(297,135,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(298,136,'ldap_dn','CN=Enock Ekallam,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(299,136,'ad_department','Performance Monitoring Regional Offices'),
(300,136,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(301,136,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(302,137,'ldap_dn','CN=Patrick Kyakulaga,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(303,137,'ad_department','Finance'),
(304,137,'ad_ou','Departments > Finance'),
(305,137,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(306,138,'ldap_dn','CN=Keleth Atamba,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(307,138,'ad_department','Performance Monitoring Central Government'),
(308,138,'ad_ou','Departments > Perfomance Monitoring - Central'),
(309,138,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(310,139,'ldap_dn','CN=Hassan Tugume,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(311,139,'ad_department','Performance Monitoring Regional Offices'),
(312,139,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(313,139,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(314,140,'ldap_dn','CN=Clive Birungi,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(315,140,'ad_department','Performance Monitoring Regional Offices'),
(316,140,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(317,140,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(318,141,'ldap_dn','CN=Abraham Wampabya,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(319,141,'ad_department','Performance Monitoring Regional Offices'),
(320,141,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(321,141,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(322,142,'ldap_dn','CN=Lydia M Kwesiga,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(323,142,'ad_ou','Departments > Perfomance Monitoring - Central'),
(324,143,'ldap_dn','CN=Miriam Nyakamadi Bigirwa,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(325,143,'ad_department','Performance Monitoring Central Government'),
(326,143,'ad_ou','Departments > Perfomance Monitoring - Central'),
(327,143,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(328,144,'ldap_dn','CN=Mike Nsereko,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(329,144,'ad_department','Strategy Planning And Monitoring'),
(330,144,'ad_ou','Departments > Strategy and Planning'),
(331,144,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(332,145,'ldap_dn','CN=Mary F Namirembe,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(333,145,'ad_department','Legal and Board Affairs'),
(334,145,'ad_ou','Departments > Legal and Board Affairs'),
(335,145,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(336,146,'ldap_dn','CN=Rogers Nyesiga,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(337,146,'ad_department','Performance Monitoring Regional Offices'),
(338,146,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(339,146,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(340,147,'ldap_dn','CN=Ceasar Nakedde,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(341,147,'ad_department','Performance Monitoring Regional Offices'),
(342,147,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(343,147,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(344,148,'ldap_dn','CN=Amanda Lulu,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(345,148,'ad_department','Legal and Board Affairs'),
(346,148,'ad_ou','Departments > Legal and Board Affairs'),
(347,148,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(348,149,'ldap_dn','CN=Sarah Namuwaya,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(349,149,'ad_department','Procurement and Disposal Capacity Building'),
(350,149,'ad_ou','Departments > Procurment Capacity Building'),
(351,149,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(352,150,'ldap_dn','CN=Catherine Natukunda,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(353,150,'ad_department','Procurement and Disposal Capacity Building'),
(354,150,'ad_ou','Departments > Procurment Capacity Building'),
(355,150,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(356,151,'ldap_dn','CN=Bravo Bagyenzi,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(357,151,'ad_department','Procurement and Disposal Capacity Building'),
(358,151,'ad_ou','Departments > Procurment Capacity Building'),
(359,151,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(360,152,'ldap_dn','CN=Ian Tumusiime,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(361,152,'ad_department','Performance Monitoring Regional Offices'),
(362,152,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(363,152,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(364,153,'ldap_dn','CN=Stella Lanyero,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(365,153,'ad_department','Performance Monitoring Regional Offices'),
(366,153,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(367,153,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(368,154,'ldap_dn','CN=Patrick Mujuni,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(369,154,'ad_department','Legal and Board Affairs'),
(370,154,'ad_ou','Departments > Legal and Board Affairs'),
(371,154,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(372,155,'ldap_dn','CN=Aaron Kakongyi,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(373,155,'ad_department','Executive Director\'s Office'),
(374,155,'ad_ou','Departments > ED Office'),
(375,155,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(376,156,'ldap_dn','CN=Harriet Mudondo,OU=Resource Mobilisation,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(377,156,'ad_department','Strategy Planning And Monitoring'),
(378,156,'ad_ou','Departments > Strategy and Planning > Resource Mobilisation'),
(379,156,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(380,157,'ldap_dn','CN=quarantine,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(381,157,'ad_ou','Service Accounts'),
(382,158,'ldap_dn','CN=Tonny Canogura,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(383,158,'ad_department','Performance Monitoring Central Government'),
(384,158,'ad_ou','Disabled > Users'),
(385,158,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(388,160,'ldap_dn','CN=James Luyombya,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(389,160,'ad_department','Human Resources and Administration'),
(390,160,'ad_ou','Departments > HR and Admin'),
(391,160,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(392,161,'ldap_dn','CN=Joseph Asiimwe,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(393,161,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(394,162,'ldap_dn','CN=Carolyn Nakidde,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(395,162,'ad_department','Performance Monitoring Regional Offices'),
(396,162,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(397,162,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(398,163,'ldap_dn','CN=Stephen Busulwa,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(399,163,'ad_department','Human Resources and Administration'),
(400,163,'ad_ou','Departments > HR and Admin'),
(401,163,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(402,164,'ldap_dn','CN=Sharpson Mutabanura,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(403,164,'ad_department','Performance Monitoring Regional Offices'),
(404,164,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(405,164,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(406,165,'ldap_dn','CN=Freeman Ibingira,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(407,165,'ad_department','Procurement and Disposal Capacity Building'),
(408,165,'ad_ou','Departments > Procurment Capacity Building'),
(409,165,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(410,166,'ldap_dn','CN=Steven Chombe,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(411,166,'ad_department','Performance Monitoring Regional Offices'),
(412,166,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(413,166,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(414,167,'ldap_dn','CN=Agnes Seera,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(415,167,'ad_department','Performance Monitoring Central Government'),
(416,167,'ad_ou','Departments > Perfomance Monitoring - Central'),
(417,167,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(418,168,'ldap_dn','CN=Ali Banamwita,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(419,168,'ad_department','Human Resources and Administration'),
(420,168,'ad_ou','Departments > HR and Admin'),
(421,168,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(422,169,'ldap_dn','CN=Jimmy Kanababa,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(423,169,'ad_department','Human Resources and Administration'),
(424,169,'ad_ou','Departments > HR and Admin'),
(425,169,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(426,170,'ldap_dn','CN=Brenda Ahimbisibwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(427,170,'ad_department','Performance Monitoring Central Government'),
(428,170,'ad_ou','Departments > Perfomance Monitoring - Central'),
(429,170,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(430,171,'ldap_dn','CN=Nuludiin Tebusweke,OU=Internal Audit,OU=Departments,DC=ppda,DC=go,DC=ug'),
(431,171,'ad_department','Executive Director\'s Office'),
(432,171,'ad_ou','Departments > Internal Audit'),
(433,171,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(434,172,'ldap_dn','CN=Dan Lukyamuzi,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(435,172,'ad_department','Performance Monitoring Regional Offices'),
(436,172,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(437,172,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(438,173,'ldap_dn','CN=Precious Tusime,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(439,173,'ad_department','Performance Monitoring Central Government'),
(440,173,'ad_ou','Departments > Perfomance Monitoring - Central'),
(441,173,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(442,174,'ldap_dn','CN=Sam Okwang,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(443,174,'ad_department','Human Resources and Administration'),
(444,174,'ad_ou','Departments > HR and Admin'),
(445,174,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(446,175,'ldap_dn','CN=Brenda Atuhairwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(447,175,'ad_department','Performance Monitoring Central Government'),
(448,175,'ad_ou','Departments > Perfomance Monitoring - Central'),
(449,175,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(450,176,'ldap_dn','CN=Ambrose Kakuru,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(451,176,'ad_department','Performance Monitoring Regional Offices'),
(452,176,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(453,176,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(454,177,'ldap_dn','CN=Moureen Munguriek,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(455,177,'ad_department','Performance Monitoring Regional Offices'),
(456,177,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(457,177,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(458,178,'ldap_dn','CN=Raymond Freedom,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(459,178,'ad_department','Performance Monitoring Regional Offices'),
(460,178,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(461,178,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(462,179,'ldap_dn','CN=James Okongo,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(463,179,'ad_department','Performance Monitoring Regional Offices'),
(464,179,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(465,179,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(466,180,'ldap_dn','CN=Joan Nankunda,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(467,180,'ad_department','Performance Monitoring Central Government'),
(468,180,'ad_ou','Departments > Perfomance Monitoring - Central'),
(469,180,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(470,181,'ldap_dn','CN=Faith Nalukwago,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(471,181,'ad_department','Strategy Planning And Monitoring'),
(472,181,'ad_ou','Departments > Strategy and Planning'),
(473,181,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(474,182,'ldap_dn','CN=Bridget Namusimbi,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(475,182,'ad_department','Performance Monitoring Central Government'),
(476,182,'ad_ou','Departments > Perfomance Monitoring - Central'),
(477,182,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(478,183,'ldap_dn','CN=Isaac Ssebabi,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(479,183,'ad_department','Performance Monitoring Regional Offices'),
(480,183,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(481,183,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(482,184,'ldap_dn','CN=Vanice nuwagaba,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(483,184,'ad_department','Performance Monitoring Regional Offices'),
(484,184,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(485,184,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(486,185,'ldap_dn','CN=Hadijah Katusabe,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(487,185,'ad_department','Performance Monitoring Regional Offices'),
(488,185,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(489,185,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(490,186,'ldap_dn','CN=John Ssekamatte,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(491,186,'ad_department','Strategy Planning And Monitoring'),
(492,186,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(493,186,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(494,187,'ldap_dn','CN=Ellon Tumworobere,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(495,187,'ad_department','Performance Monitoring Regional Offices'),
(496,187,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(497,187,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(500,189,'ldap_dn','CN=Anna Akatukunda,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(501,189,'ad_department','Performance Monitoring Regional Offices'),
(502,189,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(503,189,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(504,190,'ldap_dn','CN=Saharu Nassazi,OU=Research,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(505,190,'ad_department','Strategy Planning And Monitoring'),
(506,190,'ad_ou','Departments > Strategy and Planning > Research'),
(507,190,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(508,191,'ldap_dn','CN=Hilda Mwesigwa,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(509,191,'ad_department','Performance Monitoring Central Government'),
(510,191,'ad_ou','Departments > Perfomance Monitoring - Central'),
(511,191,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(512,192,'ldap_dn','CN=Specioza Waigumba,OU=Mbale Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(513,192,'ad_department','Performance Monitoring Regional Offices'),
(514,192,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbale Regional Office'),
(515,192,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(516,193,'ldap_dn','CN=Syria Kyobutungi,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(517,193,'ad_department','Human Resources and Administration'),
(518,193,'ad_ou','Departments > HR and Admin'),
(519,193,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(520,194,'ldap_dn','CN=Mariam Baluka,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(521,194,'ad_department','Procurement and Disposal Capacity Building'),
(522,194,'ad_ou','Departments > Procurment Capacity Building'),
(523,194,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(524,195,'ldap_dn','CN=Susan Were,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(525,195,'ad_department','Performance Monitoring Central Government'),
(526,195,'ad_ou','Departments > Perfomance Monitoring - Central'),
(527,195,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(528,196,'ldap_dn','CN=Babrah Kyasiimire,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(529,196,'ad_department','Legal and Board Affairs'),
(530,196,'ad_ou','Departments > Legal and Board Affairs'),
(531,196,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(532,197,'ldap_dn','CN=Ronald Tumuhairwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(533,197,'ad_department','Performance Monitoring Central Government'),
(534,197,'ad_ou','Departments > Perfomance Monitoring - Central'),
(535,197,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(536,198,'ldap_dn','CN=Agatha Kirabo,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(537,198,'ad_department','Procurement and Disposal Capacity Building'),
(538,198,'ad_ou','Departments > Procurment Capacity Building'),
(539,198,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(540,199,'ldap_dn','CN=Eva Namuddu,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(541,199,'ad_department','Performance Monitoring Central Government'),
(542,199,'ad_ou','Departments > Perfomance Monitoring - Central'),
(543,199,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(544,200,'ldap_dn','CN=Babrah Natukwatsa,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(545,200,'ad_department','Executive Director\'s Office'),
(546,200,'ad_ou','Departments > ED Office'),
(547,200,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(548,201,'ldap_dn','CN=Uthman Segawa,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(549,201,'ad_department','Legal and Board Affairs'),
(550,201,'ad_ou','Departments > Legal and Board Affairs'),
(551,201,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(552,202,'ldap_dn','CN=Caroline Niwagaba,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(553,202,'ad_department','Finance'),
(554,202,'ad_ou','Departments > Finance'),
(555,202,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(556,203,'ldap_dn','CN=Marion Nansamba,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(557,203,'ad_department','Human Resources and Administration'),
(558,203,'ad_ou','Departments > HR and Admin'),
(559,203,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(560,204,'ldap_dn','CN=Leevan Abaho,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(561,204,'ad_department','Performance Monitoring Central Government'),
(562,204,'ad_ou','Departments > Perfomance Monitoring - Central'),
(563,204,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(564,205,'ldap_dn','CN=Rahim batwala,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(565,205,'ad_department','Legal and Board Affairs'),
(566,205,'ad_ou','Departments > Legal and Board Affairs'),
(567,205,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(568,206,'ldap_dn','CN=Susan Kamazima,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(569,206,'ad_department','Performance Monitoring Regional Offices'),
(570,206,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(571,206,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(572,207,'ldap_dn','CN=Daphine Birungi,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(573,207,'ad_department','Human Resources and Administration'),
(574,207,'ad_ou','Departments > HR and Admin'),
(575,207,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(576,208,'ldap_dn','CN=Richard Obasoni,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(577,208,'ad_department','Finance'),
(578,208,'ad_ou','Departments > Finance'),
(579,208,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(580,209,'ldap_dn','CN=Emmanuel Cheptoek,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(581,209,'ad_department','Performance Monitoring Regional Offices'),
(582,209,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(583,209,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(584,210,'ldap_dn','CN=Doreen Kyazze,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(585,210,'ad_department','Legal and Board Affairs'),
(586,210,'ad_ou','Departments > Legal and Board Affairs'),
(587,210,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(588,211,'ldap_dn','CN=Suzan Nakawala,OU=Internal Audit,OU=Departments,DC=ppda,DC=go,DC=ug'),
(589,211,'ad_department','Risk and Audit'),
(590,211,'ad_ou','Departments > Internal Audit'),
(591,211,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(592,212,'ldap_dn','CN=Liz Namutebi,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(593,212,'ad_department','Human Resources and Administration'),
(594,212,'ad_ou','Departments > HR and Admin'),
(595,212,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(596,213,'ldap_dn','CN=Shalina Nakanwagi,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(597,213,'ad_department','Finance'),
(598,213,'ad_ou','Departments > Finance'),
(599,213,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(600,214,'ldap_dn','CN=Claire Asiimwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(601,214,'ad_department','Performance Monitoring Central Government'),
(602,214,'ad_ou','Departments > Perfomance Monitoring - Central'),
(603,214,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(604,215,'ldap_dn','CN=Josephine Nangabo,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(605,215,'ad_department','Executive Director\'s Office'),
(606,215,'ad_ou','Departments > ED Office'),
(607,215,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(608,216,'ldap_dn','CN=Richard Luzira,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(609,216,'ad_department','Human Resources and Administration'),
(610,216,'ad_ou','Departments > HR and Admin'),
(611,216,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(612,217,'ldap_dn','CN=Ruth  L Nabayengo,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(613,217,'ad_department','Human Resources and Administration'),
(614,217,'ad_ou','Departments > HR and Admin'),
(615,217,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(616,218,'ldap_dn','CN=Moses Ojambo,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(617,218,'ad_department','Performance Monitoring Regional Offices'),
(618,218,'ad_ou','Departments > Performance Monitoring - Regional Offices'),
(619,218,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(620,219,'ldap_dn','CN=Francis Nyeko,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(621,219,'ad_department','Performance Monitoring Regional Offices'),
(622,219,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(623,219,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(624,220,'ldap_dn','CN=Chloe Keitesi,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(625,220,'ad_department','Performance Monitoring Central Government'),
(626,220,'ad_ou','Departments > Perfomance Monitoring - Central'),
(627,220,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(628,221,'ldap_dn','CN=Eunice Akiiki,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(629,221,'ad_department','Performance Monitoring Central Government'),
(630,221,'ad_ou','Departments > Perfomance Monitoring - Central'),
(631,221,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(632,222,'ldap_dn','CN=Daphine Karashani,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(633,222,'ad_department','Performance Monitoring Regional Offices'),
(634,222,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(635,222,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(636,223,'ldap_dn','CN=Brenda Agaba,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(637,223,'ad_department','Finance'),
(638,223,'ad_ou','Departments > Finance'),
(639,223,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(640,224,'ldap_dn','CN=Douglas Ashabahebwa,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(641,224,'ad_department','Performance Monitoring Central Government'),
(642,224,'ad_ou','Departments > Perfomance Monitoring - Central'),
(643,224,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(644,225,'ldap_dn','CN=Eva Lubowa Nazziwa,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(645,225,'ad_department','Human Resources and Administration'),
(646,225,'ad_ou','Departments > HR and Admin'),
(647,225,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(648,226,'ldap_dn','CN=Gloria Kansiime,OU=Research,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(649,226,'ad_department','Strategy Planning And Monitoring'),
(650,226,'ad_ou','Departments > Strategy and Planning > Research'),
(651,226,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(652,227,'ldap_dn','CN=Sam Bugembe,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(653,227,'ad_department','Finance'),
(654,227,'ad_ou','Departments > Finance'),
(655,227,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(656,228,'ldap_dn','CN=Tracy Judith Amito,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(657,228,'ad_department','Performance Monitoring Regional Offices'),
(658,228,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(659,228,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(660,229,'ldap_dn','CN=Martha Mwesigye,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(661,229,'ad_ou','Departments > Finance'),
(662,230,'ldap_dn','CN=Anna Senyonjo,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(663,230,'ad_department','Executive Director\'s Office'),
(664,230,'ad_ou','Departments > ED Office'),
(665,230,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(666,231,'ldap_dn','CN=Mary Akiror,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(667,231,'ad_department','Performance Monitoring Regional Offices'),
(668,231,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(669,231,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(670,232,'ldap_dn','CN=Billbest Bakirese,OU=Planning,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(671,232,'ad_department','Strategy Planning And Monitoring'),
(672,232,'ad_ou','Departments > Strategy and Planning > Planning'),
(673,232,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(674,233,'ldap_dn','CN=Susan Musiime,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(675,233,'ad_department','Performance Monitoring Regional Offices'),
(676,233,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(677,233,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(678,234,'ldap_dn','CN=Ronah Kemigisa,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(679,234,'ad_department','Executive Director\'s Office'),
(680,234,'ad_ou','Departments > ED Office'),
(681,234,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(682,235,'ldap_dn','CN=Shafik Kimbugwe,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(683,235,'ad_department','Performance Monitoring Central Government'),
(684,235,'ad_ou','Departments > Perfomance Monitoring - Central'),
(685,235,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(686,236,'ldap_dn','CN=Obed Byamukama,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(687,236,'ad_department','Finance'),
(688,236,'ad_ou','Departments > Finance'),
(689,236,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(690,237,'ldap_dn','CN=Martha Akwano.,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(691,237,'ad_department','Performance Monitoring Central Government'),
(692,237,'ad_ou','Departments > Perfomance Monitoring - Central'),
(693,237,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(694,238,'ldap_dn','CN=Gemma Barekye,OU=Resource Mobilisation,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(695,238,'ad_department','Strategy Planning And Monitoring'),
(696,238,'ad_ou','Departments > Strategy and Planning > Resource Mobilisation'),
(697,238,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(698,239,'ldap_dn','CN=Ann Simiyu Wokuri,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(699,239,'ad_department','Legal and Board Affairs'),
(700,239,'ad_ou','Departments > Legal and Board Affairs'),
(701,239,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(702,240,'ldap_dn','CN=Rebecca Namayanja,OU=Library,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(703,240,'ad_department','Strategy Planning And Monitoring'),
(704,240,'ad_ou','Departments > Strategy and Planning > Library'),
(705,240,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(706,241,'ldap_dn','CN=Susan Alum,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(707,241,'ad_department','Performance Monitoring Central Government'),
(708,241,'ad_ou','Departments > Perfomance Monitoring - Central'),
(709,241,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(710,242,'ldap_dn','CN=Herman Nteziyalemye,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(711,242,'ad_department','Performance Monitoring Regional Offices'),
(712,242,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(713,242,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(714,243,'ldap_dn','CN=Benson Turamye,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(715,243,'ad_department','Executive Director\'s Office'),
(716,243,'ad_ou','Departments > ED Office'),
(717,243,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(718,244,'ldap_dn','CN=Namirembe Fatuma,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(719,244,'ad_department','Executive Director\'s Office'),
(720,244,'ad_ou','Departments > ED Office'),
(721,244,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(722,245,'ldap_dn','CN=Fiona Consolata Giramiya,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(723,245,'ad_department','Performance Monitoring Central Government'),
(724,245,'ad_ou','Departments > Perfomance Monitoring - Central'),
(725,245,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(726,246,'ldap_dn','CN=Annette Nazziwa,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(727,246,'ad_ou','Departments > Perfomance Monitoring - Central'),
(728,247,'ldap_dn','CN=Charity Nyamungu,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(729,247,'ad_department','Executive Director\'s Office'),
(730,247,'ad_ou','Departments > ED Office'),
(731,247,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(732,248,'ldap_dn','CN=Godfrey Joe Obita,OU=Gulu Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(733,248,'ad_department','Performance Monitoring Regional Offices'),
(734,248,'ad_ou','Departments > Performance Monitoring - Regional Offices > Gulu Regional Office'),
(735,248,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(736,249,'ldap_dn','CN=Julius Obbo,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(737,249,'ad_department','Human Resources and Administration'),
(738,249,'ad_ou','Departments > HR and Admin'),
(739,249,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(740,250,'ldap_dn','CN=Michael Mugisha,OU=Library,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(741,250,'ad_department','Strategy Planning And Monitoring'),
(742,250,'ad_ou','Departments > Strategy and Planning > Library'),
(743,250,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(744,251,'ldap_dn','CN=Jenipher Kyarisiima,OU=Library,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(745,251,'ad_department','Strategy Planning And Monitoring'),
(746,251,'ad_ou','Departments > Strategy and Planning > Library'),
(747,251,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(748,252,'ldap_dn','CN=Joel Kiraire,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(749,252,'ad_department','Performance Monitoring Central Government'),
(750,252,'ad_ou','Departments > Perfomance Monitoring - Central'),
(751,252,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(752,253,'ldap_dn','CN=Eron Namusoke,OU=Legal and Board Affairs,OU=Departments,DC=ppda,DC=go,DC=ug'),
(753,253,'ad_department','Legal and Board Affairs'),
(754,253,'ad_ou','Departments > Legal and Board Affairs'),
(755,253,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(756,254,'ldap_dn','CN=Andrew Emejeit,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(757,254,'ad_department','Performance Monitoring Central Government'),
(758,254,'ad_ou','Departments > Perfomance Monitoring - Central'),
(759,254,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(760,255,'ldap_dn','CN=Ronald Kalema,OU=Internal Audit,OU=Departments,DC=ppda,DC=go,DC=ug'),
(761,255,'ad_department','Risk and Audit'),
(762,255,'ad_ou','Departments > Internal Audit'),
(763,255,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(766,257,'ldap_dn','CN=Wilberforce Mulindwa,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(767,257,'ad_department','Finance'),
(768,257,'ad_ou','Departments > Perfomance Monitoring - Central'),
(769,257,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(770,258,'ldap_dn','CN=Simon Businge,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(771,258,'ad_department','Performance Monitoring Central Government'),
(772,258,'ad_ou','Departments > Perfomance Monitoring - Central'),
(773,258,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(774,259,'ldap_dn','CN=Catherine Atuganyira,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(775,259,'ad_department','Performance Monitoring Regional Offices'),
(776,259,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(777,259,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(778,260,'ldap_dn','CN=Rebecca Masajjage,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(779,260,'ad_department','Executive Director\'s Office'),
(780,260,'ad_ou','Departments > ED Office'),
(781,260,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(782,261,'ldap_dn','CN=Cosmos Orotit Otebat,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(783,261,'ad_department','Performance Monitoring Regional Offices'),
(784,261,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(785,261,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(786,262,'ldap_dn','CN=Jalia Nansamba,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(787,262,'ad_department','Performance Monitoring Regional Offices'),
(788,262,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(789,262,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(790,263,'ldap_dn','CN=Shamilah Nakatwere,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(791,263,'ad_department','Performance Monitoring Central Government'),
(792,263,'ad_ou','Departments > Perfomance Monitoring - Central'),
(793,263,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(794,264,'ldap_dn','CN=Vale Buyondo,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(795,264,'ad_department','Strategy Planning And Monitoring'),
(796,264,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(797,264,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(798,265,'ldap_dn','CN=Wilson Byekwaso,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(799,265,'ad_department','Strategy Planning And Monitoring'),
(800,265,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(801,265,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(802,266,'ldap_dn','CN=Cris Magoba,OU=ED Office,OU=Departments,DC=ppda,DC=go,DC=ug'),
(803,266,'ad_department','Executive Director\'s Office'),
(804,266,'ad_ou','Departments > ED Office'),
(805,266,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(806,267,'ldap_dn','CN=Michael Abaine,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(807,267,'ad_department','Performance Monitoring Central Government'),
(808,267,'ad_ou','Departments > Perfomance Monitoring - Central'),
(809,267,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(810,268,'ldap_dn','CN=Ivan Nyago,OU=Central Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(811,268,'ad_department','Performance Monitoring Central Government'),
(812,268,'ad_ou','Departments > Performance Monitoring - Regional Offices > Central Regional Office'),
(813,268,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(814,269,'ldap_dn','CN=Geraldine Kawere,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(815,269,'ad_department','Performance Monitoring Regional Offices'),
(816,269,'ad_ou','Departments > Performance Monitoring - Regional Offices'),
(817,269,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(818,270,'ldap_dn','CN=GRACE ABAHO,OU=Mbarara Regional Office,OU=Performance Monitoring - Regional Offices,OU=Departments,DC=ppda,DC=go,DC=ug'),
(819,270,'ad_department','Performance Monitoring Regional Offices'),
(820,270,'ad_ou','Departments > Performance Monitoring - Regional Offices > Mbarara Regional Office'),
(821,270,'ad_company','Public Procurement and Disposal of Public Assets Authority'),
(822,271,'ldap_dn','CN=Elizabeth Mary Amulen,OU=HR and Admin,OU=Departments,DC=ppda,DC=go,DC=ug'),
(823,271,'ad_ou','Departments > HR and Admin'),
(824,272,'ldap_dn','CN=Victor Wasswa,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(825,272,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(826,273,'timezone','Africa/Kampala'),
(827,273,'language','en'),
(828,273,'skin','auto'),
(829,186,'hourly_rate','0'),
(830,186,'internal_rate',NULL),
(831,186,'timezone','Africa/Kampala'),
(832,186,'language','en'),
(833,186,'locale','en'),
(834,186,'first_weekday','monday'),
(835,186,'skin','auto'),
(836,186,'update_browser_title','1'),
(837,186,'calendar_initial_view','month'),
(838,186,'login_initial_view','timesheet'),
(839,186,'favorite_routes',''),
(840,186,'daily_stats',''),
(841,186,'export_decimal',''),
(842,186,'__wizards__','intro,profile'),
(843,273,'hourly_rate','0'),
(844,273,'internal_rate',NULL),
(845,273,'locale','en'),
(846,273,'first_weekday','monday'),
(847,273,'update_browser_title','1'),
(848,273,'calendar_initial_view','month'),
(849,273,'login_initial_view','timesheet'),
(850,273,'favorite_routes',''),
(851,273,'daily_stats',''),
(852,273,'export_decimal',''),
(853,273,'__wizards__','intro,profile'),
(854,46,'ad_unit','Service Accounts'),
(860,52,'ad_unit','Service Accounts'),
(861,53,'ad_unit','Service Accounts'),
(864,56,'ad_unit','Service Accounts'),
(865,57,'ad_unit','Service Accounts'),
(866,58,'ad_unit','Service Accounts'),
(868,60,'ad_unit','Service Accounts'),
(869,61,'ad_unit','ICT Unit'),
(870,62,'ad_unit','ICT Unit'),
(871,76,'ad_unit','HR and Admin'),
(872,82,'ad_unit','Service Accounts'),
(873,83,'ad_unit','Service Accounts'),
(874,84,'ad_unit','HR and Admin'),
(875,85,'ad_unit','Perfomance Monitoring - Central'),
(876,86,'ad_unit','Library'),
(877,86,'ad_manager','CN=Rebecca Namayanja,OU=Library,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(878,86,'ad_manager_username','rebecca namayanja'),
(879,87,'ad_unit','Mbarara Regional Office'),
(880,88,'ad_unit','Central Regional Office'),
(881,89,'ad_unit','Users'),
(882,90,'ad_unit','HR and Admin'),
(883,91,'ad_unit','Users'),
(884,92,'ad_unit','Gulu Regional Office'),
(885,93,'ad_unit','Mbarara Regional Office'),
(886,94,'ad_unit','Gulu Regional Office'),
(887,95,'ad_unit','Legal and Board Affairs'),
(888,96,'ad_unit','Users'),
(889,97,'ad_unit','Perfomance Monitoring - Central'),
(890,98,'ad_unit','Legal and Board Affairs'),
(891,99,'ad_unit','Users'),
(892,101,'ad_unit','Users'),
(893,102,'ad_unit','Users'),
(894,103,'ad_unit','ED Office'),
(896,105,'ad_unit','Users'),
(897,106,'ad_unit','Users'),
(898,107,'ad_unit','Users'),
(899,108,'ad_unit','Users'),
(900,112,'ad_unit','Users'),
(901,113,'ad_unit','Perfomance Monitoring - Central'),
(902,114,'ad_unit','Users'),
(903,115,'ad_unit','HR and Admin'),
(904,116,'ad_unit','Users'),
(905,117,'ad_unit','Mbale Regional Office'),
(906,118,'ad_unit','HR and Admin'),
(907,119,'ad_unit','Perfomance Monitoring - Central'),
(908,120,'ad_unit','ICT Unit'),
(909,121,'ad_unit','HR and Admin'),
(910,122,'ad_unit','Perfomance Monitoring - Central'),
(911,123,'ad_unit','Planning'),
(912,124,'ad_unit','Legal and Board Affairs'),
(913,125,'ad_unit','HR and Admin'),
(915,127,'ad_unit','Procurment Capacity Building'),
(916,128,'ad_unit','Perfomance Monitoring - Central'),
(917,129,'ad_unit','Central Regional Office'),
(918,130,'ad_unit','Service Accounts'),
(919,131,'ad_unit','Perfomance Monitoring - Central'),
(920,132,'ad_unit','Gulu Regional Office'),
(921,133,'ad_unit','HR and Admin'),
(922,134,'ad_unit','ICT Unit'),
(923,135,'ad_unit','Procurment Capacity Building'),
(924,136,'ad_unit','Mbarara Regional Office'),
(925,137,'ad_unit','Finance'),
(926,138,'ad_unit','Perfomance Monitoring - Central'),
(927,139,'ad_unit','Gulu Regional Office'),
(928,140,'ad_unit','Mbarara Regional Office'),
(929,141,'ad_unit','Mbale Regional Office'),
(930,142,'ad_unit','Perfomance Monitoring - Central'),
(931,143,'ad_unit','Perfomance Monitoring - Central'),
(932,144,'ad_unit','Strategy and Planning'),
(933,145,'ad_unit','Legal and Board Affairs'),
(934,146,'ad_unit','Mbale Regional Office'),
(935,147,'ad_unit','Mbarara Regional Office'),
(936,148,'ad_unit','Legal and Board Affairs'),
(937,149,'ad_unit','Procurment Capacity Building'),
(938,150,'ad_unit','Procurment Capacity Building'),
(939,151,'ad_unit','Procurment Capacity Building'),
(940,152,'ad_unit','Mbale Regional Office'),
(941,153,'ad_unit','Gulu Regional Office'),
(942,154,'ad_unit','Legal and Board Affairs'),
(943,155,'ad_unit','ED Office'),
(944,156,'ad_unit','Resource Mobilisation'),
(945,157,'ad_unit','Service Accounts'),
(946,158,'ad_unit','Users'),
(948,160,'ad_unit','HR and Admin'),
(949,161,'ad_unit','Gulu Regional Office'),
(950,162,'ad_unit','Gulu Regional Office'),
(951,163,'ad_unit','HR and Admin'),
(952,164,'ad_unit','Central Regional Office'),
(953,165,'ad_unit','Procurment Capacity Building'),
(954,166,'ad_unit','Mbale Regional Office'),
(955,167,'ad_unit','Perfomance Monitoring - Central'),
(956,168,'ad_unit','HR and Admin'),
(957,169,'ad_unit','HR and Admin'),
(958,170,'ad_unit','Perfomance Monitoring - Central'),
(959,171,'ad_unit','Internal Audit'),
(960,172,'ad_unit','Central Regional Office'),
(961,173,'ad_unit','Perfomance Monitoring - Central'),
(962,174,'ad_unit','HR and Admin'),
(963,175,'ad_unit','Perfomance Monitoring - Central'),
(964,176,'ad_unit','Mbarara Regional Office'),
(965,177,'ad_unit','Gulu Regional Office'),
(966,178,'ad_unit','Mbale Regional Office'),
(967,179,'ad_unit','Gulu Regional Office'),
(968,180,'ad_unit','Perfomance Monitoring - Central'),
(969,181,'ad_unit','Strategy and Planning'),
(970,182,'ad_unit','Perfomance Monitoring - Central'),
(971,183,'ad_unit','Mbale Regional Office'),
(972,184,'ad_unit','Mbale Regional Office'),
(973,185,'ad_unit','Mbale Regional Office'),
(974,186,'ad_unit','ICT Unit'),
(975,187,'ad_unit','Mbale Regional Office'),
(977,189,'ad_unit','Mbale Regional Office'),
(978,190,'ad_unit','Research'),
(979,191,'ad_unit','Perfomance Monitoring - Central'),
(980,192,'ad_unit','Mbale Regional Office'),
(981,193,'ad_unit','HR and Admin'),
(982,194,'ad_unit','Procurment Capacity Building'),
(983,195,'ad_unit','Perfomance Monitoring - Central'),
(984,196,'ad_unit','Legal and Board Affairs'),
(985,197,'ad_unit','Perfomance Monitoring - Central'),
(986,198,'ad_unit','Procurment Capacity Building'),
(987,199,'ad_unit','Perfomance Monitoring - Central'),
(988,200,'ad_unit','ED Office'),
(989,201,'ad_unit','Legal and Board Affairs'),
(990,202,'ad_unit','Finance'),
(991,203,'ad_unit','HR and Admin'),
(992,204,'ad_unit','Perfomance Monitoring - Central'),
(993,205,'ad_unit','Legal and Board Affairs'),
(994,206,'ad_unit','Central Regional Office'),
(995,207,'ad_unit','HR and Admin'),
(996,208,'ad_unit','Finance'),
(997,209,'ad_unit','Central Regional Office'),
(998,210,'ad_unit','Legal and Board Affairs'),
(999,211,'ad_unit','Internal Audit'),
(1000,212,'ad_unit','HR and Admin'),
(1001,213,'ad_unit','Finance'),
(1002,214,'ad_unit','Perfomance Monitoring - Central'),
(1003,215,'ad_unit','ED Office'),
(1004,216,'ad_unit','HR and Admin'),
(1005,217,'ad_unit','HR and Admin'),
(1006,218,'ad_unit','Performance Monitoring - Regional Offices'),
(1007,219,'ad_unit','Gulu Regional Office'),
(1008,220,'ad_unit','Perfomance Monitoring - Central'),
(1009,221,'ad_unit','Perfomance Monitoring - Central'),
(1010,222,'ad_unit','Mbarara Regional Office'),
(1011,223,'ad_unit','Finance'),
(1012,224,'ad_unit','Perfomance Monitoring - Central'),
(1013,225,'ad_unit','HR and Admin'),
(1014,226,'ad_unit','Research'),
(1015,227,'ad_unit','Finance'),
(1016,228,'ad_unit','Gulu Regional Office'),
(1017,229,'ad_unit','Finance'),
(1018,230,'ad_unit','ED Office'),
(1019,231,'ad_unit','Gulu Regional Office'),
(1020,232,'ad_unit','Planning'),
(1021,233,'ad_unit','Mbarara Regional Office'),
(1022,234,'ad_unit','ED Office'),
(1023,235,'ad_unit','Perfomance Monitoring - Central'),
(1024,236,'ad_unit','Finance'),
(1025,237,'ad_unit','Perfomance Monitoring - Central'),
(1026,238,'ad_unit','Resource Mobilisation'),
(1027,239,'ad_unit','Legal and Board Affairs'),
(1028,240,'ad_unit','Library'),
(1029,241,'ad_unit','Perfomance Monitoring - Central'),
(1030,242,'ad_unit','Central Regional Office'),
(1031,243,'ad_unit','ED Office'),
(1032,244,'ad_unit','ED Office'),
(1033,245,'ad_unit','Perfomance Monitoring - Central'),
(1034,246,'ad_unit','Perfomance Monitoring - Central'),
(1035,247,'ad_unit','ED Office'),
(1036,248,'ad_unit','Gulu Regional Office'),
(1037,249,'ad_unit','HR and Admin'),
(1038,250,'ad_unit','Library'),
(1039,251,'ad_unit','Library'),
(1040,252,'ad_unit','Perfomance Monitoring - Central'),
(1041,253,'ad_unit','Legal and Board Affairs'),
(1042,254,'ad_unit','Perfomance Monitoring - Central'),
(1043,255,'ad_unit','Internal Audit'),
(1045,257,'ad_unit','Perfomance Monitoring - Central'),
(1046,258,'ad_unit','Perfomance Monitoring - Central'),
(1047,259,'ad_unit','Mbarara Regional Office'),
(1048,260,'ad_unit','ED Office'),
(1049,261,'ad_unit','Mbarara Regional Office'),
(1050,262,'ad_unit','Mbarara Regional Office'),
(1051,263,'ad_unit','Perfomance Monitoring - Central'),
(1052,264,'ad_unit','ICT Unit'),
(1053,265,'ad_unit','ICT Unit'),
(1054,266,'ad_unit','ED Office'),
(1055,267,'ad_unit','Perfomance Monitoring - Central'),
(1056,268,'ad_unit','Central Regional Office'),
(1057,269,'ad_unit','Performance Monitoring - Regional Offices'),
(1058,270,'ad_unit','Mbarara Regional Office'),
(1059,271,'ad_unit','HR and Admin'),
(1060,272,'ad_unit','ICT Unit'),
(1061,186,'_latest_approval',NULL),
(1062,144,'hourly_rate','0'),
(1063,144,'internal_rate',NULL),
(1064,144,'timezone','Africa/Kampala'),
(1065,144,'language','en'),
(1066,144,'locale','en'),
(1067,144,'first_weekday','monday'),
(1068,144,'skin','auto'),
(1069,144,'update_browser_title','1'),
(1070,144,'calendar_initial_view','month'),
(1071,144,'login_initial_view','timesheet'),
(1072,144,'favorite_routes',''),
(1073,144,'daily_stats',''),
(1074,144,'export_decimal',''),
(1075,144,'__wizards__','intro,profile'),
(1076,144,'_latest_approval',NULL),
(1077,62,'hourly_rate','0'),
(1078,62,'internal_rate',NULL),
(1079,62,'timezone','Africa/Kampala'),
(1080,62,'language','en'),
(1081,62,'locale','en'),
(1082,62,'first_weekday','monday'),
(1083,62,'skin','auto'),
(1084,62,'update_browser_title','1'),
(1085,62,'calendar_initial_view','month'),
(1086,62,'login_initial_view','timesheet'),
(1087,62,'favorite_routes',''),
(1088,62,'daily_stats',''),
(1089,62,'export_decimal',''),
(1090,62,'__wizards__','intro,profile'),
(1091,265,'hourly_rate','0'),
(1092,265,'internal_rate',NULL),
(1093,265,'timezone','Africa/Kampala'),
(1094,265,'language','en'),
(1095,265,'locale','en'),
(1096,265,'first_weekday','monday'),
(1097,265,'skin','auto'),
(1098,265,'update_browser_title','1'),
(1099,265,'calendar_initial_view','month'),
(1100,265,'login_initial_view','timesheet'),
(1101,265,'favorite_routes',''),
(1102,265,'daily_stats',''),
(1103,265,'export_decimal',''),
(1104,265,'__wizards__','intro,profile'),
(1105,120,'hourly_rate','0'),
(1106,120,'internal_rate',NULL),
(1107,120,'timezone','Africa/Kampala'),
(1108,120,'language','en'),
(1109,120,'locale','en'),
(1110,120,'first_weekday','monday'),
(1111,120,'skin','auto'),
(1112,120,'update_browser_title','1'),
(1113,120,'calendar_initial_view','month'),
(1114,120,'login_initial_view','timesheet'),
(1115,120,'favorite_routes',''),
(1116,120,'daily_stats',''),
(1117,120,'export_decimal',''),
(1118,120,'__wizards__','intro,profile'),
(1119,61,'hourly_rate','0'),
(1120,61,'internal_rate',NULL),
(1121,61,'timezone','Africa/Kampala'),
(1122,61,'language','en'),
(1123,61,'locale','en'),
(1124,61,'first_weekday','monday'),
(1125,61,'skin','auto'),
(1126,61,'update_browser_title','1'),
(1127,61,'calendar_initial_view','month'),
(1128,61,'login_initial_view','timesheet'),
(1129,61,'favorite_routes',''),
(1130,61,'daily_stats',''),
(1131,61,'export_decimal',''),
(1132,61,'__wizards__','intro,profile'),
(1133,265,'_latest_approval',NULL),
(1134,62,'_latest_approval',NULL),
(1135,273,'_latest_approval',NULL),
(1136,225,'hourly_rate','0'),
(1137,225,'internal_rate',NULL),
(1138,225,'timezone','Africa/Kampala'),
(1139,225,'language','en'),
(1140,225,'locale','en'),
(1141,225,'first_weekday','monday'),
(1142,225,'skin','auto'),
(1143,225,'update_browser_title','1'),
(1144,225,'calendar_initial_view','month'),
(1145,225,'login_initial_view','timesheet'),
(1146,225,'favorite_routes',''),
(1147,225,'daily_stats',''),
(1148,225,'export_decimal',''),
(1149,225,'__wizards__','intro,profile'),
(1150,203,'hourly_rate','0'),
(1151,203,'internal_rate',NULL),
(1152,203,'timezone','Africa/Kampala'),
(1153,203,'language','en'),
(1154,203,'locale','en'),
(1155,203,'first_weekday','monday'),
(1156,203,'skin','auto'),
(1157,203,'update_browser_title','1'),
(1158,203,'calendar_initial_view','month'),
(1159,203,'login_initial_view','timesheet'),
(1160,203,'favorite_routes',''),
(1161,203,'daily_stats',''),
(1162,203,'export_decimal',''),
(1163,203,'__wizards__','intro,profile'),
(1164,203,'_latest_approval',NULL),
(1165,212,'hourly_rate','0'),
(1166,212,'internal_rate',NULL),
(1167,212,'timezone','Africa/Kampala'),
(1168,212,'language','en'),
(1169,212,'locale','en'),
(1170,212,'first_weekday','monday'),
(1171,212,'skin','auto'),
(1172,212,'update_browser_title','1'),
(1173,212,'calendar_initial_view','month'),
(1174,212,'login_initial_view','timesheet'),
(1175,212,'favorite_routes',''),
(1176,212,'daily_stats',''),
(1177,212,'export_decimal',''),
(1178,212,'__wizards__','intro,profile'),
(1179,212,'_latest_approval',NULL),
(1180,225,'_latest_approval',NULL),
(1181,226,'hourly_rate','0'),
(1182,226,'internal_rate',NULL),
(1183,226,'timezone','Africa/Kampala'),
(1184,226,'language','en'),
(1185,226,'locale','en'),
(1186,226,'first_weekday','monday'),
(1187,226,'skin','auto'),
(1188,226,'update_browser_title','1'),
(1189,226,'calendar_initial_view','month'),
(1190,226,'login_initial_view','timesheet'),
(1191,226,'favorite_routes',''),
(1192,226,'daily_stats',''),
(1193,226,'export_decimal',''),
(1194,226,'__wizards__','intro,profile'),
(1195,106,'hourly_rate','0'),
(1196,106,'internal_rate',NULL),
(1197,106,'timezone','Africa/Kampala'),
(1198,106,'language','en'),
(1199,106,'locale','en'),
(1200,106,'first_weekday','monday'),
(1201,106,'skin','auto'),
(1202,106,'update_browser_title','1'),
(1203,106,'calendar_initial_view','month'),
(1204,106,'login_initial_view','timesheet'),
(1205,106,'favorite_routes',''),
(1206,106,'daily_stats',''),
(1207,106,'export_decimal',''),
(1208,106,'__wizards__','intro,profile'),
(1209,216,'hourly_rate','0'),
(1210,216,'internal_rate',NULL),
(1211,216,'timezone','Africa/Kampala'),
(1212,216,'language','en'),
(1213,216,'locale','en'),
(1214,216,'first_weekday','monday'),
(1215,216,'skin','auto'),
(1216,216,'update_browser_title','1'),
(1217,216,'calendar_initial_view','month'),
(1218,216,'login_initial_view','timesheet'),
(1219,216,'favorite_routes',''),
(1220,216,'daily_stats',''),
(1221,216,'export_decimal',''),
(1222,216,'__wizards__','intro,profile'),
(1223,190,'hourly_rate','0'),
(1224,190,'internal_rate',NULL),
(1225,190,'timezone','Africa/Kampala'),
(1226,190,'language','en'),
(1227,190,'locale','en'),
(1228,190,'first_weekday','monday'),
(1229,190,'skin','auto'),
(1230,190,'update_browser_title','1'),
(1231,190,'calendar_initial_view','month'),
(1232,190,'login_initial_view','timesheet'),
(1233,190,'favorite_routes',''),
(1234,190,'daily_stats',''),
(1235,190,'export_decimal',''),
(1236,190,'__wizards__','intro,profile'),
(1237,133,'hourly_rate','0'),
(1238,133,'internal_rate',NULL),
(1239,133,'timezone','Africa/Kampala'),
(1240,133,'language','en'),
(1241,133,'locale','en'),
(1242,133,'first_weekday','monday'),
(1243,133,'skin','auto'),
(1244,133,'update_browser_title','1'),
(1245,133,'calendar_initial_view','month'),
(1246,133,'login_initial_view','timesheet'),
(1247,133,'favorite_routes',''),
(1248,133,'daily_stats',''),
(1249,133,'export_decimal',''),
(1250,133,'__wizards__','intro,profile'),
(1251,217,'hourly_rate','0'),
(1252,217,'internal_rate',NULL),
(1253,217,'timezone','Africa/Kampala'),
(1254,217,'language','en'),
(1255,217,'locale','en'),
(1256,217,'first_weekday','monday'),
(1257,217,'skin','auto'),
(1258,217,'update_browser_title','1'),
(1259,217,'calendar_initial_view','month'),
(1260,217,'login_initial_view','timesheet'),
(1261,217,'favorite_routes',''),
(1262,217,'daily_stats',''),
(1263,217,'export_decimal',''),
(1264,217,'__wizards__','intro,profile'),
(1265,163,'hourly_rate','0'),
(1266,163,'internal_rate',NULL),
(1267,163,'timezone','Africa/Kampala'),
(1268,163,'language','en'),
(1269,163,'locale','en'),
(1270,163,'first_weekday','monday'),
(1271,163,'skin','auto'),
(1272,163,'update_browser_title','1'),
(1273,163,'calendar_initial_view','month'),
(1274,163,'login_initial_view','timesheet'),
(1275,163,'favorite_routes',''),
(1276,163,'daily_stats',''),
(1277,163,'export_decimal',''),
(1278,163,'__wizards__','intro,profile'),
(1279,227,'hourly_rate','0'),
(1280,227,'internal_rate',NULL),
(1281,227,'timezone','Africa/Kampala'),
(1282,227,'language','en'),
(1283,227,'locale','en'),
(1284,227,'first_weekday','monday'),
(1285,227,'skin','auto'),
(1286,227,'update_browser_title','1'),
(1287,227,'calendar_initial_view','month'),
(1288,227,'login_initial_view','timesheet'),
(1289,227,'favorite_routes',''),
(1290,227,'daily_stats',''),
(1291,227,'export_decimal',''),
(1292,227,'__wizards__','intro,profile'),
(1293,137,'hourly_rate','0'),
(1294,137,'internal_rate',NULL),
(1295,137,'timezone','Africa/Kampala'),
(1296,137,'language','en'),
(1297,137,'locale','en'),
(1298,137,'first_weekday','monday'),
(1299,137,'skin','auto'),
(1300,137,'update_browser_title','1'),
(1301,137,'calendar_initial_view','month'),
(1302,137,'login_initial_view','timesheet'),
(1303,137,'favorite_routes',''),
(1304,137,'daily_stats',''),
(1305,137,'export_decimal',''),
(1306,137,'__wizards__','intro,profile'),
(1307,236,'hourly_rate','0'),
(1308,236,'internal_rate',NULL),
(1309,236,'timezone','Africa/Kampala'),
(1310,236,'language','en'),
(1311,236,'locale','en'),
(1312,236,'first_weekday','monday'),
(1313,236,'skin','auto'),
(1314,236,'update_browser_title','1'),
(1315,236,'calendar_initial_view','month'),
(1316,236,'login_initial_view','timesheet'),
(1317,236,'favorite_routes',''),
(1318,236,'daily_stats',''),
(1319,236,'export_decimal',''),
(1320,236,'__wizards__','intro,profile'),
(1321,61,'_latest_approval',NULL),
(1322,213,'hourly_rate','0'),
(1323,213,'internal_rate',NULL),
(1324,213,'timezone','Africa/Kampala'),
(1325,213,'language','en'),
(1326,213,'locale','en'),
(1327,213,'first_weekday','monday'),
(1328,213,'skin','auto'),
(1329,213,'update_browser_title','1'),
(1330,213,'calendar_initial_view','month'),
(1331,213,'login_initial_view','timesheet'),
(1332,213,'favorite_routes',''),
(1333,213,'daily_stats',''),
(1334,213,'export_decimal',''),
(1335,213,'__wizards__','intro,profile'),
(1336,208,'hourly_rate','0'),
(1337,208,'internal_rate',NULL),
(1338,208,'timezone','Africa/Kampala'),
(1339,208,'language','en'),
(1340,208,'locale','en'),
(1341,208,'first_weekday','monday'),
(1342,208,'skin','auto'),
(1343,208,'update_browser_title','1'),
(1344,208,'calendar_initial_view','month'),
(1345,208,'login_initial_view','timesheet'),
(1346,208,'favorite_routes',''),
(1347,208,'daily_stats',''),
(1348,208,'export_decimal',''),
(1349,208,'__wizards__','intro,profile'),
(1350,257,'hourly_rate','0'),
(1351,257,'internal_rate',NULL),
(1352,257,'timezone','Africa/Kampala'),
(1353,257,'language','en'),
(1354,257,'locale','en'),
(1355,257,'first_weekday','monday'),
(1356,257,'skin','auto'),
(1357,257,'update_browser_title','1'),
(1358,257,'calendar_initial_view','month'),
(1359,257,'login_initial_view','timesheet'),
(1360,257,'favorite_routes',''),
(1361,257,'daily_stats',''),
(1362,257,'export_decimal',''),
(1363,257,'__wizards__','intro,profile'),
(1435,134,'hourly_rate','0'),
(1436,134,'internal_rate',NULL),
(1437,134,'timezone','Africa/Kampala'),
(1438,134,'language','en'),
(1439,134,'locale','en'),
(1440,134,'first_weekday','monday'),
(1441,134,'skin','auto'),
(1442,134,'update_browser_title','1'),
(1443,134,'calendar_initial_view','month'),
(1444,134,'login_initial_view','timesheet'),
(1445,134,'favorite_routes',''),
(1446,134,'daily_stats',''),
(1447,134,'export_decimal',''),
(1448,134,'__wizards__','intro,profile'),
(1452,230,'hourly_rate','0'),
(1453,230,'internal_rate',NULL),
(1454,230,'timezone','Africa/Kampala'),
(1455,230,'language','en'),
(1456,230,'locale','en'),
(1457,230,'first_weekday','monday'),
(1458,230,'skin','auto'),
(1459,230,'update_browser_title','1'),
(1460,230,'calendar_initial_view','month'),
(1461,230,'login_initial_view','timesheet'),
(1462,230,'favorite_routes',''),
(1463,230,'daily_stats',''),
(1464,230,'export_decimal',''),
(1465,230,'__wizards__','intro,profile'),
(1466,249,'hourly_rate','0'),
(1467,249,'internal_rate',NULL),
(1468,249,'timezone','Africa/Kampala'),
(1469,249,'language','en'),
(1470,249,'locale','en'),
(1471,249,'first_weekday','monday'),
(1472,249,'skin','auto'),
(1473,249,'update_browser_title','1'),
(1474,249,'calendar_initial_view','month'),
(1475,249,'login_initial_view','timesheet'),
(1476,249,'favorite_routes',''),
(1477,249,'daily_stats',''),
(1478,249,'export_decimal',''),
(1479,249,'__wizards__','intro,profile'),
(1480,221,'hourly_rate','0'),
(1481,221,'internal_rate',NULL),
(1482,221,'timezone','Africa/Kampala'),
(1483,221,'language','en'),
(1484,221,'locale','en'),
(1485,221,'first_weekday','monday'),
(1486,221,'skin','auto'),
(1487,221,'update_browser_title','1'),
(1488,221,'calendar_initial_view','month'),
(1489,221,'login_initial_view','timesheet'),
(1490,221,'favorite_routes',''),
(1491,221,'daily_stats',''),
(1492,221,'export_decimal',''),
(1493,221,'__wizards__','intro'),
(1494,160,'hourly_rate','0'),
(1495,160,'internal_rate',NULL),
(1496,160,'timezone','Africa/Kampala'),
(1497,160,'language','en'),
(1498,160,'locale','en'),
(1499,160,'first_weekday','monday'),
(1500,160,'skin','auto'),
(1501,160,'update_browser_title','1'),
(1502,160,'calendar_initial_view','month'),
(1503,160,'login_initial_view','timesheet'),
(1504,160,'favorite_routes',''),
(1505,160,'daily_stats',''),
(1506,160,'export_decimal',''),
(1507,160,'__wizards__','intro'),
(1508,244,'hourly_rate','0'),
(1509,244,'internal_rate',NULL),
(1510,244,'timezone','Africa/Kampala'),
(1511,244,'language','en'),
(1512,244,'locale','en'),
(1513,244,'first_weekday','monday'),
(1514,244,'skin','auto'),
(1515,244,'update_browser_title','1'),
(1516,244,'calendar_initial_view','month'),
(1517,244,'login_initial_view','timesheet'),
(1518,244,'favorite_routes',''),
(1519,244,'daily_stats',''),
(1520,244,'export_decimal',''),
(1521,244,'__wizards__','intro,profile'),
(1522,267,'hourly_rate','0'),
(1523,267,'internal_rate',NULL),
(1524,267,'timezone','Africa/Kampala'),
(1525,267,'language','en'),
(1526,267,'locale','en'),
(1527,267,'first_weekday','monday'),
(1528,267,'skin','auto'),
(1529,267,'update_browser_title','1'),
(1530,267,'calendar_initial_view','month'),
(1531,267,'login_initial_view','timesheet'),
(1532,267,'favorite_routes',''),
(1533,267,'daily_stats',''),
(1534,267,'export_decimal',''),
(1535,267,'__wizards__','intro,profile'),
(1536,264,'hourly_rate','0'),
(1537,264,'internal_rate',NULL),
(1538,264,'timezone','Africa/Kampala'),
(1539,264,'language','en'),
(1540,264,'locale','en'),
(1541,264,'first_weekday','monday'),
(1542,264,'skin','auto'),
(1543,264,'update_browser_title','1'),
(1544,264,'calendar_initial_view','month'),
(1545,264,'login_initial_view','timesheet'),
(1546,264,'favorite_routes',''),
(1547,264,'daily_stats',''),
(1548,264,'export_decimal',''),
(1549,264,'__wizards__','intro,profile'),
(1550,280,'ldap_dn','CN=Emily Kemigisha,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1551,281,'ldap_dn','CN=Jordan Mujuni,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1552,220,'hourly_rate','0'),
(1553,220,'internal_rate',NULL),
(1554,220,'timezone','Africa/Kampala'),
(1555,220,'language','en'),
(1556,220,'locale','en'),
(1557,220,'first_weekday','monday'),
(1558,220,'skin','auto'),
(1559,220,'update_browser_title','1'),
(1560,220,'calendar_initial_view','month'),
(1561,220,'login_initial_view','timesheet'),
(1562,220,'favorite_routes',''),
(1563,220,'daily_stats',''),
(1564,220,'export_decimal',''),
(1565,220,'__wizards__','intro,profile'),
(1566,93,'hourly_rate','0'),
(1567,93,'internal_rate',NULL),
(1568,93,'timezone','Africa/Kampala'),
(1569,93,'language','en'),
(1570,93,'locale','en'),
(1571,93,'first_weekday','monday'),
(1572,93,'skin','auto'),
(1573,93,'update_browser_title','1'),
(1574,93,'calendar_initial_view','month'),
(1575,93,'login_initial_view','timesheet'),
(1576,93,'favorite_routes',''),
(1577,93,'daily_stats',''),
(1578,93,'export_decimal',''),
(1579,93,'__wizards__','intro,profile'),
(1580,176,'hourly_rate','0'),
(1581,176,'internal_rate',NULL),
(1582,176,'timezone','Africa/Kampala'),
(1583,176,'language','en'),
(1584,176,'locale','en'),
(1585,176,'first_weekday','monday'),
(1586,176,'skin','auto'),
(1587,176,'update_browser_title','1'),
(1588,176,'calendar_initial_view','month'),
(1589,176,'login_initial_view','timesheet'),
(1590,176,'favorite_routes',''),
(1591,176,'daily_stats',''),
(1592,176,'export_decimal',''),
(1593,176,'__wizards__','intro,profile'),
(1594,167,'hourly_rate','0'),
(1595,167,'internal_rate',NULL),
(1596,167,'timezone','Africa/Kampala'),
(1597,167,'language','en'),
(1598,167,'locale','en'),
(1599,167,'first_weekday','monday'),
(1600,167,'skin','auto'),
(1601,167,'update_browser_title','1'),
(1602,167,'calendar_initial_view','month'),
(1603,167,'login_initial_view','timesheet'),
(1604,167,'favorite_routes',''),
(1605,167,'daily_stats',''),
(1606,167,'export_decimal',''),
(1607,167,'__wizards__','intro,profile'),
(1608,234,'hourly_rate','0'),
(1609,234,'internal_rate',NULL),
(1610,234,'timezone','Africa/Kampala'),
(1611,234,'language','en'),
(1612,234,'locale','en'),
(1613,234,'first_weekday','monday'),
(1614,234,'skin','auto'),
(1615,234,'update_browser_title','1'),
(1616,234,'calendar_initial_view','month'),
(1617,234,'login_initial_view','timesheet'),
(1618,234,'favorite_routes',''),
(1619,234,'daily_stats',''),
(1620,234,'export_decimal',''),
(1621,234,'__wizards__','intro,profile'),
(1622,215,'hourly_rate','0'),
(1623,215,'internal_rate',NULL),
(1624,215,'timezone','Africa/Kampala'),
(1625,215,'language','en'),
(1626,215,'locale','en'),
(1627,215,'first_weekday','monday'),
(1628,215,'skin','auto'),
(1629,215,'update_browser_title','1'),
(1630,215,'calendar_initial_view','month'),
(1631,215,'login_initial_view','timesheet'),
(1632,215,'favorite_routes',''),
(1633,215,'daily_stats',''),
(1634,215,'export_decimal',''),
(1635,215,'__wizards__','intro,profile'),
(1636,228,'hourly_rate','0'),
(1637,228,'internal_rate',NULL),
(1638,228,'timezone','Africa/Kampala'),
(1639,228,'language','en'),
(1640,228,'locale','en'),
(1641,228,'first_weekday','monday'),
(1642,228,'skin','auto'),
(1643,228,'update_browser_title','1'),
(1644,228,'calendar_initial_view','month'),
(1645,228,'login_initial_view','timesheet'),
(1646,228,'favorite_routes',''),
(1647,228,'daily_stats',''),
(1648,228,'export_decimal',''),
(1649,228,'__wizards__','intro,profile'),
(1650,96,'hourly_rate','0'),
(1651,96,'internal_rate',NULL),
(1652,96,'timezone','Africa/Kampala'),
(1653,96,'language','en'),
(1654,96,'locale','en'),
(1655,96,'first_weekday','monday'),
(1656,96,'skin','auto'),
(1657,96,'update_browser_title','1'),
(1658,96,'calendar_initial_view','month'),
(1659,96,'login_initial_view','timesheet'),
(1660,96,'favorite_routes',''),
(1661,96,'daily_stats',''),
(1662,96,'export_decimal',''),
(1663,96,'__wizards__','intro,profile'),
(1664,241,'hourly_rate','0'),
(1665,241,'internal_rate',NULL),
(1666,241,'timezone','Africa/Kampala'),
(1667,241,'language','en'),
(1668,241,'locale','en'),
(1669,241,'first_weekday','monday'),
(1670,241,'skin','auto'),
(1671,241,'update_browser_title','1'),
(1672,241,'calendar_initial_view','month'),
(1673,241,'login_initial_view','timesheet'),
(1674,241,'favorite_routes',''),
(1675,241,'daily_stats',''),
(1676,241,'export_decimal',''),
(1677,241,'__wizards__','intro,profile'),
(1678,124,'hourly_rate','0'),
(1679,124,'internal_rate',NULL),
(1680,124,'timezone','Africa/Kampala'),
(1681,124,'language','en'),
(1682,124,'locale','en'),
(1683,124,'first_weekday','monday'),
(1684,124,'skin','auto'),
(1685,124,'update_browser_title','1'),
(1686,124,'calendar_initial_view','month'),
(1687,124,'login_initial_view','timesheet'),
(1688,124,'favorite_routes',''),
(1689,124,'daily_stats',''),
(1690,124,'export_decimal',''),
(1691,124,'__wizards__','intro,profile'),
(1692,170,'hourly_rate','0'),
(1693,170,'internal_rate',NULL),
(1694,170,'timezone','Africa/Kampala'),
(1695,170,'language','en'),
(1696,170,'locale','en'),
(1697,170,'first_weekday','monday'),
(1698,170,'skin','auto'),
(1699,170,'update_browser_title','1'),
(1700,170,'calendar_initial_view','month'),
(1701,170,'login_initial_view','timesheet'),
(1702,170,'favorite_routes',''),
(1703,170,'daily_stats',''),
(1704,170,'export_decimal',''),
(1705,170,'__wizards__','intro,profile'),
(1706,158,'hourly_rate','0'),
(1707,158,'internal_rate',NULL),
(1708,158,'timezone','Africa/Kampala'),
(1709,158,'language','en'),
(1710,158,'locale','en'),
(1711,158,'first_weekday','monday'),
(1712,158,'skin','auto'),
(1713,158,'update_browser_title','1'),
(1714,158,'calendar_initial_view','month'),
(1715,158,'login_initial_view','timesheet'),
(1716,158,'favorite_routes',''),
(1717,158,'daily_stats',''),
(1718,158,'export_decimal',''),
(1719,158,'__wizards__','intro,profile'),
(1720,180,'hourly_rate','0'),
(1721,180,'internal_rate',NULL),
(1722,180,'timezone','Africa/Kampala'),
(1723,180,'language','en'),
(1724,180,'locale','en'),
(1725,180,'first_weekday','monday'),
(1726,180,'skin','auto'),
(1727,180,'update_browser_title','1'),
(1728,180,'calendar_initial_view','month'),
(1729,180,'login_initial_view','timesheet'),
(1730,180,'favorite_routes',''),
(1731,180,'daily_stats',''),
(1732,180,'export_decimal',''),
(1733,180,'__wizards__','intro,profile'),
(1734,91,'hourly_rate','0'),
(1735,91,'internal_rate',NULL),
(1736,91,'timezone','Africa/Kampala'),
(1737,91,'language','en'),
(1738,91,'locale','en'),
(1739,91,'first_weekday','monday'),
(1740,91,'skin','dark'),
(1741,91,'update_browser_title','1'),
(1742,91,'calendar_initial_view','month'),
(1743,91,'login_initial_view','timesheet'),
(1744,91,'favorite_routes',''),
(1745,91,'daily_stats',''),
(1746,91,'export_decimal',''),
(1747,91,'__wizards__','intro,profile'),
(1748,252,'hourly_rate','0'),
(1749,252,'internal_rate',NULL),
(1750,252,'timezone','Africa/Kampala'),
(1751,252,'language','en'),
(1752,252,'locale','en'),
(1753,252,'first_weekday','monday'),
(1754,252,'skin','auto'),
(1755,252,'update_browser_title','1'),
(1756,252,'calendar_initial_view','month'),
(1757,252,'login_initial_view','timesheet'),
(1758,252,'favorite_routes',''),
(1759,252,'daily_stats',''),
(1760,252,'export_decimal',''),
(1761,252,'__wizards__','intro,profile'),
(1762,209,'hourly_rate','0'),
(1763,209,'internal_rate',NULL),
(1764,209,'timezone','Africa/Kampala'),
(1765,209,'language','en'),
(1766,209,'locale','en'),
(1767,209,'first_weekday','monday'),
(1768,209,'skin','auto'),
(1769,209,'update_browser_title','1'),
(1770,209,'calendar_initial_view','month'),
(1771,209,'login_initial_view','timesheet'),
(1772,209,'favorite_routes',''),
(1773,209,'daily_stats',''),
(1774,209,'export_decimal',''),
(1775,209,'__wizards__','intro,profile'),
(1776,119,'hourly_rate','0'),
(1777,119,'internal_rate',NULL),
(1778,119,'timezone','Africa/Kampala'),
(1779,119,'language','en'),
(1780,119,'locale','en'),
(1781,119,'first_weekday','monday'),
(1782,119,'skin','auto'),
(1783,119,'update_browser_title','1'),
(1784,119,'calendar_initial_view','month'),
(1785,119,'login_initial_view','timesheet'),
(1786,119,'favorite_routes',''),
(1787,119,'daily_stats',''),
(1788,119,'export_decimal',''),
(1789,119,'__wizards__','intro,profile'),
(1790,161,'hourly_rate','0'),
(1791,161,'internal_rate',NULL),
(1792,161,'timezone','Africa/Kampala'),
(1793,161,'language','en'),
(1794,161,'locale','en'),
(1795,161,'first_weekday','monday'),
(1796,161,'skin','auto'),
(1797,161,'update_browser_title','1'),
(1798,161,'calendar_initial_view','month'),
(1799,161,'login_initial_view','timesheet'),
(1800,161,'favorite_routes',''),
(1801,161,'daily_stats',''),
(1802,161,'export_decimal',''),
(1803,161,'__wizards__','intro,profile'),
(1804,248,'hourly_rate','0'),
(1805,248,'internal_rate',NULL),
(1806,248,'timezone','Africa/Kampala'),
(1807,248,'language','en'),
(1808,248,'locale','en'),
(1809,248,'first_weekday','monday'),
(1810,248,'skin','auto'),
(1811,248,'update_browser_title','1'),
(1812,248,'calendar_initial_view','month'),
(1813,248,'login_initial_view','timesheet'),
(1814,248,'favorite_routes',''),
(1815,248,'daily_stats',''),
(1816,248,'export_decimal',''),
(1817,248,'__wizards__','intro,profile'),
(1818,88,'hourly_rate','0'),
(1819,88,'internal_rate',NULL),
(1820,88,'timezone','Africa/Kampala'),
(1821,88,'language','en'),
(1822,88,'locale','en'),
(1823,88,'first_weekday','monday'),
(1824,88,'skin','auto'),
(1825,88,'update_browser_title','1'),
(1826,88,'calendar_initial_view','month'),
(1827,88,'login_initial_view','timesheet'),
(1828,88,'favorite_routes',''),
(1829,88,'daily_stats',''),
(1830,88,'export_decimal',''),
(1831,88,'__wizards__','intro,profile'),
(1832,286,'ldap_dn','CN=Administrator,CN=Users,DC=ppda,DC=go,DC=ug'),
(1833,287,'ldap_dn','CN=Vale Buyondo,OU=Super Users,DC=ppda,DC=go,DC=ug'),
(1834,287,'ad_ou','Super Users'),
(1835,288,'ldap_dn','CN=Viva Mugisha,OU=Super Users,DC=ppda,DC=go,DC=ug'),
(1836,288,'ad_ou','Super Users'),
(1837,281,'ad_ou','Departments > Finance'),
(1838,281,'ad_unit','Finance'),
(1839,280,'ad_ou','Departments > Finance'),
(1840,280,'ad_unit','Finance'),
(1841,289,'ldap_dn','CN=John Ssekamatte,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1842,289,'ad_ou','Departments > Finance'),
(1843,289,'ad_unit','Finance'),
(1844,290,'ldap_dn','CN=Jenipher Kaggwa,OU=Super Users,DC=ppda,DC=go,DC=ug'),
(1845,290,'ad_ou','Super Users'),
(1846,291,'ldap_dn','CN=Wilson Byekwaso,OU=Super Users,DC=ppda,DC=go,DC=ug'),
(1847,291,'ad_ou','Super Users'),
(1848,292,'ldap_dn','CN=app-server LDAP,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(1849,292,'ad_ou','Service Accounts'),
(1850,293,'ldap_dn','CN=intern-proc Intern Procurement,CN=Users,DC=ppda,DC=go,DC=ug'),
(1851,294,'ldap_dn','CN=Drivers,CN=Users,DC=ppda,DC=go,DC=ug'),
(1852,295,'ldap_dn','CN=Intern admin,CN=Users,DC=ppda,DC=go,DC=ug'),
(1853,296,'ldap_dn','CN=intern hr,CN=Users,DC=ppda,DC=go,DC=ug'),
(1854,297,'ldap_dn','CN=Ibrahim Katumba,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(1855,297,'ad_ou','Disabled > Users'),
(1856,298,'ldap_dn','CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(1857,298,'ad_ou','Service Accounts'),
(1858,299,'ldap_dn','CN=Test Ito,OU=Users,OU=Disabled,DC=ppda,DC=go,DC=ug'),
(1859,299,'ad_ou','Disabled > Users'),
(1860,300,'ldap_dn','CN=intern pm,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1861,300,'ad_ou','Departments > Perfomance Monitoring - Central'),
(1862,300,'ad_unit','Perfomance Monitoring - Central'),
(1863,301,'ldap_dn','CN=Finance Intern,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1864,301,'ad_ou','Departments > Finance'),
(1865,301,'ad_unit','Finance'),
(1866,302,'ldap_dn','CN=Kayla Nkinzi,OU=ICT Unit,OU=Strategy and Planning,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1867,302,'ad_ou','Departments > Strategy and Planning > ICT Unit'),
(1868,302,'ad_unit','ICT Unit'),
(1869,303,'ldap_dn','CN=Josephine Nangeso,OU=Finance,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1870,303,'ad_ou','Departments > Finance'),
(1871,303,'ad_unit','Finance'),
(1872,304,'ldap_dn','CN=Travor Abaho,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1873,304,'ad_ou','Departments > Perfomance Monitoring - Central'),
(1874,304,'ad_unit','Perfomance Monitoring - Central'),
(1875,305,'ldap_dn','CN=Noel Nakimera,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1876,305,'ad_ou','Departments > Perfomance Monitoring - Central'),
(1877,305,'ad_unit','Perfomance Monitoring - Central'),
(1878,306,'ldap_dn','CN=Daphine Nakimera,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1879,306,'ad_ou','Departments > Perfomance Monitoring - Central'),
(1880,306,'ad_unit','Perfomance Monitoring - Central'),
(1881,307,'ldap_dn','CN=Emmanuel Atukunzire,OU=Perfomance Monitoring - Central,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1882,307,'ad_ou','Departments > Perfomance Monitoring - Central'),
(1883,307,'ad_unit','Perfomance Monitoring - Central'),
(1884,308,'ldap_dn','CN=Elton Zoora Agaba,OU=Procurment Capacity Building,OU=Departments,DC=ppda,DC=go,DC=ug'),
(1885,308,'ad_ou','Departments > Procurment Capacity Building'),
(1886,308,'ad_unit','Procurment Capacity Building'),
(1887,309,'ldap_dn','CN=svc-vsphere,OU=Service Accounts,DC=ppda,DC=go,DC=ug'),
(1888,309,'ad_ou','Service Accounts'),
(1889,231,'hourly_rate','0'),
(1890,231,'internal_rate',NULL),
(1891,231,'timezone','Africa/Kampala'),
(1892,231,'language','en'),
(1893,231,'locale','en'),
(1894,231,'first_weekday','monday'),
(1895,231,'skin','auto'),
(1896,231,'update_browser_title','1'),
(1897,231,'calendar_initial_view','month'),
(1898,231,'login_initial_view','timesheet'),
(1899,231,'favorite_routes',''),
(1900,231,'daily_stats',''),
(1901,231,'export_decimal',''),
(1902,231,'__wizards__','intro,profile'),
(1903,162,'hourly_rate','0'),
(1904,162,'internal_rate',NULL),
(1905,162,'timezone','Africa/Kampala'),
(1906,162,'language','en'),
(1907,162,'locale','en'),
(1908,162,'first_weekday','monday'),
(1909,162,'skin','auto'),
(1910,162,'update_browser_title','1'),
(1911,162,'calendar_initial_view','month'),
(1912,162,'login_initial_view','timesheet'),
(1913,162,'favorite_routes',''),
(1914,162,'daily_stats',''),
(1915,162,'export_decimal',''),
(1916,162,'__wizards__','intro,profile'),
(1917,218,'hourly_rate','0'),
(1918,218,'internal_rate',NULL),
(1919,218,'timezone','Africa/Kampala'),
(1920,218,'language','en'),
(1921,218,'locale','en'),
(1922,218,'first_weekday','monday'),
(1923,218,'skin','auto'),
(1924,218,'update_browser_title','1'),
(1925,218,'calendar_initial_view','month'),
(1926,218,'login_initial_view','timesheet'),
(1927,218,'favorite_routes',''),
(1928,218,'daily_stats',''),
(1929,218,'export_decimal',''),
(1930,218,'__wizards__','intro,profile'),
(1931,271,'hourly_rate','0'),
(1932,271,'internal_rate',NULL),
(1933,271,'timezone','Africa/Kampala'),
(1934,271,'language','en'),
(1935,271,'locale','en'),
(1936,271,'first_weekday','monday'),
(1937,271,'skin','auto'),
(1938,271,'update_browser_title','1'),
(1939,271,'calendar_initial_view','month'),
(1940,271,'login_initial_view','timesheet'),
(1941,271,'favorite_routes',''),
(1942,271,'daily_stats',''),
(1943,271,'export_decimal',''),
(1944,271,'__wizards__','intro,profile'),
(1945,243,'hourly_rate','0'),
(1946,243,'internal_rate',NULL),
(1947,243,'timezone','Africa/Kampala'),
(1948,243,'language','en'),
(1949,243,'locale','en'),
(1950,243,'first_weekday','monday'),
(1951,243,'skin','auto'),
(1952,243,'update_browser_title','1'),
(1953,243,'calendar_initial_view','month'),
(1954,243,'login_initial_view','timesheet'),
(1955,243,'favorite_routes',''),
(1956,243,'daily_stats',''),
(1957,243,'export_decimal',''),
(1958,243,'__wizards__','intro,profile'),
(1959,171,'hourly_rate','0'),
(1960,171,'internal_rate',NULL),
(1961,171,'timezone','Africa/Kampala'),
(1962,171,'language','en'),
(1963,171,'locale','en'),
(1964,171,'first_weekday','monday'),
(1965,171,'skin','auto'),
(1966,171,'update_browser_title','1'),
(1967,171,'calendar_initial_view','month'),
(1968,171,'login_initial_view','timesheet'),
(1969,171,'favorite_routes',''),
(1970,171,'daily_stats',''),
(1971,171,'export_decimal',''),
(1972,171,'__wizards__','intro,profile');
/*!40000 ALTER TABLE `kimai2_user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_users`
--

DROP TABLE IF EXISTS `kimai2_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(180) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password` varchar(255) NOT NULL,
  `alias` varchar(60) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `registration_date` datetime DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `roles` longtext NOT NULL COMMENT '(DC2Type:array)',
  `last_login` datetime DEFAULT NULL,
  `confirmation_token` varchar(180) DEFAULT NULL,
  `password_requested_at` datetime DEFAULT NULL,
  `api_token` varchar(255) DEFAULT NULL,
  `auth` varchar(20) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `account` varchar(30) DEFAULT NULL,
  `totp_secret` varchar(255) DEFAULT NULL,
  `totp_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `system_account` tinyint(1) NOT NULL DEFAULT 0,
  `supervisor_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_B9AC5BCEF85E0677` (`username`),
  UNIQUE KEY `UNIQ_B9AC5BCEE7927C74` (`email`),
  UNIQUE KEY `UNIQ_B9AC5BCEC05FB297` (`confirmation_token`),
  KEY `IDX_B9AC5BCE19E9AC5F` (`supervisor_id`),
  CONSTRAINT `FK_B9AC5BCE19E9AC5F` FOREIGN KEY (`supervisor_id`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=310 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_users`
--

LOCK TABLES `kimai2_users` WRITE;
/*!40000 ALTER TABLE `kimai2_users` DISABLE KEYS */;
INSERT INTO `kimai2_users` VALUES
(45,'mruser@ppda.go.ug','mruser@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Management Report',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(46,'knowbe4@ppda.go.ug','knowbe4@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Knowbe4',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(52,'edmsadmin@ppda.go.ug','edmsadmin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','EDMS Admin',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(53,'sccmadmin@ppda.go.ug','sccmadmin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','SCCM-ClientPush',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(56,'share@ppda.go.ug','share@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','PPDA Share',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(57,'mailbackup@ppda.go.ug','mailbackup@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mail-backup',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(58,'solomonadmin@ppda.go.ug','solomonadmin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Solomon Admin',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(60,'mail@ppda.go.ug','mail@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','AD Mail Authentication',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(61,'jkaggwa@ppda.go.ug','jkaggwa@ppda.go.ug','$2y$13$sSYtKSPLtRpgsyOSWRUV1eIgSl1h8Tj8ihXNielQ7iZIwOFvjuqmy','Jenipher Kaggwa',1,'2026-06-03 12:10:48','Senior Network Administrator',NULL,'a:0:{}','2026-07-17 07:50:49',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,265),
(62,'vmugisha','vmugisha@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Vivacious Mugisha',1,'2026-06-03 12:10:48','Senior Software & Database Administrator',NULL,'a:0:{}','2026-07-23 07:27:57',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,265),
(63,'po-intern@ppda.go.ug','po-intern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','po-intern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(64,'research_intern@ppda.go.ug','research_intern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Research Intern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(65,'printern@ppda.go.ug','printern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Pr Intern.',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(66,'pmintern2@ppda.go.ug','pmintern2@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','PM Intern2',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(67,'pmintern@ppda.go.ug','pmintern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','PM Intern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(68,'lintern2@ppda.go.ug','lintern2@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Legal Intern2',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(69,'lintern@ppda.go.ug','lintern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Legal Intern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(70,'fmbabazi@ppda.go.ug','fmbabazi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Faith Mbabazi',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(71,'rnalukwago@ppda.go.ug','rnalukwago@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Rose Nalukwago',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(74,'gsempangama@ppda.go.ug','gsempangama@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Godfrey Sempagama',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(75,'bobonyo@ppda.go.ug','bobonyo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Benard Obonyo',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(76,'l-intern@ppda.go.ug','l-intern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','lintern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(77,'syiga@ppda.go.ug','syiga@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Shadad Yiga',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(80,'officer-proc@ppda.go.ug','officer-proc@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Intern Proc',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(81,'registry-intern@ppda.go.ug','registry-intern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Registry Intern',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(82,'sccm-sqlreporting@ppda.go.ug','sccm-sqlreporting@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','SCCM-SQLReporting',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(83,'sccm-domainjoin@ppda.go.ug','sccm-domainjoin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','SCCM-DomainJoin',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(84,'aayebale@ppda.go.ug','aayebale@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Angella ayebale',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(85,'aillango@ppda.go.ug','aillango@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Arnold Illango',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(86,'anuwahereza@ppda.go.ug','anuwahereza@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Anita Nuwahereza',1,'2026-06-03 12:10:48','Graduate Trainee Library',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(87,'atumwesigye@ppda.go.ug','atumwesigye@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ambrose tumwesigye',1,'2026-06-03 12:10:48','Graduate Trainee',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(88,'cankunda','cankunda@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Carrolyn Ankunda',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 12:38:55',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,172),
(89,'dbiriija@ppda.go.ug','dbiriija@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','David Biriija',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(90,'eaisu@ppda.go.ug','eaisu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Eric Aisu',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(91,'jawor','jawor@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Josephine Awor',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 09:49:53',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(92,'jndyanabo@ppda.go.ug','jndyanabo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','John Ndyanabo',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(93,'mhasibe','mhasibe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mark Hasibe',1,'2026-06-03 12:10:48','Office Assistant',NULL,'a:0:{}','2026-07-16 14:36:16',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,96),
(94,'pacen@ppda.go.ug','pacen@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Patricia Acen',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(95,'rbatwaala@ppda.go.ug','rbatwaala@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Rahim batwaala',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(96,'rkasule','rkasule@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Robert Kasule',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 10:35:35',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,140),
(97,'salok@ppda.go.ug','salok@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sarah Aalok',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(98,'sniwamanya@ppda.go.ug','sniwamanya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Shawn Niwamanya',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(99,'abyaruhanga@ppda.go.ug','abyaruhanga@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Aloysious Byaruhanga',1,'2026-06-03 12:10:48','Director Performance Monitoring Central Government',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(100,'bopany@ppda.go.ug','bopany@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Bridget Opany',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(101,'dmatovu@ppda.go.ug','dmatovu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','David Matovu',1,'2026-06-03 12:10:48','Senior Officer Corporate & Public Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,266),
(102,'hdalia@ppda.go.ug','hdalia@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Hassam Dalia',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(103,'hpadde@ppda.go.ug','hpadde@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Hannah Padde Blessed',1,'2026-06-03 12:10:48','Officer Communications ( Graphics Design)',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,101),
(105,'mbarole@ppda.go.ug','mbarole@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Maurice Barole',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(106,'mkwiringira@ppda.go.ug','mkwiringira@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Moses Kwiringira',1,'2026-06-03 12:10:48','Estates Assistant',NULL,'a:0:{}','2026-06-17 11:53:56',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,163),
(107,'mnassaza@ppda.go.ug','mnassaza@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mary Sharon Nassaza',1,'2026-06-03 12:10:48','Manager Risk',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(108,'msekwe@ppda.go.ug','msekwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Martin Sekwe John',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(109,'nbirungi@ppda.go.ug','nbirungi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Nathan Birungi',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(110,'pikuret@ppda.go.ug','pikuret@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Patricia Ikuret',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(111,'pkatongole@ppda.go.ug','pkatongole@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Patrick Katongole',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(112,'smasagazi@ppda.go.ug','smasagazi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sophia Masagazi',1,'2026-06-03 12:10:48','Manager Legal Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(113,'sonen@ppda.go.ug','sonen@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Simon Onen',1,'2026-06-03 12:10:48','Procurement Data Analyst',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(114,'vtalyeba@ppda.go.ug','vtalyeba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Vincent Talyeba',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(115,'rturyatunga@ppda.go.ug','rturyatunga@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Richard Turyatunga',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(116,'fbumba@ppda.go.ug','fbumba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Francis Bumba',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(117,'jkintu@ppda.go.ug','jkintu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Joseph Kintu',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(118,'ykalange@ppda.go.ug','ykalange@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Yassin Kalange',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(119,'jakello','jakello@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jenavive Akello',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 09:59:32',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(120,'jmujuni@ppda.go.ug','jmujuni@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jordan Mujuni',1,'2026-06-03 12:10:48','Officer Ict Support',NULL,'a:0:{}','2026-07-16 10:08:28',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(121,'pnamasopo@ppda.go.ug','pnamasopo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Priscilla namasopo',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(122,'oasiimwe@ppda.go.ug','oasiimwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Oward asiimwe',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(123,'rkalule@ppda.go.ug','rkalule@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Richard Kalule',1,'2026-06-03 12:10:48','Senior Officer Planning Monitoring And Evaluation',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(124,'snakiwala','snakiwala@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sheila Nakiwala',1,'2026-06-03 12:10:48','Senior Officer Legal Affairs',NULL,'a:0:{}','2026-07-16 09:44:32',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(125,'marea@ppda.go.ug','marea@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Morris Area',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(127,'wojok@ppda.go.ug','wojok@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Walter Ojok',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(128,'okanyangye@ppda.go.ug','okanyangye@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Olga Kanyangye',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(129,'ibamanya@ppda.go.ug','ibamanya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Iga Bamanya',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,172),
(130,'vpn@ppda.go.ug','vpn@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Cisco Firepowere Vpn User',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(131,'gkomugisha@ppda.go.ug','gkomugisha@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Gladys Komugisha',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(132,'zkagoya@ppda.go.ug','zkagoya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ziadah Kagoya',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(133,'meyou@ppda.go.ug','meyou@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Moses Eyou',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}','2026-06-17 12:35:40',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(134,'ekemigisha','ekemigisha@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Emily Kemigisha',1,'2026-06-03 12:10:48','Officer Ict Support',NULL,'a:0:{}','2026-06-22 06:12:16',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,61),
(135,'mkyoshabire@ppda.go.ug','mkyoshabire@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mercy Kyoshabire',1,'2026-06-03 12:10:48','Director Procurement Capacity Building',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(136,'eekallam@ppda.go.ug','eekallam@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Enock Ekallam',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(137,'pkyakulaga@ppda.go.ug','pkyakulaga@ppda.go.ug','$2y$13$fDrYjXawXshUNTx2QJZNhOWU97WxPKAnAv4ZmGG/ATUK.ygETuJCu','Patrick Kyakulaga',1,'2026-06-03 12:10:48','Director Finance',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-17 08:42:14',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(138,'katamba@ppda.go.ug','katamba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Keleth Atamba',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(139,'htugume@ppda.go.ug','htugume@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Hassan Tugume',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(140,'cbirungi@ppda.go.ug','cbirungi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Arthur Clive Birungi',1,'2026-06-03 12:10:48','Regional Manager',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,218),
(141,'awampabya@ppda.go.ug','awampabya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Abraham Wampabya',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(142,'lkwesiga@ppda.go.ug','lkwesiga@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Lydia M Kwesiga',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(143,'mnyakamadi@ppda.go.ug','mnyakamadi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Miriam Nyakamadi Bigirwa',1,'2026-06-03 12:10:48','Manager Performance Monitoring',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(144,'mnsereko@ppda.go.ug','mnsereko@ppda.go.ug','$2y$13$8PPdNmEoqZfMkLBW664xOOBPqqGjkjxHQ0RRv.G4hy3Jf3Zc0ugsi','Mike Nsereko',1,'2026-06-03 12:10:48','Director Strategy',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-27 14:42:55',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,243),
(145,'mnamirembe@ppda.go.ug','mnamirembe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mary F Namirembe',1,'2026-06-03 12:10:48','Senior Officer Legal Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(146,'rnyesiga@ppda.go.ug','rnyesiga@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Rogers Nyesiga',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(147,'cnakedde@ppda.go.ug','cnakedde@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ceasar Nakedde',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(148,'alulu@ppda.go.ug','alulu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Amanda Lulu',1,'2026-06-03 12:10:48','Senior Officer Legal Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(149,'snamuwaya@ppda.go.ug','snamuwaya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sarah Namuwaya',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(150,'cnatukunda@ppda.go.ug','cnatukunda@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Catherine Natukunda',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(151,'bbagyenzi@ppda.go.ug','bbagyenzi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Bravo Bagyenzi',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(152,'itumusiime@ppda.go.ug','itumusiime@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ian Tumusiime',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(153,'slanyero@ppda.go.ug','slanyero@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Stella Lanyero',1,'2026-06-03 12:10:48','Office Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(154,'pmujuni@ppda.go.ug','pmujuni@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Patrick Mujuni',1,'2026-06-03 12:10:48','Senior Officer Legal Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(155,'akakongyi@ppda.go.ug','akakongyi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Aron Kakongyi',1,'2026-06-03 12:10:48','Executive Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(156,'hmudondo@ppda.go.ug','hmudondo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Harriet Mudondo',1,'2026-06-03 12:10:48','Manager Resource Mobilization And Stakeholder Enga',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,144),
(157,'quarantine@ppda.go.ug','quarantine@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','quarantine',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(158,'tcanogura','tcanogura@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Tonny Canogura',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 13:21:14',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(160,'jluyombya@ppda.go.ug','jluyombya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','James Luyombya',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}','2026-06-26 13:35:21',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(161,'jasiimwe','jasiimwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Joseph Asiimwe',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}','2026-07-16 11:48:32',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(162,'cnakidde@ppda.go.ug','cnakidde@ppda.go.ug','$2y$13$N3LisA9sWsWcYgijPY3dmOCQu24ptaViZA99GhOkCBv/6vn3LNcZe','Carolyn Nakidde',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-17 07:58:17',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(163,'sbusulwa','sbusulwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Stephen Busulwa',1,'2026-06-03 12:10:48','Senior Officer Administration',NULL,'a:0:{}','2026-06-22 06:16:02',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,216),
(164,'smutabanura@ppda.go.ug','smutabanura@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sharpson Mutabanura',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,172),
(165,'fibingira@ppda.go.ug','fibingira@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Freeman Ibingira',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(166,'schombe@ppda.go.ug','schombe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Steven Chombe',1,'2026-06-03 12:10:48','Office Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(167,'aseera','aseera@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Agnes Seera',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-15 08:17:22',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(168,'abanamwita@ppda.go.ug','abanamwita@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ali Banamwita',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(169,'jkanababa@ppda.go.ug','jkanababa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jimmy Kanababa',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(170,'bahimbisibwe','bahimbisibwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Brenda Ahimbisibwe',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 11:49:36',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(171,'ntebusweke@ppda.go.ug','ntebusweke@ppda.go.ug','$2y$13$6AJIHgci7IX0TXo40Ae0VO08hD1ArS4UwPCGvrYrWndZzlsgFquXC','Nuludiin Tebusweke',1,'2026-06-03 12:10:48','Director Risk And Audit',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-17 08:28:43',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(172,'dlukyamuzi@ppda.go.ug','dlukyamuzi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Dan Lukyamuzi',1,'2026-06-03 12:10:48','Regional Manager',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,218),
(173,'ptusiime@ppda.go.ug','ptusiime@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Precious Tusiime',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(174,'sokwang@ppda.go.ug','sokwang@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sam Okwang',1,'2026-06-03 12:10:48','Transport Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(175,'batuhairwe@ppda.go.ug','batuhairwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Brenda Atuhairwe',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(176,'akakuru','akakuru@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ambrose Kakuru',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-14 18:24:39',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,96),
(177,'mmunguriek@ppda.go.ug','mmunguriek@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Moureen Munguriek',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(178,'rfreedom@ppda.go.ug','rfreedom@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Raymond Freedom',1,'2026-06-03 12:10:48','Regional Manager',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,218),
(179,'jokongo@ppda.go.ug','jokongo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','James Okongo',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(180,'jnankunda','jnankunda@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Joan Nankunda',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 10:39:12',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(181,'fnalukwago@ppda.go.ug','fnalukwago@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Faith Nalukwago',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(182,'bnamusimbi@ppda.go.ug','bnamusimbi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Bridget Namusimbi',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(183,'issebabi@ppda.go.ug','issebabi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Isaac Ssebabi',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(184,'vnuwagaba@ppda.go.ug','vnuwagaba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Vanice nuwagaba',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(185,'hkatusabe@ppda.go.ug','hkatusabe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Hadijah Katusabe',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(186,'jssekamatte','jssekamatte@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','John Ssekamatte',1,'2026-06-03 12:10:48','Graduate Trainee',NULL,'a:0:{}','2026-07-23 07:22:07',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,62),
(187,'etumworobere@ppda.go.ug','etumworobere@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ellon Tumworobere',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(189,'aakatukunda@ppda.go.ug','aakatukunda@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Anna Akatukunda',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,178),
(190,'snassazi@ppda.go.ug','snassazi@ppda.go.ug','$2y$13$NiBR9Vg6wmg.FLt4P197FejVIunjpBPFjCmje/tl0wYoT4dcVoCPO','Saharu Nassazi',1,'2026-06-03 12:10:48','Senior Officer Research And Policy',NULL,'a:0:{}','2026-07-17 07:42:35',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,226),
(191,'hmwesigwa@ppda.go.ug','hmwesigwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Hilda Mwesigwa',1,'2026-06-03 12:10:48','Manager Performance Monitoring',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(192,'swaigumba@ppda.go.ug','swaigumba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Specioza Waigumba',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(193,'skyobutungi@ppda.go.ug','skyobutungi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Syria Kyobutungi',1,'2026-06-03 12:10:48','Office Assistant',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(194,'mbaluka@ppda.go.ug','mbaluka@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Mariam Baluka',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(195,'swere@ppda.go.ug','swere@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Susan Were',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(196,'bkyasiimire@ppda.go.ug','bkyasiimire@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Babrah Kyasiimire',1,'2026-06-03 12:10:48','Officer Legal Affairs',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(197,'rtumuhairwe@ppda.go.ug','rtumuhairwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ronald Tumuhairwe',1,'2026-06-03 12:10:48','Manager Local Content',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(198,'akirabo@ppda.go.ug','akirabo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Agatha Kirabo',1,'2026-06-03 12:10:48','Senior Officer Capacity Building',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(199,'enamuddu@ppda.go.ug','enamuddu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Eva Namuddu',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(200,'bnatukwatsa@ppda.go.ug','bnatukwatsa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Babrah Natukwatsa',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(201,'usegawa@ppda.go.ug','usegawa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Uthman Segawa',1,'2026-06-03 12:10:48','Director Legal And Board Affairs',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(202,'cniwagaba@ppda.go.ug','cniwagaba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Caroline Niwagaba',1,'2026-06-03 12:10:48','Senior Officer Procurement & Logistics',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,137),
(203,'mnansamba@ppda.go.ug','mnansamba@ppda.go.ug','$2y$13$AlghAWrGPGvj0UIR3ej4.OgYVtVqpxxa4opF9pOzux4.JVtsoRJgm','Marion Nansamba',1,'2026-06-03 12:10:48','Officer Human Resources',NULL,'a:0:{}','2026-07-17 08:09:27',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,212),
(204,'labaho@ppda.go.ug','labaho@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Leevan Abaho',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(205,'brahim@ppda.go.ug','brahim@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Batwala Rahim',1,'2026-06-03 12:10:48','Graduate Trainee',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(206,'skamazima','skamazima@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Susan Kamazima',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 12:35:58',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,172),
(207,'dbirungi@ppda.go.ug','dbirungi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Daphine Birungi',1,'2026-06-03 12:10:48','Officer Human Resources',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,212),
(208,'robasoni@ppda.go.ug','robasoni@ppda.go.ug','$2y$13$Z8617GZhy9RhGMLx/UzmduqKl4YZ/0U/cOyEz24dqe9TB3swlaS6a','Richard Obasoni',1,'2026-06-03 12:10:48','Manager Finance',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}','2026-07-17 08:47:18',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,137),
(209,'echeptoek','echeptoek@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Emmanuel Cheptoek',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 14:08:33',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,172),
(210,'dkyazze@ppda.go.ug','dkyazze@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Doreen Kyazze',1,'2026-06-03 12:10:48','Manager Legal Affairs',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(211,'snakawala@ppda.go.ug','snakawala@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Suzan Nakawala',1,'2026-06-03 12:10:48','Senior Officer Internal Audit',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(212,'lnamutebi@ppda.go.ug','lnamutebi@ppda.go.ug','$2y$13$XBbNxbt8MVLsyb6qhPSKqe295h/ex/wwFRhfYe7IrC1mNxAwOSixC','Liz Namutebi',1,'2026-06-03 12:10:48','Senior Officer Human Resources',NULL,'a:0:{}','2026-07-17 08:10:14',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,271),
(213,'snakanwagi@ppda.go.ug','snakanwagi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Shalina Nakanwagi',1,'2026-06-03 12:10:48','Assistant Officer Cashier',NULL,'a:0:{}','2026-06-19 07:44:43',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,257),
(214,'casiimwe@ppda.go.ug','casiimwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Claire Asiimwe',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(215,'jnangabo','jnangabo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Josephine Nangabo',1,'2026-06-03 12:10:48','Officer Customer Service',NULL,'a:0:{}','2026-07-15 07:03:11',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(216,'rluzira@ppda.go.ug','rluzira@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Richard Luzira',1,'2026-06-03 12:10:48','Manager Administration',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}','2026-06-18 08:53:28',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,225),
(217,'rnabayego@ppda.go.ug','rnabayego@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ruth  L Nabayego',1,'2026-06-03 12:10:48','Officer Administration',NULL,'a:0:{}','2026-06-18 08:29:40',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,216),
(218,'mojambo@ppda.go.ug','mojambo@ppda.go.ug','$2y$13$dfOIaS8JkpIWHvFUln2nteUq6/MELGWX3RmLtI408B49At1JPyroq','Moses Ojambo',1,'2026-06-03 12:10:48','Director Performance Monitoring Local Government',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-23 06:30:01',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,243),
(219,'fnyeko@ppda.go.ug','fnyeko@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Francis Nyeko',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,231),
(220,'ckeitesi','ckeitesi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Chloe Keitesi',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 09:22:55',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(221,'eakiiki','eakiiki@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Eunice Akiiki',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-06-23 06:26:48',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(222,'dkarashani@ppda.go.ug','dkarashani@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Daphine Karashani',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(223,'bagaba@ppda.go.ug','bagaba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Brendah Agaba',1,'2026-06-03 12:10:48','Officer Procurement And Logistics',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(224,'dashabaahebwa@ppda.go.ug','dashabaahebwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Douglas Ashabahebwa',1,'2026-06-03 12:10:48','Senior Officer Compliance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(225,'elubowa@ppda.go.ug','elubowa@ppda.go.ug','$2y$13$OY2HiNoEBCRyoWYE1SwXAOq6Qagnbh7d6COwKZR6YuYoO.EHnaewS','Eva Lubowa',1,'2026-06-03 12:10:48','Director Human Resources & Administration',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-17 06:46:22',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(226,'gkansiime@ppda.go.ug','gkansiime@ppda.go.ug','$2y$13$o7PxQZ9qEdJdEzvobPA9jOUifwjPBYr.TVbhZIIDmnV51HU7hvOae','Gloria Kansiime',1,'2026-06-03 12:10:48','Manager Research And Policy',NULL,'a:0:{}','2026-07-17 07:47:57',NULL,NULL,NULL,'kimai','#808080',NULL,NULL,0,0,144),
(227,'sbugembe','sbugembe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Sam Bugembe',1,'2026-06-03 12:10:48','Senior Officer Finance',NULL,'a:0:{}','2026-06-22 06:20:43',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,208),
(228,'tamito','tamito@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Tracy Judith Amito',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 13:52:13',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,231),
(229,'mmwesigye@ppda.go.ug','mmwesigye@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Martha Mwesigye',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(230,'asenyonjo','asenyonjo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Anna Senyonjo',1,'2026-06-03 12:10:48','Officer ROP',NULL,'a:0:{}','2026-06-22 13:15:24',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,260),
(231,'makiror@ppda.go.ug','makiror@ppda.go.ug','$2y$13$ZdI7RWmvXnx7kzFnR2iW.Owrb5x8TNHO0Eo5rwSYgj1nbEtBmu.3S','Mary Akiror',1,'2026-06-03 12:10:48','Regional Manager',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}','2026-07-23 06:30:47',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,218),
(232,'bbakirese@ppda.go.ug','bbakirese@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Billbest Bakirese',1,'2026-06-03 12:10:48','Manager Planning Monitoring And Evaluation',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,144),
(233,'smusiime@ppda.go.ug','smusiime@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Susan Musiime',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(234,'rkemigisa','rkemigisa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ronah Kemigisa',1,'2026-06-03 12:10:48','Officer Customer Service',NULL,'a:0:{}','2026-07-15 06:55:26',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,101),
(235,'skimbugwe@ppda.go.ug','skimbugwe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Shafik Kimbugwe',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(236,'obyamukama','obyamukama@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Obed Byamukama',1,'2026-06-03 12:10:48','Senior Officer Finance',NULL,'a:0:{}','2026-07-01 12:06:57',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,208),
(237,'makwano@ppda.go.ug','makwano@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Martha Akwano.',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(238,'gbarekye@ppda.go.ug','gbarekye@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Gemma Barekye',1,'2026-06-03 12:10:48','Senior Officer Resource Mobilization And Stakehold',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(239,'awokuri@ppda.go.ug','awokuri@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ann Wokuri',1,'2026-06-03 12:10:48','Director Legal And Board Affairs',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(240,'rnamayanja@ppda.go.ug','rnamayanja@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Rebecca Namayanja',1,'2026-06-03 12:10:48','Senior Officer Library',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,265),
(241,'salum','salum@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Susan Alum',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}','2026-07-15 11:49:21',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(242,'hnteziyalemye@ppda.go.ug','hnteziyalemye@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Herman Nteziyalemye',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,172),
(243,'bturamye@ppda.go.ug','bturamye@ppda.go.ug','$2y$13$HSbvwzp9oWnVBJ.rhYFOpuqKKLSs80fA/fVNo7Wm1X2gEB7C9b7nS','Benson Turamye',1,'2026-06-03 12:10:48','Executive Director',NULL,'a:1:{i:0;s:13:\"ROLE_DIRECTOR\";}','2026-07-17 08:27:38',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(244,'fnamirembe@ppda.go.ug','fnamirembe@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Namirembe Fatuma',1,'2026-06-03 12:10:48','Officer ROP',NULL,'a:0:{}','2026-06-29 13:18:25',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,260),
(245,'fgiramiya@ppda.go.ug','fgiramiya@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Fiona Consolata Giramiya',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,267),
(246,'anazziwa@ppda.go.ug','anazziwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Annette Nazziwa',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(247,'cnyamungu@ppda.go.ug','cnyamungu@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Charity Nyamungu',1,'2026-06-03 12:10:48','Senior Officer Customer Service',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,266),
(248,'gobita','gobita@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Godfrey Joe Obita',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}','2026-07-16 11:50:56',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,231),
(249,'jobbo','jobbo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Julius Obbo',1,'2026-06-03 12:10:48','Office Assistant',NULL,'a:0:{}','2026-06-23 07:01:55',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,217),
(250,'mmugisha@ppda.go.ug','mmugisha@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Michael Mugisha',1,'2026-06-03 12:10:48','Transport Assistant Mail Delivery',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(251,'jkyarisiima@ppda.go.ug','jkyarisiima@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jenipher Kyarisiima',1,'2026-06-03 12:10:48','Officer Registry',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(252,'jkiraire','jkiraire@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Joel Kiraire',1,'2026-06-03 12:10:48','Officer Local Content',NULL,'a:0:{}','2026-07-16 11:34:27',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(253,'enamusoke@ppda.go.ug','enamusoke@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Eron Namusoke',1,'2026-06-03 12:10:48','Manager Board Affairs',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(254,'aemejeit@ppda.go.ug','aemejeit@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Andrew Emejeit',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(255,'rkalema@ppda.go.ug','rkalema@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ronald Kalema',1,'2026-06-03 12:10:48','Senior Officer Internal Audit',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(257,'wmulindwa','wmulindwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Wilberforce Mulindwa',1,'2026-06-03 12:10:48','Officer Finance',NULL,'a:0:{}','2026-07-15 11:44:08',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,245),
(258,'sbusinge@ppda.go.ug','sbusinge@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Simon Businge',1,'2026-06-03 12:10:48','Manager Performance Monitoring',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,99),
(259,'catuganyira@ppda.go.ug','catuganyira@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Catherine Atuganyira',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(260,'rmasajjage@ppda.go.ug','rmasajjage@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Rebecca Masajjage',1,'2026-06-03 12:10:48','Manager ED\'s Office',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,243),
(261,'corotit@ppda.go.ug','corotit@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Cosmas Orotit Otebat',1,'2026-06-03 12:10:48','Senior Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(262,'jnansamba@ppda.go.ug','jnansamba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jalia Nansamba',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(263,'snakatwere@ppda.go.ug','snakatwere@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Shamilah Nakatwere',1,'2026-06-03 12:10:48','Office Administrator',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(264,'vbuyondo','vbuyondo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Vale Buyondo',1,'2026-06-03 12:10:48','Officer Ict Support',NULL,'a:0:{}','2026-07-17 07:43:55',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,61),
(265,'wbyekwaso@ppda.go.ug','wbyekwaso@ppda.go.ug','$2y$13$siaNC754OPclTxZFU5PDiOZp22jj2ETxGAyx0J5C5k/BA8iboCpqW','Wilson Byekwaso',1,'2026-06-03 12:10:48','Manager Information Systems',NULL,'a:0:{}','2026-07-23 07:47:28',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,144),
(266,'cmagoba@ppda.go.ug','cmagoba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Cris Magoba',1,'2026-06-03 12:10:48','Manager Public Relations',NULL,'a:1:{i:0;s:13:\"ROLE_TEAMLEAD\";}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,243),
(267,'mabaine','mabaine@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Michael Abaine',1,'2026-06-03 12:10:48','Senior Officer Local Content',NULL,'a:0:{}','2026-07-03 15:17:53',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,99),
(268,'inyago@ppda.go.ug','inyago@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ivan Nyago',1,'2026-06-03 12:10:48','Officer Performance Monitoring',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(269,'gkawere@ppda.go.ug','gkawere@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Geraldine Kawere',1,'2026-06-03 12:10:48','Executive Assistant to ED',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(270,'gabaho@ppda.go.ug','gabaho@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','GRACE ABAHO',1,'2026-06-03 12:10:48','Interns And Temps',NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,96),
(271,'eamulen@ppda.go.ug','eamulen@ppda.go.ug','$2y$13$LN8gQq0b6pZhDKyuGvjTSeymaJ/ezrMJWcOTDDt78k4eT09qYweNq','Elizabeth Mary Amulen',1,'2026-06-03 12:10:48','Manager HR',NULL,'a:0:{}','2026-07-23 06:30:58',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,225),
(272,'vwasswa@ppda.go.ug','vwasswa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Victor Wasswa',1,'2026-06-03 12:10:48',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,NULL),
(273,'userman@ppda.go.ug','userman@ppda.go.ug','$2y$13$oQ.eOgm5X5wqQa8o60d6C.ogv2LZyd8QwFusp0ZOfyccNCIi8kJj2',NULL,1,'2026-06-03 12:13:11',NULL,NULL,'a:2:{i:0;s:10:\"ROLE_ADMIN\";i:1;s:16:\"ROLE_SUPER_ADMIN\";}','2026-07-21 16:12:15',NULL,NULL,NULL,'kimai',NULL,NULL,NULL,0,0,62),
(280,'ad_ekemigisha','ad_ekemigisha','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Emily Kemigisha',1,'2026-07-06 18:07:06',NULL,NULL,'a:0:{}','2026-07-06 18:07:06',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(281,'ad_jmujuni','ad_jmujuni','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jordan Mujuni',1,'2026-07-08 05:53:51',NULL,NULL,'a:0:{}','2026-07-08 05:53:52',NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(286,'itadmin@ppda.go.ug','itadmin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi',NULL,1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(287,'ad_vbuyondo@ppda.go.ug','ad_vbuyondo@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Vale Buyondo',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(288,'ad_vmugisha@ppda.go.ug','ad_vmugisha@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Viva Mugisha',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(289,'ad_jssekamatte@ppda.go.ug','ad_jssekamatte@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','John Ssekamatte',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(290,'ad_jkaggwa@ppda.go.ug','ad_jkaggwa@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Jenipher Kaggwa',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(291,'ad_wbyekwaso@ppda.go.ug','ad_wbyekwaso@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Wilson Byekwaso',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(292,'appserver@ppda.go.ug','appserver@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','app-server',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(293,'internproc@ppda.go.ug','internproc@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','intern-proc Intern Procurement',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(294,'drivers@ppda.go.ug','drivers@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Drivers',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(295,'internadmin@ppda.go.ug','internadmin@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Intern admin',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(296,'hrintern@ppda.go.ug','hrintern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','intern hr',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(297,'ikatumba@ppda.go.ug','ikatumba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Ibrahim Katumba',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(298,'itop_user@ppda.go.ug','itop_user@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','itop_user',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(299,'itoptest@ppda.go.ug','itoptest@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Test Ito',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(300,'internpm@ppda.go.ug','internpm@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','intern PM',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(301,'finance-intern@ppda.go.ug','finance-intern@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Finance Intern',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(302,'knkinzi@ppda.go.ug','knkinzi@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Kayla Nkinzi',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(303,'jnangeso@ppda.go.ug','jnangeso@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Josephine Nangeso',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(304,'atravor@ppda.go.ug','atravor@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Travor Abaho',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(305,'nnoel@ppda.go.ug','nnoel@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Noel Nakimera',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(306,'ndaphine@ppda.go.ug','ndaphine@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Daphine Nakibuuka',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(307,'eatukunzire@ppda.go.ug','eatukunzire@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Emmanuel Atukunzire',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(308,'eagaba@ppda.go.ug','eagaba@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','Elton Zoora Agaba',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL),
(309,'svc-vsphere@ppda.go.ug','svc-vsphere@ppda.go.ug','$2y$10$1/rAGAIQgdxMPgmSNFNugebSPpvAp7TmKom5eL2Mf/LvlOupiOWhi','svc-vsphere',1,'2026-07-16 13:00:02',NULL,NULL,'a:0:{}',NULL,NULL,NULL,NULL,'ldap',NULL,NULL,NULL,0,0,NULL);
/*!40000 ALTER TABLE `kimai2_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_users_teams`
--

DROP TABLE IF EXISTS `kimai2_users_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_users_teams` (
  `user_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teamlead` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_B5E92CF8A76ED395296CD8AE` (`user_id`,`team_id`),
  KEY `IDX_B5E92CF8A76ED395` (`user_id`),
  KEY `IDX_B5E92CF8296CD8AE` (`team_id`),
  CONSTRAINT `FK_B5E92CF8296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `kimai2_teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_B5E92CF8A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1464 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_users_teams`
--

LOCK TABLES `kimai2_users_teams` WRITE;
/*!40000 ALTER TABLE `kimai2_users_teams` DISABLE KEYS */;
INSERT INTO `kimai2_users_teams` VALUES
(61,110,1232,0),
(62,110,1233,0),
(120,110,1234,0),
(134,110,1235,0),
(186,110,1236,0),
(264,110,1237,0),
(265,110,1238,1),
(85,111,1239,0),
(119,111,1241,0),
(128,111,1242,0),
(131,111,1243,0),
(138,111,1244,0),
(143,111,1245,0),
(167,111,1246,0),
(170,111,1247,0),
(173,111,1248,0),
(175,111,1249,0),
(180,111,1250,0),
(182,111,1251,0),
(191,111,1252,0),
(195,111,1253,0),
(197,111,1254,0),
(199,111,1255,0),
(204,111,1256,0),
(214,111,1257,0),
(220,111,1258,0),
(224,111,1260,0),
(235,111,1261,0),
(237,111,1262,0),
(252,111,1265,0),
(254,111,1266,0),
(263,111,1268,0),
(267,111,1269,0),
(87,113,1272,0),
(93,113,1273,0),
(136,113,1274,0),
(147,113,1276,0),
(176,113,1277,0),
(222,113,1278,0),
(233,113,1279,0),
(259,113,1280,0),
(261,113,1281,0),
(262,113,1282,0),
(270,113,1283,0),
(88,114,1284,0),
(129,114,1285,0),
(164,114,1286,0),
(172,114,1287,0),
(206,114,1288,0),
(209,114,1289,0),
(242,114,1290,0),
(92,115,1291,0),
(132,115,1292,0),
(139,115,1293,0),
(153,115,1294,0),
(162,115,1295,0),
(177,115,1296,0),
(179,115,1297,0),
(219,115,1298,0),
(228,115,1299,0),
(231,115,1300,1),
(248,115,1301,0),
(123,118,1329,0),
(232,118,1330,1),
(124,119,1331,0),
(145,119,1332,0),
(148,119,1333,0),
(154,119,1334,0),
(196,119,1335,0),
(201,119,1336,0),
(205,119,1337,0),
(210,119,1338,0),
(239,119,1339,0),
(253,119,1340,0),
(127,120,1341,0),
(135,120,1342,0),
(149,120,1343,0),
(150,120,1344,0),
(151,120,1345,0),
(165,120,1346,0),
(194,120,1347,0),
(198,120,1348,0),
(141,122,1357,0),
(146,122,1358,0),
(152,122,1359,0),
(166,122,1360,0),
(178,122,1361,1),
(183,122,1362,0),
(184,122,1363,0),
(185,122,1364,0),
(187,122,1365,0),
(189,122,1366,0),
(156,124,1370,1),
(238,124,1371,0),
(190,126,1373,0),
(226,126,1374,1),
(211,127,1375,0),
(255,127,1376,0),
(240,110,1383,0),
(86,110,1384,0),
(251,110,1385,0),
(250,110,1386,0),
(218,114,1395,0),
(218,115,1396,0),
(171,127,1398,0),
(144,118,1401,0),
(144,124,1402,0),
(271,134,1408,1),
(212,134,1409,0),
(203,134,1410,0),
(216,135,1412,1),
(163,135,1413,0),
(217,135,1414,0),
(106,135,1415,0),
(266,136,1418,1),
(101,136,1419,0),
(234,136,1420,0),
(103,136,1421,0),
(260,137,1422,1),
(244,137,1423,0),
(230,137,1424,0),
(208,138,1426,1),
(236,138,1427,0),
(227,138,1428,0),
(213,138,1429,0),
(202,139,1431,1),
(223,139,1432,0),
(160,135,1433,0),
(168,135,1434,0),
(116,135,1435,0),
(169,135,1436,0),
(118,135,1437,0),
(125,135,1438,0),
(174,135,1439,0),
(193,135,1440,0),
(249,135,1441,0),
(207,134,1442,0),
(267,140,1443,1),
(113,140,1444,0),
(245,140,1445,0),
(241,140,1446,0),
(221,140,1447,0),
(192,140,1448,0),
(215,140,1449,0),
(257,140,1450,0),
(224,140,1451,0),
(258,141,1452,1),
(158,141,1453,0),
(180,141,1454,0),
(200,141,1455,0),
(138,141,1456,0),
(96,113,1458,1),
(247,136,1459,0),
(140,152,1460,1),
(225,134,1462,0),
(137,138,1463,0);
/*!40000 ALTER TABLE `kimai2_users_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_weekly_submissions`
--

DROP TABLE IF EXISTS `kimai2_weekly_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_weekly_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `week_start` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `supervisor_notes` longtext DEFAULT NULL,
  `total_duration` int(11) NOT NULL DEFAULT 0,
  `manager_approved_by` int(11) DEFAULT NULL,
  `manager_approved_at` datetime DEFAULT NULL,
  `manager_notes` longtext DEFAULT NULL,
  `reassigned_to` int(11) DEFAULT NULL,
  `original_supervisor` int(11) DEFAULT NULL,
  `is_overtime` tinyint(1) NOT NULL DEFAULT 0,
  `overtime_hours` int(11) NOT NULL DEFAULT 0,
  `hr_approved_by` int(11) DEFAULT NULL,
  `hr_approved_at` datetime(6) DEFAULT NULL,
  `hr_notes` text DEFAULT NULL,
  `manager_hr_approved_by` int(11) DEFAULT NULL,
  `manager_hr_approved_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `manager_hr_notes` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_USER_WEEK` (`user_id`,`week_start`),
  KEY `FK_WEEKLY_SUB_APPROVER` (`approved_by`),
  KEY `FK_WEEKLY_SUB_MGR_APPR` (`manager_approved_by`),
  KEY `FK_WEEKLY_SUB_REASSIGNED` (`reassigned_to`),
  KEY `FK_WEEKLY_SUB_ORIG_SUPER` (`original_supervisor`),
  KEY `IDX_BCF7A6B663CDB492` (`manager_hr_approved_by`),
  CONSTRAINT `FK_BCF7A6B663CDB492` FOREIGN KEY (`manager_hr_approved_by`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_WEEKLY_SUB_APPROVER` FOREIGN KEY (`approved_by`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_WEEKLY_SUB_MGR_APPR` FOREIGN KEY (`manager_approved_by`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_WEEKLY_SUB_ORIG_SUPER` FOREIGN KEY (`original_supervisor`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_WEEKLY_SUB_REASSIGNED` FOREIGN KEY (`reassigned_to`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_WEEKLY_SUB_USER` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_weekly_submissions`
--

LOCK TABLES `kimai2_weekly_submissions` WRITE;
/*!40000 ALTER TABLE `kimai2_weekly_submissions` DISABLE KEYS */;
INSERT INTO `kimai2_weekly_submissions` VALUES
(1,231,218,'2026-07-20','hr_approved','2026-07-23 06:29:35','2026-07-23 06:30:21','nnn',208800,NULL,NULL,NULL,NULL,NULL,1,18,NULL,NULL,NULL,271,'2026-07-23 06:33:58',''),
(2,271,NULL,'2026-07-20','submitted','2026-07-23 07:10:41',NULL,NULL,57600,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(3,186,NULL,'2026-07-13','submitted','2026-07-23 07:26:28',NULL,NULL,162900,NULL,NULL,NULL,NULL,NULL,1,5,NULL,NULL,NULL,NULL,NULL,NULL),
(4,186,NULL,'2026-07-20','submitted','2026-07-23 07:26:28',NULL,NULL,86400,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `kimai2_weekly_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kimai2_working_times`
--

DROP TABLE IF EXISTS `kimai2_working_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kimai2_working_times` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `expected` int(11) NOT NULL,
  `actual` int(11) NOT NULL,
  `approved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_F95E4933A76ED395AA9E377A` (`user_id`,`date`),
  KEY `IDX_F95E4933A76ED395` (`user_id`),
  KEY `IDX_F95E49334EA3CB3D` (`approved_by`),
  CONSTRAINT `FK_F95E49334EA3CB3D` FOREIGN KEY (`approved_by`) REFERENCES `kimai2_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_F95E4933A76ED395` FOREIGN KEY (`user_id`) REFERENCES `kimai2_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kimai2_working_times`
--

LOCK TABLES `kimai2_working_times` WRITE;
/*!40000 ALTER TABLE `kimai2_working_times` DISABLE KEYS */;
/*!40000 ALTER TABLE `kimai2_working_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migration_versions`
--

DROP TABLE IF EXISTS `migration_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migration_versions`
--

LOCK TABLES `migration_versions` WRITE;
/*!40000 ALTER TABLE `migration_versions` DISABLE KEYS */;
INSERT INTO `migration_versions` VALUES
('DoctrineMigrations\\Version20180701120000','2026-06-03 11:52:46',97),
('DoctrineMigrations\\Version20180715160326','2026-06-03 11:52:47',179),
('DoctrineMigrations\\Version20180730044139','2026-06-03 11:52:47',7),
('DoctrineMigrations\\Version20180805183527','2026-06-03 11:52:47',32),
('DoctrineMigrations\\Version20180903202256','2026-06-03 11:52:47',8),
('DoctrineMigrations\\Version20180905190737','2026-06-03 11:52:47',16),
('DoctrineMigrations\\Version20180924111853','2026-06-03 11:52:47',5),
('DoctrineMigrations\\Version20181031220003','2026-06-03 11:52:47',52),
('DoctrineMigrations\\Version20190124004014','2026-06-03 11:52:47',29),
('DoctrineMigrations\\Version20190201150324','2026-06-03 11:52:47',4),
('DoctrineMigrations\\Version20190219200020','2026-06-03 11:52:47',1),
('DoctrineMigrations\\Version20190305152308','2026-06-03 11:52:47',23),
('DoctrineMigrations\\Version20190321181243','2026-06-03 11:52:47',4),
('DoctrineMigrations\\Version20190502161758','2026-06-03 11:52:47',60),
('DoctrineMigrations\\Version20190510205245','2026-06-03 11:52:47',43),
('DoctrineMigrations\\Version20190605171157','2026-06-03 11:52:47',75),
('DoctrineMigrations\\Version20190617100845','2026-06-03 11:52:47',81),
('DoctrineMigrations\\Version20190706224211','2026-06-03 11:52:47',57),
('DoctrineMigrations\\Version20190706224219','2026-06-03 11:52:47',92),
('DoctrineMigrations\\Version20190729162655','2026-06-03 11:52:47',63),
('DoctrineMigrations\\Version20190730123324','2026-06-03 11:52:47',118),
('DoctrineMigrations\\Version20190813162649','2026-06-03 11:52:48',63),
('DoctrineMigrations\\Version20191024100951','2026-06-03 11:52:48',58),
('DoctrineMigrations\\Version20191108151534','2026-06-03 11:52:48',66),
('DoctrineMigrations\\Version20191113132640','2026-06-03 11:52:48',50),
('DoctrineMigrations\\Version20191116110124','2026-06-03 11:52:48',60),
('DoctrineMigrations\\Version20191204120823','2026-06-03 11:52:48',70),
('DoctrineMigrations\\Version20200109102138','2026-06-03 11:52:48',106),
('DoctrineMigrations\\Version20200125123942','2026-06-03 11:52:48',69),
('DoctrineMigrations\\Version20200204124425','2026-06-03 11:52:48',71),
('DoctrineMigrations\\Version20200205115243','2026-06-03 11:52:48',149),
('DoctrineMigrations\\Version20200205115244','2026-06-03 11:52:48',105),
('DoctrineMigrations\\Version20200308171950','2026-06-03 11:52:48',82),
('DoctrineMigrations\\Version20200323163038','2026-06-03 11:52:48',102),
('DoctrineMigrations\\Version20200323163039','2026-06-03 11:52:49',1),
('DoctrineMigrations\\Version20200413133226','2026-06-03 11:52:49',88),
('DoctrineMigrations\\Version20200524142042','2026-06-03 11:52:49',87),
('DoctrineMigrations\\Version20200705152310','2026-06-03 11:52:49',83),
('DoctrineMigrations\\Version20200725213424','2026-06-03 11:52:49',108),
('DoctrineMigrations\\Version20210316224358','2026-06-03 11:52:49',78),
('DoctrineMigrations\\Version20210320162820','2026-06-03 11:52:49',81),
('DoctrineMigrations\\Version20210405105611','2026-06-03 11:52:49',79),
('DoctrineMigrations\\Version20210605154245','2026-06-03 11:52:49',81),
('DoctrineMigrations\\Version20210704111542','2026-06-03 11:52:49',74),
('DoctrineMigrations\\Version20210717211144','2026-06-03 11:52:49',49),
('DoctrineMigrations\\Version20210719123928','2026-06-03 11:52:49',75),
('DoctrineMigrations\\Version20210727104955','2026-06-03 11:52:49',103),
('DoctrineMigrations\\Version20210802152259','2026-06-03 11:52:50',80),
('DoctrineMigrations\\Version20210802152814','2026-06-03 11:52:50',402),
('DoctrineMigrations\\Version20210802160837','2026-06-03 11:52:50',97),
('DoctrineMigrations\\Version20210802174318','2026-06-03 11:52:50',87),
('DoctrineMigrations\\Version20210802174319','2026-06-03 11:52:50',1),
('DoctrineMigrations\\Version20210802174320','2026-06-03 11:52:50',96),
('DoctrineMigrations\\Version20211008092010','2026-06-03 11:52:50',77),
('DoctrineMigrations\\Version20211230163612','2026-06-03 11:52:50',90),
('DoctrineMigrations\\Version20220101204501','2026-06-03 11:52:51',103),
('DoctrineMigrations\\Version20220315224645','2026-06-03 11:52:51',96),
('DoctrineMigrations\\Version20220404150236','2026-06-03 11:52:51',80),
('DoctrineMigrations\\Version20220531145920','2026-06-03 11:52:51',103),
('DoctrineMigrations\\Version20220722125847','2026-06-03 11:52:51',79),
('DoctrineMigrations\\Version20230126002049','2026-06-03 11:52:51',127),
('DoctrineMigrations\\Version20230126002050','2026-06-03 11:52:51',91),
('DoctrineMigrations\\Version20230327143628','2026-06-03 11:52:51',121),
('DoctrineMigrations\\Version20230606125948','2026-06-03 11:52:51',92),
('DoctrineMigrations\\Version20230819090536','2026-06-03 11:52:51',106),
('DoctrineMigrations\\Version20231130000719','2026-06-03 11:52:52',2),
('DoctrineMigrations\\Version20240214061246','2026-06-03 11:52:52',100),
('DoctrineMigrations\\Version20240326125247','2026-06-03 11:52:52',8),
('DoctrineMigrations\\Version20240920105524','2026-06-03 11:52:52',2),
('DoctrineMigrations\\Version20240926111739','2026-06-03 11:52:52',15),
('DoctrineMigrations\\Version20250608143244','2026-06-03 11:52:52',88),
('DoctrineMigrations\\Version20251031142000','2026-06-03 11:52:52',24),
('DoctrineMigrations\\Version20251031143000','2026-06-03 11:52:52',8),
('DoctrineMigrations\\Version20251214160001','2026-06-03 11:52:52',111),
('DoctrineMigrations\\Version20260616000000','2026-06-16 08:03:50',76),
('DoctrineMigrations\\Version20260722000000','2026-07-22 14:44:28',196),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260525000000','2026-06-03 11:52:52',4),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260601000000','2026-06-03 11:52:52',3),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260608000000','2026-06-08 11:56:50',66),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260629000000','2026-06-29 07:36:27',82),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260629000001','2026-06-29 07:40:08',17),
('KimaiPlugin\\WeeklySubmissionBundle\\Migrations\\Version20260716000000','2026-07-16 12:42:18',98),
('KimaiPluginWeeklySubmissionBundleMigrationsVersion20260722000000','2026-07-22 17:46:57',0);
/*!40000 ALTER TABLE `migration_versions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-27 17:49:27
