# Dogwood Player Portal Product Requirements Document

## 1. Product Overview

### Product Name
Dogwood Player Portal

### Business Context
Dogwood Golf & Social is a golf instruction and player development company with multiple coaches supporting students across lessons, practice, performance goals, progress tracking, fitness, physical therapy, and family communication.

### Product Purpose
Dogwood Player Portal is a web application that centralizes player development records and communication across students, coaches, parents, administrators, and Fitness/PT staff. The platform gives each role the right level of access to lesson history, practice plans, goals, progress metrics, videos, files, fitness plans, and internal notes.

### Primary Goals
- Create a single source of truth for each player's development journey.
- Help coaches document lessons, assign practice, set goals, and monitor progress.
- Give students and parents clear visibility into plans, notes, goals, and progress.
- Enable Fitness/PT staff to contribute movement screens, fitness plans, and fitness notes.
- Give administrators control over users, assignments, programs, and platform data.

### Success Metrics
- 90% of active students have a complete profile, assigned coach, and assigned program.
- 80% of completed lessons have coach notes entered within 24 hours.
- 75% of active students have at least one current practice plan.
- 70% of active students have at least one active goal.
- Parent/student portal engagement increases month over month after launch.
- Coaches report reduced time searching for historical notes, videos, and files.

## 2. Target Users

### Admin
Operations or leadership users responsible for managing the platform, user accounts, coach/student/parent assignments, programs, and visibility across all data.

### Coach
Golf instructors responsible for assigned students. Coaches create lesson notes, practice plans, goals, progress updates, videos, files, and internal notes.

### Student
Players receiving instruction. Students can view their profile, assigned coach, assigned program, lesson history, practice plans, goals, progress metrics, and uploaded media/files.

### Parent
Parents or guardians linked to junior players. Parents can view approved player development information for their linked junior players.

### Fitness/PT
Fitness, movement, or physical therapy staff assigned to students. They can view assigned students and contribute fitness plans, movement screens, and fitness notes.

## 3. Product Scope

### In Scope
- Authentication and role-based access control.
- Student profiles.
- Coach, parent, program, and Fitness/PT assignments.
- Lesson history and lesson notes.
- Practice plans.
- Goals.
- Development priorities.
- Assessments.
- Progress metrics.
- Tournament results and upcoming tournaments.
- Video and file uploads.
- Internal coach notes.
- Fitness plans.
- Workout assignments.
- Movement screens.
- Fitness notes.
- Admin user and program management.
- Program templates for default development priorities, assessments, practice plans, goals, and workout assignments.

### Out of Scope for MVP
- Billing and payments.
- Lesson scheduling and calendar booking.
- Messaging with real-time chat.
- Mobile native applications.
- Advanced analytics dashboards.
- Wearable/device integrations.
- AI swing analysis.
- Public marketing website.

## 4. Assumptions

- The first release is a responsive web application optimized for desktop and mobile browsers.
- A user may have more than one role if needed, but MVP permissions are role-based.
- Students are assigned to one primary coach for MVP.
- Parents may be linked to one or more junior students.
- Fitness/PT users may be assigned to one or more students.
- Uploaded videos and files are private and permission-controlled.
- Internal notes are visible only to coaches and admins unless explicitly changed later.

## 5. User Stories

### Admin User Stories
- As an admin, I want to create and manage user accounts so that the right people can access the platform.
- As an admin, I want to assign roles to users so that each user has appropriate permissions.
- As an admin, I want to assign coaches to students so that each student has a clear development owner.
- As an admin, I want to assign parents to junior students so that parents can follow their child's progress.
- As an admin, I want to assign Fitness/PT users to students so that physical development staff can contribute to the right records.
- As an admin, I want to assign students to programs so that development plans can be grouped by offering.
- As an admin, I want to create program templates so that Dogwood can define reusable default development priorities, assessments, practice plans, goals, and workout assignments.
- As an admin, I want to create student records from a selected program template during enrollment so that new students start with a complete development structure.
- As an admin, I want to view each student's Snapshot Dashboard so that I can quickly understand current priorities, recent activity, and upcoming needs.
- As an admin, I want to view all student profiles, notes, plans, goals, metrics, videos, and files so that I can oversee the business.
- As an admin, I want to manage programs so that Dogwood can support different instruction tracks.

