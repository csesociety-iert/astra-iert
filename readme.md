


Your Supabase project is zapbeeibgweptmvsnkyf.

Project URL: https://zapbeeibgweptmvsnkyf.supabase.co
Dashboard: Project settings → API
Database connection string, host, port, and password: Find these in the dashboard under Connect or Project Settings → Database.
App configuration: The project’s local .env.local uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.




Strike-inspired monochrome futuristic coding dashboard” — a descriptive style name, not a specific template or framework.






ASTRA — Competitive Programming Platform for CSE Society, IERT Prayagraj
1. Project Overview

Build a full-stack competitive programming platform named ASTRA, inspired by LeetCode, HackerRank, and Codeforces. The platform is exclusively designed for members of the CSE Society, Institute of Engineering & Rural Technology (IERT), Prayagraj.

ASTRA will allow students to practice data structures and algorithms, solve programming challenges, submit code in multiple programming languages, receive automated verdicts, track their progress, participate in contests, and compete with other society members.

The application must be a real, fully functional web platform, not just a UI prototype.

Technology stack:

Frontend and backend: Next.js with App Router and TypeScript.
Styling: Tailwind CSS with shadcn/ui where appropriate.
Database: Supabase PostgreSQL.
Authentication: Supabase Auth.
Code execution and judging: Judge0 API.
Deployment: Vercel for Next.js and Supabase-hosted database and authentication.
Icons: Lucide React.
Form validation: Zod and React Hook Form where useful.

Use the latest mutually compatible stable versions of these technologies.

2. Brand Identity and UI/UX

Create a premium, modern, developer-focused interface under the name ASTRA.

Brand identity:

Product name: ASTRA
Tagline: “Reach Beyond Limits. Master the Code.”
Community: CSE Society, IERT Prayagraj
Design style: Minimal, sophisticated, technical, and futuristic.
Primary colors: Deep navy blue, electric blue, and subtle violet accents.
Background: Dark-first interface with a fully supported light theme.
Typography: Modern sans-serif fonts with monospace typography for code.
Animations: Subtle transitions, smooth page navigation, tasteful hover effects, and loading skeletons.

Create a consistent design system for buttons, cards, forms, tables, dialogs, navigation, badges, and status indicators.

The interface should feel like a serious competitive programming product, not a generic dashboard template.

Ensure responsive layouts for desktop, tablet, and mobile devices. The coding workspace should be optimized primarily for desktop use.

3. User Roles and Access Control

Implement three roles:

A. Student / Society Member
Access the coding dashboard.
Browse and solve published problems.
Submit code and inspect judging results.
View submission history and personal statistics.
Participate in eligible contests.
View leaderboards and member profiles.
Bookmark problems and track solved questions.
B. Problem Setter
Create and edit programming problems.
Configure constraints, examples, test cases, and difficulty.
Set problem topics and supported languages.
Submit problems for review or publication, according to permissions.
C. Administrator
Manage society members and platform access.
Manage problems, problem setters, and contests.
Publish, archive, or unpublish challenges.
View submissions, contest statistics, and platform activity.
Manage leaderboards and platform settings.
Moderate content and review reported issues.

Enforce permissions on the server and in the database. Hiding UI controls alone is not sufficient for security.

4. Authentication and Member Verification

Use Supabase Auth for secure registration, login, session management, and password recovery.

Required functionality:

Login using email and password.
Email verification.
Password reset.
Persistent sessions.
Logout.
Protected routes.
Role-based access control.
User profile setup.

ASTRA is intended for CSE Society members. Design an administrator-controlled membership verification process so only approved members can access restricted coding features.

Store each user's Supabase Auth UUID alongside their profile and, where applicable, their society membership ID.

Do not expose service-role keys or privileged credentials to the browser.

5. Main Application Pages
A. Landing Page — /

Create a polished public landing page featuring:

