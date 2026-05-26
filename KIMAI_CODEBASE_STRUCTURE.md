# Kimai Codebase Structure & Workflow - Complete Exploration

## Executive Summary

Kimai is a **professional time-tracking application** with sophisticated team-based access control. The core concept is:
- **Users** belong to **Teams** 
- **Teams** access **Departments** (organizations/customers), **Projects**, and **Activities**
- **Timesheets** (time entries) are created by users for Projects+Activities within their team's scope
- **All resource access is filtered through team membership**

---

## 1. Entity Relationship Architecture

### Core Entities & Their Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ENTITY                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ username, email, password, roles                         │   │
│  │ timezone, language, avatar                               │   │
│  │ supervisor (ManyToOne to User, self-referential)         │   │
│  │ enabled, last_login, registered_at                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  OneToMany: memberships → TeamMember                            │
│  (User can belong to multiple teams via join table)             │
│  Helper: getTeams() → array of Team                             │
│  Helper: isTeamLead() → bool                                    │
└─────────────────────────────────────────────────────────────────┘
              │
              │ OneToMany
              ├─→ memberships (TeamMember)
              │   ├─→ team, user, teamlead flag
              │
              ├─→ preferences (UserPreference)
              │
              └─→ [implicit] timesheets (Timesheet)

┌─────────────────────────────────────────────────────────────────┐
│                         TEAM ENTITY                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ name (unique)                                            │   │
│  │ color (HEX)                                              │   │
│  │ CONSTRAINT: Must have at least 1 member                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  OneToMany: members → TeamMember                                │
│  ManyToMany: departments ↔ Department                           │
│  ManyToMany: projects ↔ Project                                 │
│  ManyToMany: activities ↔ Activity                              │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ members (TeamMember)
              │   Join table: kimai2_users_teams
              │
              ├─→ departments (Department)
              │   Join table: kimai2_departments_teams
              │   Controls: Which departments teams can access
              │
              ├─→ projects (Project)
              │   Join table: kimai2_projects_teams
              │   Controls: Which projects teams can access
              │
              └─→ activities (Activity)
                  Join table: kimai2_activities_teams
                  Controls: Which activities teams can use

┌─────────────────────────────────────────────────────────────────┐
│                    DEPARTMENT ENTITY                            │
│  (Represents: Organization / Customer / Division)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ name (unique), company, number, vat_id                   │   │
│  │ contact, email, phone, fax, mobile                       │   │
│  │ address (full address with line1-3, postcode, city)      │   │
│  │ currency (default EUR), timezone                         │   │
│  │ country, visible, billable                               │   │
│  │ invoice_template, invoice_text                           │   │
│  │ budget, timeBudget, budgetType (budget tracking)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ManyToMany: teams ↔ Team                                       │
│  OneToMany: projects → Project (each project has 1 dept)        │
│  OneToMany: meta → DepartmentMeta (custom fields)               │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ teams (Team)
              │   Join table: kimai2_departments_teams
              │   Controls: Which teams can access this dept
              │
              ├─→ projects (Project)
              │   Department.id = Project.department_id (FK)
              │   Every project belongs to exactly 1 department
              │
              └─→ meta (DepartmentMeta)
                  Custom fields/metadata

┌─────────────────────────────────────────────────────────────────┐
│                     PROJECT ENTITY                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ name, number (auto-generated)                            │   │
│  │ order_number, order_date                                 │   │
│  │ start, end (date constraints for time tracking)          │   │
│  │ visible, billable                                        │   │
│  │ budget, timeBudget, budgetType                           │   │
│  │ comment, invoice_text                                    │   │
│  │ global_activities (bool - allow global activities)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ManyToOne: department → Department (required)                  │
│  ManyToMany: teams ↔ Team                                       │
│  OneToMany: activities → Activity                               │
│  OneToMany: meta → ProjectMeta                                  │
│  OneToMany: [implicit] timesheets → Timesheet                   │
│  OneToMany: rates → ProjectRate                                 │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ department (Department)
              │   Many projects per department
              │   Every project MUST have a department
              │
              ├─→ teams (Team)
              │   Join table: kimai2_projects_teams
              │   Multiple teams can share a project
              │
              ├─→ activities (Activity)
              │   Project.id = Activity.project_id (FK, nullable)
              │
              ├─→ meta (ProjectMeta)
              │
              └─→ timesheets (Timesheet)
                  [Implicit] Project.id = Timesheet.project_id