### Coach User Stories
- As a coach, I want to view my assigned students so that I can quickly access the players I support.
- As a coach, I want to view a student profile so that I can understand their background, program, and development history.
- As a coach, I want the Student Snapshot Dashboard to be the default homepage so that I can immediately see what matters most for each player.
- As a coach, I want to create development priorities so that each student has a clear short list of current focus areas.
- As a coach, I want to record assessments so that skill evaluations and benchmark results are tracked over time.
- As a coach, I want to record tournament results and upcoming tournaments so that competitive performance and preparation context are visible.
- As a coach, I want to create lesson notes so that students and parents can review what was covered.
- As a coach, I want to create practice plans so that students know what to work on between lessons.
- As a coach, I want to create goals so that student development is specific and measurable.
- As a coach, I want to upload videos so that swing footage and training clips are stored with the student record.
- As a coach, I want to upload files so that supporting documents are available in one place.
- As a coach, I want to write internal notes so that I can track private coaching context.
- As a coach, I want to track student progress metrics so that I can monitor development over time.

### Student User Stories
- As a student, I want to view my profile so that I can see my player information.
- As a student, I want to see my assigned coach so that I know who is responsible for my development.
- As a student, I want to see my assigned program so that I understand my current training track.
- As a student, I want my homepage to show a snapshot of my current priorities, goals, plan, recent results, latest video, upcoming tournaments, and workout status so that I know what to focus on next.
- As a student, I want to view development priorities so that I understand the most important areas of improvement.
- As a student, I want to view assessment results so that I can understand recent evaluations.
- As a student, I want to view tournament results and upcoming tournaments so that I can track competitive performance and preparation.
- As a student, I want to view workout assignments so that I know what fitness work is expected.
- As a student, I want to view lesson history so that I can review previous coaching sessions.
- As a student, I want to view practice plans so that I know what to practice.
- As a student, I want to view goals so that I understand what I am working toward.
- As a student, I want to view progress metrics so that I can see improvement over time.
- As a student, I want to view uploaded videos and files so that I can review supporting materials.

### Parent User Stories
- As a parent, I want to view my linked junior players so that I can follow each child's development.
- As a parent, I want to view lesson notes so that I understand what happened during instruction.
- As a parent, I want to view practice plans so that I can support practice outside of lessons.
- As a parent, I want to view goals so that I understand the player's priorities.
- As a parent, I want to view the Student Snapshot Dashboard for each linked junior player so that I can quickly understand current focus areas and recent progress.
- As a parent, I want to view assessments, tournament results, upcoming tournaments, and workout status so that I can support the player's full development plan.
- As a parent, I want to view progress so that I can track development over time.

### Fitness/PT User Stories
- As a Fitness/PT user, I want to view my assigned students so that I can support the right players.
- As a Fitness/PT user, I want to view the Student Snapshot Dashboard so that I understand current golf priorities, recent assessments, and workout status before adding fitness work.
- As a Fitness/PT user, I want to create fitness plans so that students have structured physical development work.
- As a Fitness/PT user, I want to assign workouts so that students have specific physical work to complete.
- As a Fitness/PT user, I want to upload movement screens so that movement assessments are stored with the student record.
- As a Fitness/PT user, I want to add fitness notes so that coaches and admins can understand physical considerations.

## 6. Functional Requirements

### Authentication and Authorization
- Users must be able to log in securely.
- Users must only access data allowed by their role and assignments.
- The system must support Admin, Coach, Student, Parent, and Fitness/PT roles.
- The system should support future multi-role users.
- User sessions must expire after a configurable period of inactivity.