ASTRA logo and navigation.
Hero section with the tagline.
Clear “Start Coding” and “Explore Problems” calls to action.
Platform statistics, such as published problems, registered members, and accepted submissions, sourced from real data.
Features section.
Featured problems.
Upcoming contests.
Society community section.
Footer with CSE Society, IERT branding and relevant links.

Do not fabricate statistics. Use placeholders only during development and replace them with actual database values.

B. Dashboard — /dashboard

Display:

Welcome message.
Total problems solved.
Easy, medium, and hard problems solved.
Total submissions and acceptance rate.
Current streak and activity calendar.
Recently attempted problems.
Recommended problems.
Contest participation.
Personal rank.
Quick actions to continue practicing.

All statistics must be derived from real user activity.

C. Problem Explorer — /problems

Build a searchable, filterable problem library.

Features:

Search by problem title or ID.
Filter by difficulty.
Filter by topic and tags.
Filter by solved, attempted, and unsolved status.
Sort by difficulty, title, and popularity.
Pagination.
Problem status indicators.
Acceptance rate where meaningful.
Bookmark functionality.

Each problem should display its ID, title, difficulty, topics, and completion status.

D. Problem Workspace — /problems/[slug]

This is the core feature of ASTRA.

Create a professional coding interface inspired by LeetCode.

Left panel:

Problem title and ID.
Difficulty badge.
Problem statement.
Input and output format.
Constraints.
Examples.
Sample test cases.
Topic tags.
Hints, if available.
Submission statistics.

Right panel:

Code editor powered by Monaco Editor.
Language selector.
Run Code button.
Submit Solution button.
Custom input panel.
Sample test results.
Submission output and verdict.
Runtime and memory information when provided by the judge.
Resizable panels and adjustable layout.

Initially support C++, C, Java, Python, and JavaScript, subject to the selected Judge0 instance's available language IDs and versions.

Provide syntax highlighting, line numbers, indentation, keyboard shortcuts, and language-specific starter templates.

Persist a user's draft code locally or in the database so accidental navigation does not erase their work.

E. Submission History — /submissions

Display:

Submission ID.
Problem name.
Language.
Verdict.
Execution time.
Memory usage.
Submission timestamp.

Allow filtering by problem, language, verdict, and date.

Clicking a submission should open its detailed results and the submitted source code, subject to appropriate privacy rules.

F. Contests — /contests

Implement a contest system with:

Upcoming contests.
Active contests.
Past contests.
Contest registration.
Start and end times.
Countdown timer.
Contest problem list.
Contest-specific submissions.
Contest leaderboard.
Final standings.

Use server-side time validation for contest access and submissions. Do not trust the user's browser clock.

G. Leaderboard — /leaderboard

Provide:

Overall society leaderboard.
Weekly and monthly rankings.
Contest-specific rankings.
Problems solved.
Points.
Acceptance rate.
Contest performance.

Define a transparent scoring system. Avoid rewarding repeated submissions in ways that encourage spam.

H. User Profile — /profile/[username]

Show:

Name and username.
Society membership ID, if approved for display.
Profile photo.
Programming languages.
Solved problem statistics.
Difficulty distribution.
Activity calendar.
Recent accepted submissions.
Contest performance.
Achievements and badges.

Allow users to edit their own permitted profile fields.

I. Admin Dashboard — /admin

Create an administrative interface for managing members, problems, test cases, contests, access permissions, and platform statistics.

Restrict all administrative operations to authorized administrators using server-side authorization.

6. Problem Management System

Each programming problem should contain:

Unique problem ID.
Title and URL slug.
Problem statement.
Difficulty: Easy, Medium, or Hard.
Input and output descriptions.
Constraints.
Sample input and output.
Explanation for sample cases.
Topic tags.
Supported programming languages.
Starter code templates.
Hidden test cases.
Public test cases.
Time limit.
Memory limit.
Editorial or solution explanation.
Publication status.
Creation and update timestamps.
Problem setter ID.