┌─────────────────────────────────────────────────────────────────┐
│                    ACTIVITY ENTITY                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ name, number                                             │   │
│  │ comment, visible, billable                               │   │
│  │ budget, timeBudget, budgetType                           │   │
│  │ invoice_text                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ManyToOne: project → Project (optional/nullable)               │
│  - if NULL: Global activity (available to all projects)         │
│  - if set: Project-specific activity                            │
│  ManyToMany: teams ↔ Team                                       │
│  OneToMany: meta → ActivityMeta                                 │
│  OneToMany: [implicit] timesheets → Timesheet                   │
│  OneToMany: rates → ActivityRate                                │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ project (Project)
              │   Optional: NULL = Global, Set = Project-specific
              │
              ├─→ teams (Team)
              │   Join table: kimai2_activities_teams
              │   Controls: Which teams can use this activity
              │
              ├─→ meta (ActivityMeta)
              │
              └─→ timesheets (Timesheet)
                  [Implicit] Activity.id = Timesheet.activity_id

┌─────────────────────────────────────────────────────────────────┐
│                    TIMESHEET ENTITY                             │
│  (Individual time entry record)                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PK: id                                                   │   │
│  │ user_id (FK to User) - who logged time                   │   │
│  │ project_id (FK to Project) - which project               │   │
│  │ activity_id (FK to Activity) - what activity             │   │
│  │ start_time, end_time (DATETIME in user's timezone)       │   │
│  │ date_tz (DATE in user's timezone, for queries)           │   │
│  │ timezone (user's timezone at time of entry)              │   │
│  │ duration (seconds, calculated)                           │   │
│  │ break (seconds)                                          │   │
│  │ description (notes)                                      │   │
│  │ rate (hourly rate used)                                  │   │
│  │ hourly_rate, fixed_rate, internal_rate                   │   │
│  │ billable, billable_mode (auto/yes/no/default)            │   │
│  │ exported (for invoicing)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ManyToOne: user → User (cascade delete)                        │
│  ManyToOne: project → Project (cascade delete)                  │
│  ManyToOne: activity → Activity (cascade delete)                │
│  OneToMany: meta → TimesheetMeta                                │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ user (User)
              │   Who created the entry
              │
              ├─→ project (Project)
              │   Which project the time was for
              │
              ├─→ activity (Activity)
              │   What work was performed
              │
              └─→ meta (TimesheetMeta)
                  Custom fields
```

---

## 2. Access Control Model

### Permission Filtering

**Key Principle**: Everything is filtered through **Team Membership**

```
User has Teams → User.getTeams() → [Team A, Team B, ...]
      ↓
Each Team has access to:
      ├─ Departments (Team.departments ManyToMany)
      ├─ Projects (Team.projects ManyToMany)
      └─ Activities (Team.activities ManyToMany)
      ↓
User can ONLY see/use:
      ├─ Departments assigned to their teams
      ├─ Projects assigned to their teams
      ├─ Activities assigned to their teams
      └─ Timesheets for those projects/activities
```

### Query Filtering Example (from ProjectRepository)

```php
// When user queries projects:
$user->getTeams();  // [Team A, Team B]

// ProjectRepository adds WHERE clause:
WHERE (
    // Projects either have NO team restriction (visible to all)
    SIZE(projects.teams) = 0 
    
    OR 
    
    // OR user's team is in the project's teams
    Team A IN projects.teams OR Team B IN projects.teams
)
AND (
    // AND same logic for department
    SIZE(departments.teams) = 0 
    OR 
    Team A IN departments.teams OR Team B IN departments.teams
)

// Result: User only sees projects accessible by their teams
```

### Role Hierarchy

```
ROLE_SUPER_ADMIN
    └─ Can see/do everything
    └─ No team restrictions
    └─ Administrative functions

ROLE_ADMIN
    └─ User management
    └─ Team management
    └─ Project management
    └─ Department management
    └─ Subject to team restrictions

ROLE_TEAMLEAD
    └─ Can manage team members' timesheets
    └─ Can view team reporting
    └─ Can see team members' entries
    └─ Subject to team restrictions
    └─ Flag: TeamMember.teamlead = true

ROLE_USER
    └─ Can track own time
    └─ Can see own timesheets
    └─ Subject to team restrictions
    └─ Cannot see others' timesheets
```

---

## 3. Complete Workflow: System Setup to Time Tracking

### PHASE 1: Initialize System (Admin Setup)

#### Step 1.1: Create Department
```
Department "ACME Corp"
├─ name: "ACME Corp"
├─ company: "ACME Corporation"
├─ currency: "USD"
├─ timezone: "America/New_York"
├─ country: "US"
├─ visible: true
├─ billable: true
└─ contact info (email, phone, address, etc.)

File: src/Controller/DepartmentController.php
Service: DepartmentService::saveDepartment()
Entity: Department.php
```

#### Step 1.2: Create Project (in Department)
```
Project "Website Redesign"
├─ name: "Website Redesign"
├─ department: Department "ACME Corp" [ManyToOne, Required]
├─ number: auto-generated (e.g., "PROJ-001")
├─ start: 2024-01-01
├─ end: 2024-12-31
├─ visible: true
├─ billable: true
├─ teams: [] (initially empty, will be assigned in Step 2.1)
└─ budget: $50,000

File: src/Controller/ProjectController.php::createProject()
Service: ProjectService::createNewProject()
  - If config 'project.copy_teams_on_create' enabled:
    - Auto-assigns creator's teams to project
```

#### Step 1.3: Create Activities (in Project)
```
Activity 1: "Frontend Development"
├─ name: "Frontend Development"
├─ project: Project "Website Redesign" [ManyToOne]
├─ visible: true
├─ billable: true
└─ teams: [] (will assign in Phase 2)

Activity 2: "Backend Development"
├─ name: "Backend Development"
├─ project: Project "Website Redesign"
└─ ...

Activity 3: "Team Meeting" (Global)
├─ name: "Team Meeting"
├─ project: NULL (no project = global activity)
├─ visible: true
├─ billable: false (internal only)
└─ teams: [] (will assign in Phase 2)

File: src/Controller/ActivityController.php
Service: ActivityService
```

---

### PHASE 2: Team Management (Team Lead Setup)

#### Step 2.1: Create Team
```
Team "Dev Team"
├─ name: "Dev Team"
├─ color: "#0066FF"
├─ members: [] (initially empty)
├─ departments: [] (initially empty)
├─ projects: [] (initially empty)
├─ activities: [] (initially empty)
└─ CONSTRAINT: Must have at least 1 member before saving

File: src/Controller/TeamController.php::createTeam()
Service: TeamService::createNewTeam(name)
  1. Create Team entity
  2. Dispatch TeamCreateEvent
  3. Form submission → saveTeam()
  4. TeamCreatePreEvent → persist → TeamCreatePostEvent
```

#### Step 2.2: Add Users to Team (Create Memberships)
```
Add Alice to Team "Dev Team" as TEAMLEAD:
├─ Create TeamMember
│  ├─ user: User "Alice"
│  ├─ team: Team "Dev Team"
│  └─ teamlead: true
├─ Insert into kimai2_users_teams
└─ Now: Alice.getTeams() includes "Dev Team"

Add Bob to Team "Dev Team" as MEMBER:
├─ Create TeamMember
│  ├─ user: User "Bob"
│  ├─ team: Team "Dev Team"
│  └─ teamlead: false
├─ Insert into kimai2_users_teams
└─ Now: Bob.getTeams() includes "Dev Team"

File: src/Controller/TeamController.php::editTeam()
Relationship: TeamMember join table (kimai2_users_teams)
  - User.memberships OneToMany → TeamMember
  - Team.members OneToMany → TeamMember
```

#### Step 2.3: Assign Resources to Team

**Assign Departments**:
```
Team "Dev Team".addDepartment(Department "ACME Corp")
├─ Insert into kimai2_departments_teams
└─ Now: Team members can see ACME Corp projects

Relationship: Team.departments ManyToMany ↔ Department
```

**Assign Projects**:
```
Team "Dev Team".addProject(Project "Website Redesign")
├─ Insert into kimai2_projects_teams
└─ Now: Team members can create timesheets in Website Redesign

Relationship: Team.projects ManyToMany ↔ Project
```

**Assign Activities**:
```
Team "Dev Team".addActivity(Activity "Frontend Development")
Team "Dev Team".addActivity(Activity "Backend Development")
Team "Dev Team".addActivity(Activity "Team Meeting")
├─ Insert into kimai2_activities_teams
└─ Now: Team members can select these activities in timesheets

Relationship: Team.activities ManyToMany ↔ Activity
```

---

### PHASE 3: Time Tracking (Developer Usage)

#### Step 3.1: User Login and Views Available Work

**Alice logs in**:
```
1. System identifies Alice
2. Queries: Alice.getTeams() → [Team "Dev Team"]
3. For Team "Dev Team", retrieves:
   ├─ Departments: [ACME Corp]
   ├─ Projects: [Website Redesign]
   └─ Activities: [Frontend Dev, Backend Dev, Team Meeting]
4. Alice sees only these items in UI
```

#### Step 3.2: User Creates Timesheet Entry

**Alice starts tracking time on Frontend Development**:
```
1. Alice selects: Project "Website Redesign"
2. Alice selects: Activity "Frontend Development"
3. Alice clicks "Start Timer"
4. System creates Timesheet:
   {
     id: (auto-increment),
     user_id: Alice's PK,
     project_id: Website Redesign PK,
     activity_id: Frontend Dev PK,
     start_time: 2024-05-26 09:00:00,
     end_time: NULL (running),
     timezone: "America/New_York" (Alice's timezone),
     date_tz: 2024-05-26,
     duration: 0 (will update when stopped),
     rate: (calculated from config),
     billable: true,
     description: ""
   }

5. Validation (TimesheetConstraint):
   ✓ Project visible
   ✓ Activity visible
   ✓ Project date range OK (2024-01-01 to 2024-12-31)
   ✓ User has permission to start
   ✓ No overlapping entries (if lockdown enabled)

6. Events:
   → TimesheetCreatePreEvent
   → DB INSERT into kimai2_timesheet
   → TimesheetCreatePostEvent

7. If Alice had a previous running timesheet:
   → System stops it automatically
   → Updates its end_time
   → Calculates duration
```

#### Step 3.3: User Stops and Saves Timesheet

**After 2 hours, Alice stops the timer**:
```
1. Alice clicks "Stop"
2. System updates Timesheet:
   {
     end_time: 2024-05-26 11:00:00,
     duration: 7200 (seconds)
   }

3. TimesheetService::updateTimesheet()
   → TimesheetUpdatePreEvent
   → DB UPDATE kimai2_timesheet
   → TimesheetUpdatePostEvent

4. Timesheet now appears as COMPLETED entry
5. Alice can:
   ├─ Edit start/end times, description
   ├─ Change billable status
   ├─ Delete if allowed
   └─ View in reports
```

#### Step 3.4: Manager Views Team Timesheets

**Alice (as teamlead) views team timesheets**:
```
1. Alice navigates to Team Reporting
2. Query filters by:
   ├─ Team members: Bob, Carol (her team)
   ├─ Date range
   └─ Projects/activities (optional filter)
3. Shows all timesheets from team members:
   ├─ Bob's entries in Website Redesign
   ├─ Carol's entries in Website Redesign
   └─ Grouped by: User, Project, Activity, Date
4. Displays:
   ├─ Total hours
   ├─ Total billable amount
   ├─ Hourly rates
   ├─ Duration per entry
   ├─ Can export to CSV/Excel
   └─ Can generate invoice from billable entries
```

---

## 4. Key Services & Their Responsibilities

### User & Team Management
```
TeamService (src/User/TeamService.php):
├─ createNewTeam(name: string): Team
├─ saveTeam(team: Team): Team
│  └─ Validates (unique name, ≥1 member)
│  └─ Dispatches: TeamCreatePreEvent → save → TeamCreatePostEvent
├─ updateTeam(team: Team): Team
├─ deleteTeam(team: Team): void
├─ findTeamByName(name: string): ?Team
├─ hasTeams(): bool
└─ countTeams(): int

UserService (src/User/UserService.php):
├─ Creates and manages user accounts
├─ Handles registration, password reset
├─ User activation/deactivation
└─ User-team membership managed via TeamController
```

### Project Management
```
ProjectService (src/Project/ProjectService.php):
├─ createNewProject(?Department): Project
│  ├─ Auto-generates project number
│  ├─ Loads meta field definitions
│  └─ If 'project.copy_teams_on_create' config:
│     └─ Adds creator's teams to project
├─ saveNewProject(project, context: ?Context): Project
│  └─ Validates, dispatches ProjectCreatePreEvent/PostEvent
├─ updateProject(project): Project
├─ deleteProject(project, replace: ?Project): void
├─ findProjectByName(name, department): ?Project
├─ findProjectByNumber(number: string): ?Project
└─ calculateNextProjectNumber(): ?string

ProjectStatisticService:
├─ Calculates project budgets
├─ Tracks time budget usage
└─ Generates project statistics
```

### Time Tracking
```
TimesheetService (src/Timesheet/TimesheetService.php):
├─ createNewTimesheet(user: User, request: ?Request): Timesheet
├─ prepareNewTimesheet(timesheet, request): Timesheet
│  ├─ Dispatches TimesheetMetaDefinitionEvent
│  ├─ Calls tracking mode create()
│  └─ Sets billableMode to AUTO
├─ saveNewTimesheet(timesheet): Timesheet
│  ├─ Validates all fields
│  ├─ Checks authorization
│  ├─ Fixes timezone conversion
│  ├─ Dispatches TimesheetCreatePreEvent
│  ├─ Saves to DB
│  ├─ Stops any running timesheets
│  └─ Dispatches TimesheetCreatePostEvent
├─ updateTimesheet(timesheet): Timesheet
├─ saveTimesheet(timesheet): Timesheet (auto-routes to new/update)
├─ validateTimesheet(timesheet): void
│  ├─ Checks project visible
│  ├─ Checks activity visible
│  ├─ Checks time within project date range
│  └─ Calculates duration
├─ stopActiveEntries(timesheet): void
│  └─ Stops any running timesheets for user
└─ deleteTimesheet(timesheet): void

RateService:
├─ Calculates hourly rates
├─ Handles user/department/project specific rates
├─ Tracks internal rates
└─ Applies rate overrides
```

---

## 5. Database Tables (Key Structure)

```
kimai2_users
├─ id (PK)
├─ username, email, password
├─ enabled, roles (array)
├─ timezone, language
├─ last_login, registered_at
└─ supervisor_id (FK to users, optional)

kimai2_users_teams (JOIN TABLE)
├─ id (PK)
├─ user_id (FK)
├─ team_id (FK)
├─ teamlead (BOOLEAN)
└─ UNIQUE(user_id, team_id)

kimai2_teams
├─ id (PK)
├─ name (UNIQUE)
├─ color
└─ created_at

kimai2_departments
├─ id (PK)
├─ name
├─ company, vat_id
├─ address, address_line1-3, city, postcode, country
├─ email, phone, fax, mobile
├─ currency, timezone
├─ visible, billable
└─ invoice info fields

kimai2_departments_teams (JOIN TABLE)
├─ department_id (FK)
├─ team_id (FK)
└─ PRIMARY(department_id, team_id)

kimai2_projects
├─ id (PK)
├─ department_id (FK, NOT NULL)
├─ name, number
├─ order_number, order_date
├─ start, end (date constraints)
├─ visible, billable
├─ global_activities
└─ budget, time_budget, budget_type

kimai2_projects_teams (JOIN TABLE)
├─ project_id (FK)
├─ team_id (FK)
└─ PRIMARY(project_id, team_id)

kimai2_activities
├─ id (PK)
├─ project_id (FK, NULLABLE)
├─ name, number
├─ visible, billable
└─ budget, time_budget, budget_type

kimai2_activities_teams (JOIN TABLE)
├─ activity_id (FK)
├─ team_id (FK)
└─ PRIMARY(activity_id, team_id)

kimai2_timesheet
├─ id (PK)
├─ user (FK to kimai2_users, NOT NULL)
├─ project_id (FK, NOT NULL)
├─ activity_id (FK, NOT NULL)
├─ start_time, end_time (DATETIME)
├─ timezone (VARCHAR 64)
├─ date_tz (DATE, for statistics)
├─ duration (INT, seconds)
├─ break (INT, seconds)
├─ description (TEXT)
├─ rate, hourly_rate, fixed_rate, internal_rate
├─ billable, billable_mode
├─ exported
└─ INDEXES: user, start_time, end_time, date_tz (performance optimized)
```

---

## 6. Key Controllers & Routes

### Admin Panel Routes
```
/admin/user (UserController)
├─ GET /admin/user → list users
├─ GET /admin/user/create → create form
├─ POST /admin/user → save new
├─ GET /admin/user/{id}/edit → edit form
└─ POST/PUT/DELETE → update/delete

/admin/team (TeamController)
├─ GET /admin/teams → list teams
├─ GET /admin/teams/create → create form
├─ POST /admin/teams → save new
├─ GET /admin/teams/{id}/edit → edit (add members, resources)
├─ POST /admin/teams/{id} → update team
└─ DELETE /admin/teams/{id} → delete

/admin/project (ProjectController)
├─ GET /admin/project → list projects
├─ GET /admin/project/create → create form
├─ POST /admin/project → save new
├─ GET /admin/project/{id}/edit → edit form
├─ POST /admin/project/{id}/team → assign/remove teams
└─ DELETE /admin/project/{id} → delete

/admin/activity (ActivityController)
├─ GET /admin/activity → list activities
├─ GET /admin/activity/create → create form
├─ POST /admin/activity → save new
├─ GET /admin/activity/{id}/edit → edit form
└─ DELETE /admin/activity/{id} → delete

/admin/department (DepartmentController)
├─ GET /admin/department → list departments
├─ GET /admin/department/create → create form
├─ POST /admin/department → save new
├─ GET /admin/department/{id}/edit → edit form
└─ DELETE /admin/department/{id} → delete
```

### User Panel Routes
```
/user/timesheet (TimesheetController)
├─ GET /user/timesheet → list user's timesheets
├─ GET /user/timesheet/create → new entry form
├─ POST /user/timesheet → create entry
├─ GET /user/timesheet/{id}/edit → edit form
├─ POST /user/timesheet/{id} → update entry
└─ DELETE /user/timesheet/{id} → delete entry

/team/timesheet (TimesheetTeamController)
├─ GET /team/timesheet → team members' timesheets (if teamlead)
└─ Can filter by member, project, date range
```

---

## 7. Event-Driven Architecture

### Pre/Post Event Pattern
```
For each major operation:

TEAM:
├─ TeamCreateEvent (during instantiation)
├─ TeamCreatePreEvent (before persist)
├─ [DB PERSIST]
└─ TeamCreatePostEvent (after persist)

PROJECT:
├─ ProjectCreateEvent (during instantiation)
├─ ProjectCreatePreEvent (before persist)
├─ [DB PERSIST]
└─ ProjectCreatePostEvent (after persist)

TIMESHEET:
├─ TimesheetCreatePreEvent (before persist)
├─ [DB PERSIST]
├─ TimesheetCreatePostEvent (after persist)
├─ TimesheetUpdatePreEvent (before update)
├─ [DB UPDATE]
├─ TimesheetUpdatePostEvent (after update)
├─ TimesheetDeletePreEvent (before delete)
├─ [DB DELETE]
└─ TimesheetDeletePostEvent (after delete)
```

### Event Listeners
Plugins and extensions hook into these events to:
- Validate data
- Update related entities
- Send notifications
- Log audit trails
- Sync to external systems

---

## 8. Quick Reference: Complete User Flow

### Day 1: System Admin
```
1. Create Department "ACME Corp"
   → DepartmentController::createDepartment()
   → Department saved with company info

2. Create Project "Website" under ACME Corp
   → ProjectController::createProject()
   → ProjectService::createNewProject(acme_department)
   → Project auto-assigned to admin's teams (if config enabled)

3. Create Activities: "Dev", "QA", "Design"
   → ActivityController::createActivity()
   → Activities saved, assignable to teams
```

### Day 2: Team Lead
```
1. Create Team "Dev Team"
   → TeamController::createTeam()
   → Team created (empty, needs members)

2. Add team members: Alice (lead), Bob, Carol
   → TeamController::editTeam()
   → Add users, mark Alice as teamlead
   → TeamMembers created in kimai2_users_teams
   → TeamUpdateEvent dispatched

3. Assign resources to team:
   - Add Department "ACME Corp" → Team.departments
   - Add Project "Website" → Team.projects
   - Add Activities "Dev", "QA" → Team.activities

4. Result: Team members can now see/use these resources
```

### Day 3+: Developer
```
1. Alice logs in
   → System loads Alice.getTeams() → [Dev Team]
   → UI shows only Dev Team's departments/projects/activities

2. Alice creates timesheet:
   → Select Project "Website"
   → Select Activity "Dev"
   → Set start/end times
   → Submit

3. TimesheetService::saveNewTimesheet():
   ├─ Validate: project visible, activity visible, time OK
   ├─ Fix timezone: convert to Alice's timezone
   ├─ TimesheetCreatePreEvent
   ├─ INSERT into kimai2_timesheet
   ├─ Stop any running entries
   └─ TimesheetCreatePostEvent

4. Entry saved, appears in:
   - Alice's timesheet list
   - Team lead Alice's team report
   - Project "Website" statistics
   - Invoicing reports
```

---

## File Locations Reference

### Core Entities
```
src/Entity/
├─ User.php (User account, team memberships)
├─ Team.php (Team with members/departments/projects/activities)
├─ TeamMember.php (User-Team join table)
├─ Department.php (Organization/Customer)
├─ Project.php (Project within department)
├─ Activity.php (Work type/task)
├─ Timesheet.php (Time entry record)
└─ Role.php, RolePermission.php (RBAC)
```

### Services
```
src/User/
├─ TeamService.php
├─ UserService.php
└─ PermissionService.php

src/Project/
├─ ProjectService.php
├─ ProjectStatisticService.php
└─ ProjectDuplicationService.php

src/Timesheet/
├─ TimesheetService.php
├─ TimesheetStatisticService.php
└─ TrackingMode/ (different tracking modes)
```

### Controllers
```
src/Controller/
├─ TeamController.php (admin/teams)
├─ UserController.php (admin/user)
├─ ProjectController.php (admin/project)
├─ ActivityController.php (admin/activity)
├─ DepartmentController.php (admin/department)
├─ TimesheetController.php (user/timesheet)
└─ TimesheetTeamController.php (team/timesheet)
```

### Repositories
```
src/Repository/
├─ TeamRepository.php
├─ UserRepository.php
├─ ProjectRepository.php
├─ ActivityRepository.php
├─ DepartmentRepository.php
└─ TimesheetRepository.php
```