### Student Profiles
- The system must store a student profile with identifying and development information.
- Students must be assigned to a coach.
- Students must be assigned to a program.
- The student homepage must default to the Student Snapshot Dashboard.
- Admins can create, edit, archive, and view all student profiles.
- Coaches can view assigned student profiles.
- Students can view their own profile.
- Parents can view linked junior player profiles.
- Fitness/PT users can view assigned student profiles.

### Coach Assignments
- Admins can assign and reassign coaches to students.
- Coaches can view only students assigned to them unless they also have admin permissions.
- Assignment history should be retained for audit purposes.

### Parent Assignments
- Admins can link parents to junior students.
- A parent can be linked to multiple students.
- A student can be linked to multiple parents/guardians.

### Fitness/PT Assignments
- Admins can assign Fitness/PT users to students.
- Fitness/PT users can view only students assigned to them unless they also have admin permissions.
- Assignment history should be retained for audit purposes.

### Programs
- Admins can create, edit, archive, and view programs.
- Each student must have one active assigned program in MVP.
- Programs should include name, description, status, and optional default structure.
- Programs can have one or more program templates.
- Admins can designate one default program template per program.

### Program Templates
- Admins can create, edit, duplicate, archive, and view program templates.
- Program templates allow Dogwood to define default development priorities, assessments, practice plans, goals, and workout assignments.
- Program templates must belong to a program.
- Program templates must support draft and active states so Dogwood can prepare templates before using them.
- Program template items must include enough default content to create the corresponding student-specific records.
- When enrolling a student in a program, admins should be able to select a program template and create records from that template.
- Template-generated records become normal student records after creation and can be edited according to the standard permissions for each record type.
- The system should preserve the source program template and source template item on generated records for auditability.

### Student Snapshot Dashboard
- The Student Snapshot Dashboard must be the default homepage after login for students.
- Coaches, admins, parents, and Fitness/PT users must be able to access the Student Snapshot Dashboard from any student record they are permitted to view.
- The dashboard must display current development priorities, active goals, current practice plan, recent assessment results, recent progress metrics, latest lesson note, latest uploaded video, upcoming tournaments, and workout status.
- The dashboard must prioritize current and recent information, with clear links into the full detail views for each section.
- The dashboard must respect all role-based and assignment-based visibility rules.

### Development Priorities
- Coaches and admins can create development priorities for assigned or accessible students.
- Development priorities must include title, category, description, owner, status, priority level, and target date.
- Development priorities should be limited to a small active set so the Student Snapshot Dashboard remains focused.
- Students and linked parents can view active development priorities.
- Fitness/PT users can view development priorities for assigned students.

### Assessments
- Coaches, admins, and Fitness/PT users can create assessments for students they can access.
- Assessments must include assessment type, assessment date, summary, scores or findings, assessor, visibility, and optional attachments.
- Assessment types may include golf skills, swing, putting, short game, on-course, fitness, movement, or custom.
- Students and linked parents can view visible assessment results.
- Recent assessment results must appear on the Student Snapshot Dashboard.

### Lesson History and Lesson Notes
- Coaches can create lesson notes for assigned students.
- Lesson notes must include student, coach, date, title or focus area, public notes, and optional attachments.
- Lesson notes may include visibility settings if needed in later phases.
- Students and linked parents can view lesson notes.
- Admins can view all lesson notes.

### Practice Plans
- Coaches can create practice plans for assigned students.
- Practice plans must include title, description, assigned date, status, and practice items.
- Practice items may include drills, instructions, duration, frequency, and related files/videos.
- Students and linked parents can view active and historical practice plans.
- Admins can view all practice plans.

### Goals
- Coaches can create goals for assigned students.
- Goals must include title, description, category, target date, status, and progress indicator.
- Goals may be linked to progress metrics.
- Students and linked parents can view goals.
- Admins can view all goals.