Problem setters must be able to create, preview, edit, and test problems before publishing them.

Hidden test cases and reference solutions must never be returned to ordinary users through browser requests or public APIs.

7. Judge0 Integration — Code Execution Engine

Use Judge0 as the external code execution and judging service.

Do not build a custom code execution engine. Do not execute arbitrary student code on the Next.js server.

Implement a server-side judging pipeline:

The student selects a language and writes code.
The frontend sends the code, problem ID, and submission metadata to a protected Next.js API route or Server Action.
The server authenticates the student and checks access permissions.
The server retrieves the problem's hidden test cases from Supabase.
The server validates the submission and applies request limits.
The server submits the code to Judge0 using the configured language ID and resource limits.
The server polls the judging service or processes asynchronous results until the submission finishes.
The server evaluates the result against the expected output using a well-defined comparison policy.
The server records the verdict, runtime, memory, and relevant submission metadata in Supabase.
The frontend displays the verdict and test results.

Judging requirements:

Support multiple test cases.
Execute hidden tests securely.
Prevent students from accessing hidden inputs, expected outputs, and reference solutions.
Support verdicts such as Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded, and Internal Error.
Handle Judge0 queue states and asynchronous submissions correctly.
Use configurable time and memory limits.
Handle API failures, timeouts, and rate limits gracefully.
Prevent duplicate or conflicting submission processing.
Record submission status updates reliably.
Never trust client-provided verdicts, runtime, scores, or expected outputs.

Use batch execution when supported and appropriate by the configured Judge0 deployment. Otherwise, implement an efficient, bounded test execution workflow.

For large test suites, avoid unbounded sequential polling or uncontrolled API calls. Apply concurrency limits, timeouts, retries with backoff, and per-user submission quotas.

Use environment variables such as:

JUDGE0_API_URL

JUDGE0_API_KEY

JUDGE0_AUTH_HEADER

Keep all credentials server-side. Make the authentication header configurable because Judge0 deployments may use different authentication mechanisms.

Important: The platform must support both sample execution and final submission. Running sample tests must not automatically mark a problem as solved.

Treat Judge0 as an execution service, not as the source of truth for ASTRA's problem definitions, test cases, scoring, membership, or progress.

8. Supabase Database Architecture

Use Supabase PostgreSQL as the primary source of truth.

Design a normalized schema containing at least the following tables:

profiles
id — references auth.users.id
username
full_name
avatar_url
society_id
role
membership_status
bio
created_at
updated_at
problems
id
title
slug
statement
difficulty
input_format
output_format
constraints
time_limit_ms
memory_limit_kb
created_by
is_published
created_at
updated_at
problem_test_cases
id
problem_id
input_data
expected_output
is_sample
points
created_at

Restrict hidden test cases to trusted server-side operations. Do not grant ordinary authenticated users unrestricted table access.

problem_tags
id
name
slug
problem_tag_mapping
problem_id
tag_id
submissions
id
user_id
problem_id
language_id
language_name
source_code
status
execution_time_ms
memory_used_kb
passed_test_cases
total_test_cases
created_at
judged_at

Store detailed test-case results separately when necessary. Never expose hidden test inputs or expected outputs in those records.

user_problem_progress
user_id
problem_id
is_solved
first_solved_at
best_submission_id
attempt_count
updated_at
contests
id
title
slug
description
start_time
end_time
registration_deadline
created_by
status
created_at
contest_problems
contest_id
problem_id
points
display_order
contest_registrations
contest_id
user_id
registered_at
contest_submissions
submission_id
contest_id
user_id
problem_id
penalty_seconds
score
bookmarks
user_id
problem_id
created_at
achievements
id
name
description
icon
criteria
user_achievements
user_id
achievement_id
earned_at

Add suitable foreign keys, indexes, unique constraints, check constraints, and timestamps.

Use migrations to manage schema changes. Include seed data for development and testing.

