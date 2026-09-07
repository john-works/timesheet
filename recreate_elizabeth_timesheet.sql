-- =============================================================
-- Recreate Elizabeth Mary Amulen (user 475) weekly timesheet
-- entries from her WeeklySubmissions (8h per Mon-Fri workday).
-- Source: backup timesheet_20260904_142827.sql submissions (user 448).
-- project 53 (PPDA), activity 680 (Normal Work)
-- 34 entries across 7 submission weeks.
-- =============================================================
SET NAMES utf8mb4;

INSERT INTO kimai2_timesheet
(user, activity_id, project_id, start_time, end_time, duration, description, rate, exported, timezone, billable, category, modified_at, date_tz, break)
VALUES
(475,680,53,'2026-07-13 05:00:00','2026-07-13 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-13","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-13',3600),
(475,680,53,'2026-07-14 05:00:00','2026-07-14 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-13","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-14',3600),
(475,680,53,'2026-07-15 05:00:00','2026-07-15 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-13","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-15',3600),
(475,680,53,'2026-07-16 05:00:00','2026-07-16 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-13","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-16',3600),
(475,680,53,'2026-07-17 05:00:00','2026-07-17 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-13","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-17',3600),
(475,680,53,'2026-07-20 05:00:00','2026-07-20 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-20","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-20',3600),
(475,680,53,'2026-07-21 05:00:00','2026-07-21 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-20","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-21',3600),
(475,680,53,'2026-07-22 05:00:00','2026-07-22 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-20","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-22',3600),
(475,680,53,'2026-07-23 05:00:00','2026-07-23 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-20","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-23',3600),
(475,680,53,'2026-07-24 05:00:00','2026-07-24 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-20","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-24',3600),
(475,680,53,'2026-07-27 05:00:00','2026-07-27 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-27","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-27',3600),
(475,680,53,'2026-07-28 05:00:00','2026-07-28 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-27","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-28',3600),
(475,680,53,'2026-07-29 05:00:00','2026-07-29 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-27","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-29',3600),
(475,680,53,'2026-07-30 05:00:00','2026-07-30 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-07-27","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-07-30',3600),
(475,680,53,'2026-08-03 05:00:00','2026-08-03 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-03","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-03',3600),
(475,680,53,'2026-08-04 05:00:00','2026-08-04 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-03","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-04',3600),
(475,680,53,'2026-08-05 05:00:00','2026-08-05 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-03","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-05',3600),
(475,680,53,'2026-08-06 05:00:00','2026-08-06 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-03","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-06',3600),
(475,680,53,'2026-08-07 05:00:00','2026-08-07 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-03","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-07',3600),
(475,680,53,'2026-08-10 05:00:00','2026-08-10 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-10","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-10',3600),
(475,680,53,'2026-08-11 05:00:00','2026-08-11 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-10","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-11',3600),
(475,680,53,'2026-08-12 05:00:00','2026-08-12 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-10","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-12',3600),
(475,680,53,'2026-08-13 05:00:00','2026-08-13 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-10","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-13',3600),
(475,680,53,'2026-08-14 05:00:00','2026-08-14 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-10","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-14',3600),
(475,680,53,'2026-08-17 05:00:00','2026-08-17 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-17","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-17',3600),
(475,680,53,'2026-08-18 05:00:00','2026-08-18 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-17","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-18',3600),
(475,680,53,'2026-08-19 05:00:00','2026-08-19 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-17","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-19',3600),
(475,680,53,'2026-08-20 05:00:00','2026-08-20 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-17","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-20',3600),
(475,680,53,'2026-08-21 05:00:00','2026-08-21 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-17","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-21',3600),
(475,680,53,'2026-08-24 05:00:00','2026-08-24 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-24","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-24',3600),
(475,680,53,'2026-08-25 05:00:00','2026-08-25 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-24","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-25',3600),
(475,680,53,'2026-08-26 05:00:00','2026-08-26 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-24","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-26',3600),
(475,680,53,'2026-08-27 05:00:00','2026-08-27 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-24","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-27',3600),
(475,680,53,'2026-08-28 05:00:00','2026-08-28 14:00:00',28800,'[{"task":"Recreated from weekly submission 2026-08-24","status":"Completed"}]',0,0,'Africa/Kampala',1,'work',NOW(),'2026-08-28',3600);