### Progress Metrics
- Coaches can record and update student progress metrics.
- Metrics should support categories such as swing, scoring, skills, practice, fitness, and custom measures.
- Metrics must support time-based tracking.
- Students and linked parents can view progress metrics.
- Admins can view all progress metrics.

### Tournament Results and Upcoming Tournaments
- Coaches and admins can record tournament results for assigned or accessible students.
- Tournament results must include event name, event date, course or location, score, finish, field size, notes, and optional stat details.
- Coaches and admins can add upcoming tournaments to a student record.
- Upcoming tournaments must include event name, start date, end date, course or location, preparation notes, and status.
- Students and linked parents can view tournament results and upcoming tournaments.
- Upcoming tournaments must appear on the Student Snapshot Dashboard.

### Videos and Files
- Coaches can upload videos and files for assigned students.
- Fitness/PT users can upload movement screens and related files for assigned students.
- Uploaded assets must be associated with a student and uploader.
- Students and linked parents can view uploaded assets permitted for them.
- Admins can view all uploaded assets.
- Supported MVP file types should include common video, image, PDF, and document formats.

### Internal Notes
- Coaches can write internal notes for assigned students.
- Internal notes are visible to coaches who have permission for the student and admins.
- Internal notes are not visible to students, parents, or Fitness/PT users in MVP.

### Fitness/PT Plans and Notes
- Fitness/PT users can view assigned students.
- Fitness/PT users can create fitness plans for assigned students.
- Fitness/PT users can create workout assignments for assigned students.
- Fitness/PT users can upload movement screens for assigned students.
- Fitness/PT users can add fitness notes for assigned students.
- Coaches and admins can view fitness plans, movement screens, and fitness notes for students they can access.
- Students and parents can view fitness content if marked visible in MVP or if Dogwood chooses full transparency by default.

### Workout Assignments
- Fitness/PT users and admins can assign workouts to students.
- Workout assignments must include title, description, assigned date, due date, frequency, status, completion state, and optional exercise details.
- Coaches can view workout assignments for assigned students.
- Students and linked parents can view visible workout assignments and workout status.
- Workout status must appear on the Student Snapshot Dashboard.

### Admin Management
- Admins can manage users.
- Admins can assign roles.
- Admins can assign coaches.
- Admins can assign parents.
- Admins can assign Fitness/PT users.
- Admins can manage programs.
- Admins can manage program templates.
- Admins can view all platform data.
- Admins can archive records instead of permanently deleting them where appropriate.

## 7. Non-Functional Requirements

### Security
- All access must be role- and assignment-controlled.
- Sensitive student data must not be publicly accessible.
- File and video URLs must be protected or time-limited.
- Passwords must be hashed using industry-standard methods if password authentication is used.
- The system must keep audit metadata for important changes.

### Privacy
- Junior player records must be visible only to authorized users.
- Parent access must be limited to linked junior players.
- Internal notes must remain hidden from students and parents.

### Performance
- Student profile pages should load within 2 seconds under normal usage.
- Lists should support pagination, filtering, or search when record counts grow.
- Large file and video uploads should show progress and completion/failure states.

### Reliability
- The application should prevent accidental data loss.
- Upload failures should be recoverable.
- Form submissions should provide clear success and error states.

### Accessibility
- The application should meet WCAG 2.1 AA principles where feasible.
- Core workflows must be keyboard accessible.
- Text contrast must support readability.

### Responsive Design
- The application must support desktop, tablet, and mobile browser layouts.
- Coaches should be able to add notes and upload files from a mobile device.

## 8. Permission Matrix