Adjust the schema as needed to support reliable judging, contest scoring, auditability, and future growth.

9. Supabase Security and Row-Level Security

Enable Row-Level Security on all tables exposed through the Supabase Data API.

Create policies that ensure:

Users can view and update only permitted fields in their own profiles.
Approved members can access published problems.
Only authorized problem setters can manage their permitted problems.
Only administrators can manage membership approval and platform-wide settings.
Users can read their own submissions.
Leaderboard queries expose only approved public statistics.
Hidden test cases cannot be read by ordinary users.
Contest participants can access contest data according to the contest rules.

Never expose the Supabase service-role key in frontend code.

Use the Supabase publishable/anonymous key in the browser where appropriate, together with correctly configured RLS. Perform privileged operations in a trusted server environment.

Do not trust role names or membership statuses supplied by the client. Protect sensitive authorization fields from self-modification.

10. API and Backend Structure

Use Next.js Route Handlers or Server Actions with clear separation between:

Authentication and authorization.
Problem management.
Submission creation.
Judge0 integration.
Verdict processing.
Contest management.
Leaderboard calculations.
Administrative operations.

Suggested API routes:

GET /api/problems
GET /api/problems/[slug]
POST /api/submissions
GET /api/submissions/[id]
GET /api/submissions
POST /api/contests/[id]/register
GET /api/leaderboard
POST /api/admin/problems
PATCH /api/admin/problems/[id]

These are suggested interfaces; adapt the exact routing to the final architecture.

Validate all inputs on the server. Add rate limiting, pagination, safe error handling, structured logging, and request timeouts.

Use Supabase server-side authentication helpers and ensure that protected pages and endpoints verify the actual user session.

11. Coding Editor Experience

Build a fast, distraction-free coding environment.

Features:

Monaco Editor.
Language-specific syntax highlighting.
Default starter templates.
Adjustable editor font size.
Dark and light editor themes.
Run and Submit actions.
Custom input execution.
Sample test execution.
Submission history.
Verdict badges and execution summaries.
Loading and judging states.
Clear error messages.
Resizable problem and editor panels.

Preserve the user's code while switching tabs or inspecting test results. Prevent duplicate submissions from rapid clicks and clearly show when a submission is pending.

12. Gamification and Student Engagement

Introduce a fair learning and competition system:

Daily coding streaks.
Weekly activity calendar.
Problem-solving points.
Achievement badges.
Contest participation rewards.
Monthly society rankings.
Beginner-friendly problem collections.
Topic-based learning paths.
Recommended next problems.

Keep achievements based on verified database activity. Do not award points solely for submitting code; use accepted solutions and clearly defined contest rules.

13. Performance and Scalability

Optimize ASTRA for a growing student community.

Requirements:

Server-side pagination for problems and submissions.
Database indexes for frequent filters.
Efficient aggregation for statistics.
Appropriate caching for public, non-sensitive data.
No caching of private submissions or user-specific data across users.
Asynchronous judging for long-running requests.
Bounded worker or background-job processing where required.
Retry-safe submission processing.
Efficient leaderboard queries.
Responsive skeletons and error states.
Accessible keyboard navigation.

Do not assume that a single serverless HTTP request can safely wait for an entire large judging workload. If the workload requires it, design a persistent worker or queue-backed architecture with Supabase as the database and Judge0 as the execution engine.

14. Testing and Reliability

Include:

Unit tests for validation and scoring.
Integration tests for authentication and database policies.
Judge0 adapter tests using mocked responses.
Tests for accepted and incorrect solutions.
Compilation-error and runtime-error tests.
Time-limit and infrastructure-failure handling.
Tests ensuring hidden test cases are never exposed.
Role and membership authorization tests.
Contest timing and leaderboard tests.
End-to-end tests for the primary student workflow.

Include a clear setup guide for local development, Supabase configuration, migrations, environment variables, Judge0 setup, testing, and Vercel deployment.

