SET NAMES utf8mb4;
-- Restore Elizabeth Mary Amulen (live user 475) weekly submissions
-- from backup timesheet_20260904_142827.sql (user 448).
-- Preserves original statuses so she cannot re-submit:
--   4 approved (07-13, 07-20, 07-27, 08-03) + 3 submitted (08-10, 08-17, 08-24)
INSERT INTO kimai2_weekly_submissions
(user_id, approved_by, week_start, status, submitted_at, approved_at, supervisor_notes, total_duration,
 manager_approved_by, manager_approved_at, manager_notes, reassigned_to, original_supervisor,
 is_overtime, overtime_hours, hr_approved_by, hr_approved_at, hr_notes, manager_hr_approved_by, manager_hr_approved_at, manager_hr_notes)
VALUES
(475,225,'2026-07-13','approved','2026-08-07 11:40:20','2026-08-13 08:15:04','well done',144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,225,'2026-07-20','approved','2026-08-07 11:40:20','2026-08-13 08:15:04','well done',144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,225,'2026-07-27','approved','2026-08-07 11:40:20','2026-08-13 08:15:04','well done',115200,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,225,'2026-08-03','approved','2026-08-07 11:40:20','2026-08-13 08:15:04','well done',144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,NULL,'2026-08-10','submitted','2026-08-14 10:41:03',NULL,NULL,144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,NULL,'2026-08-17','submitted','2026-08-21 13:49:34',NULL,NULL,144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL),
(475,NULL,'2026-08-24','submitted','2026-08-31 05:45:55',NULL,NULL,144000,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL);