| Capability | Admin | Coach | Student | Parent | Fitness/PT |
|---|---:|---:|---:|---:|---:|
| View all users | Yes | No | No | No | No |
| Create/edit users | Yes | No | No | No | No |
| Manage roles | Yes | No | No | No | No |
| Manage programs | Yes | No | No | No | No |
| Manage program templates | Yes | No | No | No | No |
| Create records from program templates | Yes | No | No | No | No |
| Assign coaches | Yes | No | No | No | No |
| Assign parents | Yes | No | No | No | No |
| Assign Fitness/PT users | Yes | No | No | No | No |
| View all students | Yes | No | No | No | No |
| View assigned students | Yes | Yes | Own only | Linked juniors only | Yes |
| View student profile | Yes | Assigned only | Own only | Linked juniors only | Assigned only |
| Edit student profile | Yes | Assigned only, limited | Own limited fields | No | No |
| View assigned coach | Yes | Assigned students | Own only | Linked juniors only | Assigned students |
| View assigned program | Yes | Assigned students | Own only | Linked juniors only | Assigned students |
| View Student Snapshot Dashboard | Yes | Assigned students | Own only | Linked juniors only | Assigned only |
| Create development priorities | Yes | Assigned students | No | No | No |
| Edit development priorities | Yes | Assigned students | No | No | No |
| View development priorities | Yes | Assigned students | Own only | Linked juniors only | Assigned only |
| Create lesson notes | Yes | Assigned students | No | No | No |
| Edit lesson notes | Yes | Own notes for assigned students | No | No | No |
| View lesson notes | Yes | Assigned students | Own only | Linked juniors only | No by default |
| Create practice plans | Yes | Assigned students | No | No | No |
| Edit practice plans | Yes | Assigned students | No | No | No |
| View practice plans | Yes | Assigned students | Own only | Linked juniors only | No by default |
| Create goals | Yes | Assigned students | No | No | No |
| Edit goals | Yes | Assigned students | No | No | No |
| View goals | Yes | Assigned students | Own only | Linked juniors only | No by default |
| Create assessments | Yes | Assigned students | No | No | Assigned students |
| Edit assessments | Yes | Own assessments for assigned students | No | No | Own assessments for assigned students |
| View assessments | Yes | Assigned students | Own visible results | Linked junior visible results | Assigned students |
| Create progress metrics | Yes | Assigned students | No | No | Fitness metrics only |
| Edit progress metrics | Yes | Assigned students | No | No | Fitness metrics only |
| View progress metrics | Yes | Assigned students | Own only | Linked juniors only | Assigned only |
| Create tournament results/upcoming tournaments | Yes | Assigned students | No | No | No |
| Edit tournament results/upcoming tournaments | Yes | Assigned students | No | No | No |
| View tournament results/upcoming tournaments | Yes | Assigned students | Own only | Linked juniors only | Assigned only |
| Upload videos | Yes | Assigned students | No | No | Movement-related only |
| Upload files | Yes | Assigned students | No | No | Movement/fitness files only |
| View uploaded videos/files | Yes | Assigned students | Own only | Linked juniors only | Assigned fitness files |
| Create internal notes | Yes | Assigned students | No | No | No |
| View internal notes | Yes | Assigned students | No | No | No |
| Create fitness plans | Yes | No | No | No | Assigned students |
| Edit fitness plans | Yes | No | No | No | Assigned students |
| View fitness plans | Yes | Assigned students | Own visible plans | Linked junior visible plans | Assigned students |
| Create workout assignments | Yes | No | No | No | Assigned students |
| Edit workout assignments | Yes | No | No | No | Assigned students |
| View workout assignments/status | Yes | Assigned students | Own visible workouts | Linked junior visible workouts | Assigned students |
| Upload movement screens | Yes | No | No | No | Assigned students |
| Add fitness notes | Yes | No | No | No | Assigned students |
| View fitness notes | Yes | Assigned students | Visible notes only | Linked junior visible notes only | Assigned students |

## 9. Database Entities

### User
- id
- first_name
- last_name
- email
- phone
- status
- created_at
- updated_at
- last_login_at