15. Environment Variables

Provide an .env.example with placeholders such as:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

JUDGE0_API_URL=

JUDGE0_API_KEY=

JUDGE0_AUTH_HEADER=

Use the current Supabase key conventions supported by the selected SDK version. Keep server-only secrets out of any variable prefixed with NEXT_PUBLIC_.

Never commit real credentials or API keys.

16. Project Structure

The repository is organized as a small npm-workspaces monorepo:

conflict/ — standalone Node.js + TypeScript API backend.
conflict/src/config/ — validated backend environment configuration.
conflict/src/middleware/ — shared API middleware and error handling.
conflict/src/routes/ — backend HTTP routes.
conflict/src/app.ts — Express application configuration.
conflict/src/index.ts — backend process entry point.
shuffal/ — Next.js frontend application.
shuffal/src/app/ — pages, layouts, and frontend routes.
shuffal/src/components/ — reusable UI components.
shuffal/src/lib/ — frontend utilities and public-safe clients.
supabase/migrations/ — database migrations.
supabase/seed.sql — development seed data.
tests/ — unit and integration tests.

Run the apps independently from the repository root with npm run dev:frontend and npm run dev:backend. Keep authorization, privileged database access, and judging in the backend; never expose server credentials to the frontend.

The root URL opens the CSE Society sign-in page. Outsiders register with first name, last name, email, and a password, then continue directly to the dashboard. Apply `supabase/migrations/202610130001_create_astra_credentials.sql` for the private outsider credentials/profile table and photo bucket. Backend auth and member-table mappings are documented in [conflict/README.md](./conflict/README.md); configure server secrets only in `conflict/.env`, never in the frontend.

17. Development Strategy

Build ASTRA in phases.

Phase 1 — Foundation

Initialize Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
Establish the ASTRA design system.
Configure Supabase.
Implement authentication, member approval, profiles, and RLS.
Build the landing page and dashboard shell.

Phase 2 — Problem Platform

Create the problem schema and management UI.
Build the problem explorer.
Implement problem detail pages.
Add Monaco Editor and language selection.

Phase 3 — Judge0 Integration

Implement server-side submissions.
Add secure hidden-test-case evaluation.
Build asynchronous judging and verdict handling.
Store submission history and update problem progress.

Phase 4 — Community Features

Build profiles, leaderboards, statistics, and bookmarks.
Add contests and contest-specific scoring.
Implement achievements and activity tracking.

Phase 5 — Administration and Deployment

Complete the admin dashboard.
Add tests, rate limiting, logging, and security reviews.
Configure production environment variables.
Deploy on Vercel.
Validate database policies and Judge0 connectivity in production.

Deliver working features in each phase rather than creating all pages as static mockups.

18. Final Acceptance Criteria

ASTRA is complete when:

An approved society member can sign in securely.
The member can browse and filter published problems.
The member can write code in the browser.
Code can be executed through Judge0 without running untrusted code on the Next.js server.
The judging system evaluates the appropriate public and hidden test cases.
Verdicts and submission history are persisted in Supabase.
Solved-problem statistics update only after an accepted submission.
Hidden tests, reference solutions, service-role credentials, and private submissions remain protected.
Contests and leaderboards use consistent, server-verified scoring rules.
Administrators can manage problems, members, and contests securely.
The application works on desktop and mobile.
The project includes migrations, tests, seed data, documentation, and deployment instructions.

Final instruction: First inspect the existing repository if one is provided. Reuse working components and preserve existing project conventions where reasonable. If starting from scratch, establish the architecture before implementation. Build ASTRA as a production-oriented, maintainable competitive programming platform for CSE Society, IERT Prayagraj. Prioritize correctness, security, a polished coding experience, and reliable Judge0 integration over unnecessary visual complexity. Do not leave core features as dummy buttons, static charts, fake submissions, or simulated judging results.