### Role
- id
- name
- description

### UserRole
- id
- user_id
- role_id
- created_at

### StudentProfile
- id
- user_id
- date_of_birth
- junior_player
- handedness
- graduation_year
- school
- goals_summary
- notes_summary
- status
- created_at
- updated_at

### CoachProfile
- id
- user_id
- bio
- specialties
- status
- created_at
- updated_at

### FitnessProfile
- id
- user_id
- credentials
- specialties
- status
- created_at
- updated_at

### ParentStudentLink
- id
- parent_user_id
- student_user_id
- relationship
- status
- created_at
- updated_at

### CoachStudentAssignment
- id
- coach_user_id
- student_user_id
- is_primary
- start_date
- end_date
- status
- created_at
- updated_at

### FitnessStudentAssignment
- id
- fitness_user_id
- student_user_id
- start_date
- end_date
- status
- created_at
- updated_at

### Program
- id
- name
- description
- default_program_template_id
- status
- created_at
- updated_at

### ProgramTemplate
- id
- program_id
- name
- description
- version
- status
- is_default
- created_by_user_id
- created_at
- updated_at

### ProgramTemplateItem
- id
- program_template_id
- item_type
- title
- description
- category
- default_payload
- sort_order
- status
- created_at
- updated_at

### StudentProgramEnrollment
- id
- student_user_id
- program_id
- program_template_id
- template_applied_at
- template_applied_by_user_id
- start_date
- end_date
- status
- created_at
- updated_at

### Lesson
- id
- student_user_id
- coach_user_id
- lesson_date
- title
- focus_area
- summary
- visibility
- created_at
- updated_at

### LessonNote
- id
- lesson_id
- author_user_id
- body
- visibility
- created_at
- updated_at

### PracticePlan
- id
- student_user_id
- coach_user_id
- source_program_template_id
- source_program_template_item_id
- title
- description
- assigned_date
- due_date
- status
- created_at
- updated_at

### PracticePlanItem
- id
- practice_plan_id
- title
- instructions
- duration_minutes
- frequency
- sort_order
- created_at
- updated_at

### Goal
- id
- student_user_id
- created_by_user_id
- source_program_template_id
- source_program_template_item_id
- title
- description
- category
- status
- target_date
- progress_value
- created_at
- updated_at

### DevelopmentPriority
- id
- student_user_id
- created_by_user_id
- source_program_template_id
- source_program_template_item_id
- owner_user_id
- title
- description
- category
- priority_level
- status
- target_date
- sort_order
- created_at
- updated_at

### Assessment
- id
- student_user_id
- assessor_user_id
- source_program_template_id
- source_program_template_item_id
- assessment_type
- assessment_date
- title
- summary
- findings
- score
- score_unit
- visibility
- file_asset_id
- created_at
- updated_at

### ProgressMetric
- id
- student_user_id
- recorded_by_user_id
- name
- category
- value
- unit
- recorded_at
- notes
- created_at
- updated_at

### TournamentResult
- id
- student_user_id
- recorded_by_user_id
- event_name
- event_type
- start_date
- end_date
- course_name
- location
- score
- finish_position
- field_size
- status
- preparation_notes
- result_notes
- stats
- created_at
- updated_at

### FileAsset
- id
- student_user_id
- uploaded_by_user_id
- file_name
- file_type
- mime_type
- file_size
- storage_key
- title
- description
- category
- visibility
- created_at
- updated_at

### VideoAsset
- id
- student_user_id
- uploaded_by_user_id
- title
- description
- storage_key
- thumbnail_key
- duration_seconds
- category
- visibility
- created_at
- updated_at

### InternalNote
- id
- student_user_id
- author_user_id
- body
- created_at
- updated_at

### FitnessPlan
- id
- student_user_id
- fitness_user_id
- title
- description
- assigned_date
- due_date
- status
- visibility
- created_at
- updated_at

### WorkoutAssignment
- id
- student_user_id
- assigned_by_user_id
- fitness_plan_id
- source_program_template_id
- source_program_template_item_id
- title
- description
- assigned_date
- due_date
- frequency
- status
- completion_state
- completed_at
- exercise_details
- visibility
- created_at
- updated_at

### MovementScreen
- id
- student_user_id
- fitness_user_id
- screen_date
- summary
- findings
- file_asset_id
- visibility
- created_at
- updated_at

### FitnessNote
- id
- student_user_id
- fitness_user_id
- body
- visibility
- created_at
- updated_at

### AuditLog
- id
- actor_user_id
- action
- entity_type
- entity_id
- metadata
- created_at

## 10. Key Application Views

### Student Snapshot Dashboard
- Default homepage for students after login.
- Default student detail landing view for admins, coaches, linked parents, and assigned Fitness/PT users.
- Current development priorities.
- Active goals.
- Current practice plan.
- Recent assessment results.
- Recent progress metrics.
- Latest lesson note.
- Latest uploaded video.
- Upcoming tournaments.
- Workout status.
- Links to full detail pages for priorities, goals, practice plans, assessments, metrics, lessons, videos, tournaments, and workouts.

### Admin Dashboard
- User management.
- Student list.
- Coach assignments.
- Parent assignments.
- Fitness/PT assignments.
- Program management.
- Program template management.
- Recent activity.
- Access to Student Snapshot Dashboards for all students.

### Coach Dashboard
- Assigned student list.
- Quick access to each assigned student's Student Snapshot Dashboard.
- Recent lessons.
- Practice plans needing updates.
- Development priorities needing review.
- Upcoming tournaments for assigned students.
- Goals and progress overview.
- Quick actions for notes, plans, uploads, and metrics.

### Student Portal
- Student Snapshot Dashboard as the default homepage.
- Profile overview.
- Coach and program information.
- Development priorities.
- Lesson history.
- Current practice plan.
- Active goals.
- Assessment results.
- Progress metrics.
- Tournament results and upcoming tournaments.
- Videos and files.
- Workout assignments and workout status.

### Parent Portal
- Linked junior player selector.
- Student Snapshot Dashboard for each linked junior player.
- Lesson notes.
- Practice plans.
- Development priorities.
- Goals.
- Assessment results.
- Progress overview.
- Tournament results and upcoming tournaments.
- Workout status.
- Uploaded materials visible to parent.

### Fitness/PT Dashboard
- Assigned student list.
- Quick access to each assigned student's Student Snapshot Dashboard.
- Fitness plans.
- Workout assignments.
- Movement screens.
- Fitness notes.
- Upload area for movement files.

## 11. MVP Definition

### MVP Objective
Launch a secure role-based web portal with a Student Snapshot Dashboard as the default homepage, allowing Dogwood to manage students, coaches, parents, programs, development priorities, lessons, practice plans, goals, assessments, progress metrics, tournament information, workouts, files, videos, and basic Fitness/PT contributions.

### MVP Must-Haves
- User authentication.
- Role-based permissions for Admin, Coach, Student, Parent, and Fitness/PT.
- Admin user management.
- Admin program management.
- Admin program template management.
- Program enrollment flow that can create student records from a selected program template.
- Admin assignment management for coaches, parents, and Fitness/PT users.
- Student profile creation and viewing.
- Student Snapshot Dashboard as the default homepage.
- Coach dashboard with assigned students.
- Student portal with profile, coach, program, snapshot, development priorities, lessons, practice plans, goals, assessments, metrics, tournament information, workouts, and files.
- Parent portal with linked junior player visibility.
- Fitness/PT dashboard with assigned students.
- Development priority creation and viewing.
- Lesson note creation and viewing.
- Practice plan creation and viewing.
- Goal creation and viewing.
- Assessment creation and viewing.
- Progress metric creation and viewing.
- Tournament result and upcoming tournament viewing.
- Video and file uploads.
- Internal coach notes.
- Fitness plans.
- Workout assignments.
- Movement screen uploads.
- Fitness notes.

### MVP Nice-to-Haves
- Search across students and files.
- Comment threads on practice plans or goals.
- Email notifications for new lesson notes or plans.
- File tagging.
- Goal completion history.
- Tournament preparation reminders.
- Basic CSV export for admins.

### MVP Acceptance Criteria
- Admin can create users and assign roles.
- Admin can assign a coach, parent, program, and Fitness/PT user to a student.
- Admin can create a program template with default development priorities, assessments, practice plans, goals, and workout assignments.
- Admin can enroll a student in a program and create student-specific records from the selected program template.
- Coach can see only assigned students.
- Student sees the Student Snapshot Dashboard as the default homepage after login.
- Student Snapshot Dashboard displays current development priorities, active goals, current practice plan, recent assessment results, recent progress metrics, latest lesson note, latest uploaded video, upcoming tournaments, and workout status.
- Coach can create development priorities, lesson notes, practice plans, goals, assessments, progress metrics, tournament entries, internal notes, videos, and files for assigned students.
- Student can see their own development information but cannot see internal notes.
- Parent can see only linked junior player information.
- Fitness/PT can see assigned students and add fitness plans, workout assignments, movement screens, and fitness notes.
- Unauthorized users cannot access restricted student records or internal notes.

## 12. Future Roadmap

### Phase 2: Communication and Notifications
- Email notifications for new lesson notes, practice plans, goals, and files.
- In-app notification center.
- Commenting on practice plans, goals, and lesson notes.
- Coach-to-parent announcements.

### Phase 3: Scheduling and Attendance
- Lesson scheduling.
- Calendar integration.
- Attendance tracking.
- Session reminders.
- Recurring lesson support.

### Phase 4: Advanced Progress Tracking
- Custom metric templates by program.
- Charts and trend visualizations.
- Goal milestone tracking.
- Coach and admin analytics dashboards.
- Progress reports for students and parents.

### Phase 5: Media and Analysis Enhancements
- Video annotation.
- Side-by-side swing comparison.
- Slow-motion playback.
- Tagged media libraries.
- AI-assisted video summaries if approved by Dogwood.

### Phase 6: Business Operations
- Billing and payments.
- Package and membership management.
- Contract or waiver storage.
- Automated onboarding workflows.

### Phase 7: Integrations
- Launch monitor integrations.
- Wearable or fitness device integrations.
- Calendar integrations.
- CRM/email marketing integrations.
- External file storage integrations.

## 13. Risks and Open Questions

### Risks
- Permission complexity may increase as users hold multiple roles.
- Video upload/storage costs may grow quickly.
- Coaches may need streamlined mobile workflows to keep data entry consistent.
- Parent visibility rules must be clearly defined for sensitive notes and fitness information.
- Data quality may suffer if required fields and workflows are too flexible.

### Open Questions
- Should students be able to upload their own practice videos in MVP?
- Should Fitness/PT notes be visible to students and parents by default?
- Should coaches be able to share selected internal notes later?
- Does Dogwood need lesson scheduling in the first release, or is portal documentation the priority?
- Are programs fixed offerings, custom student tracks, or both?
- What progress metric categories are most important for launch?
- What file size and video duration limits should be enforced?
- Is parent access required for all junior students or optional by family?

## 14. Launch Readiness Checklist

- Role permissions reviewed and approved by Dogwood.
- MVP user workflows validated with at least one admin, coach, parent, student, and Fitness/PT user.
- Student data import or manual setup process defined.
- Video/file storage limits and costs reviewed.
- Privacy policy and consent language reviewed for junior player data.
- Backup and recovery approach defined.
- Initial programs configured.
- Staff trained on lesson notes, practice plans, goals, uploads, and internal notes.
