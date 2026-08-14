# Lumio LMS — Modern Learning Management & Authoring Platform

Lumio is an simplified **Learning Management System (LMS)** and course authoring platform built with **React 19**, **Vite**, **TypeScript**, **TailwindCSS v4**, **Framer Motion**, and **Supabase**. Designed with precise attention to design tokens, fluid micro-interactions, responsive layouts, and robust database persistence, Lumio offers a portfolio-ready experience for both learners and instructors.


## Features

### Authentication & Identity
- **Google OAuth 2.0 & Email/Password Sign-In**: Native Supabase authentication with support for both PKCE and hash-fragment implicit grant OAuth tokens.
- **Form Validation & Security**: Password complexity enforcement (minimum 6 characters, uppercase, special character checks), password confirmation matching, and input validation.
- **Email Verification & Reset**: Email confirmation flow with local state persistence and password recovery.
- **Protected Routes**: Navigation guards ensuring secure access to authenticated routes (`/dashboard`, `/learning`, `/courses`, `/instructor/courses`, `/viewer`, `/settings`).

### Student Dashboard & Analytics
- **Live Learning Metrics**: Dynamic calculation of weekly study hours, enrolled course count, active courses, completed courses, total lessons completed, and current study streak based on user activity.
- **Zero-State Architecture**: Displays clean, elegant zero states for newly created user accounts before database records exist.
- **Progress Tracking**: Real-time progress bars per course card with quick links to jump directly into the active lesson.

### Course Catalog
- **Instant Search & Filtering**: Debounced live text search across titles, descriptions, and instructor names.
- **Multi-Factor Filters**: Filter courses by Category, Difficulty Level (`beginner`, `intermediate`, `advanced`), and Minimum Rating.
- **Paginated Grid**: Responsive grid layout with previous/next page navigation.

### Course Detail & Overview
- **Dynamic Hero Section**: Course category badges, course description, duration, total lesson count, and an interactive iframe YouTube preview video modal.
- **Thumbnail Design Card**: Visual presentation card featuring subtle hover animations and overlay tags.
- **"What You'll Learn" Outcomes**: Dynamic learning outcomes list mapped directly from the course authoring studio.
- **Collapsible Syllabus**: Interactive module accordions displaying lesson items and individual durations.
- **Instructor Profile Card**: Avatar, bio, and background details of the course instructor.
- **One-Click Enrollment**: Seamless enrollment integration with toast notifications and automatic redirect to My Learning.

### Interactive Lesson Viewer
- **Embedded Player**: High-definition video playback using YouTube embeds.
- **Dynamic Core Concept Card**: Renders key takeaway concepts for each lesson.
- **Downloadable Lesson Resources**: Dedicated resources section allowing learners to download course files (PDFs, Markdown notes, code snippets, ZIP archives) directly to their PC via generated Blob URLs or remote storage.
- **Collapsible Sidebar**: Module/lesson hierarchy navigation with progress indicators and exit course confirmation.
- **Auto-Advance & Completion**: Interactive "Up Next" card with hover state and automated lesson completion tracking.

### Instructor Studio (Course Builder)
- **Step 1: Course Overview**: Set course title, category, difficulty, thumbnail file upload to Supabase storage, preview video link, course description, and up to 6 "What you'll learn" outcome fields with add/delete controls.
- **Step 2: Modules & Lessons**: Drag-and-drop style module reordering, lesson creation (title, YouTube URL, duration in minutes, core concept), and resource attachments.
- **Publishing & Duplication**: Support for `draft`, `saved`, and `published` course status transitions, as well as single-click course duplication.

### User Settings
- **Profile Customization**: Update first name, last name, bio, and Date of Birth with a mobile-optimized layout. Upload and remove avatar images powered by Supabase storage (`avatars` bucket).
- **Account & Security**: Auth provider status badge (Email vs Google OAuth), password update form, and account deletion confirmation flow.
- **Appearance**: Enforced light theme system.

---

## Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Language** | TypeScript 5.8 |
| **Styling & Design Token System** | TailwindCSS v4 + Material Design 3 Surface Tokens |
| **Animations** | Framer Motion 12 |
| **UI Components & Icons** | Base UI Toast, Lucide React, React Icons (FcGoogle, GoArrowUpRight) |
| **Backend & Auth** | Supabase JS Client v2 (PostgreSQL + RLS + Storage + Auth) |
| **Routing** | React Router DOM v6 |

---

## Project Structure

```
lumio/
├── public/                     # Static public assets & branding images
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # AuthCallback, ProtectedRoute guards
│   │   ├── layout/             # Sidebar, Header, App layout components
│   │   └── ui/                 # Button, Skeleton, Spinner, Toast
│   ├── contexts/               # LMSContext (Session, Auth error, Loading states)
│   ├── features/               # Feature-based modular architecture
│   │   ├── authentication/     # Signin, Signup, ForgotPassword, ResetPassword, EmailConfirmation
│   │   ├── courses/            # Catalog, Detail, Builder/Instructor Studio, API mappings
│   │   ├── dashboard/          # DashboardPage, MyLearningPage, Stats cards, Progress charts
│   │   ├── settings/           # ProfileSection, AccountSecuritySection, Appearance, Language
│   │   └── viewer/             # ViewerShell, ViewerSidebar, LessonVideo, LessonContent
│   ├── layouts/                # AppLayout, AuthenticatedLayout
│   ├── lib/                    # Supabase client & utility functions
│   ├── onboarding/             # Interactive onboarding experience
│   ├── shared/                 # Shared API handlers & database TypeScript definitions
│   │   ├── api/                # auth.ts, courses.ts, enrollments.ts, profiles.ts, progress.ts, resources.ts, settings.ts
│   │   └── types/              # database.ts (Supabase auto-generated schema types)
│   ├── App.tsx                 # Application routes & provider setup
│   ├── main.tsx                # Entry point
│   └── index.css               # Design tokens, custom utility classes & Tailwind setup
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```


## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm** / **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/alleny-01/Lumio-Learning-Management-System.git
cd lumio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## Database & Storage Architecture (Supabase)

Lumio utilizes Supabase for authentication, relational data storage, and file hosting.

### SQL Tables
- `profiles`: Extends `auth.users` with `first_name`, `last_name`, `avatar_url`, `bio`, `date_of_birth`.
- `courses`: Stores course metadata, `instructor_id`, `category`, `difficulty`, `status` (`draft`, `saved`, `published`), `learning_outcomes`, `thumbnail_url`, `preview_video_url`.
- `course_modules`: Modules belonging to courses (`sort_order`, `title`).
- `lessons`: Lessons within modules (`title`, `youtube_url`, `duration_minutes`, `core_concept`, `sort_order`).
- `enrollments`: Maps users to enrolled courses (`enrolled_at`, `progress_percent`).
- `user_lesson_progress`: Track completed lessons per user (`completed_at`).
- `user_study_activity`: Logs daily study sessions and minutes for analytics.
- `lesson_resources`: Stores downloadable resources attached to lessons (`file_name`, `file_path`, `file_size`, `resource_kind`).

### Storage Buckets
Create the following public storage buckets in Supabase Storage:
1. `course-thumbnails` (Public)
2. `course-resources` (Public)
3. `avatars` (Public)

---

Vercel will build the project using `npm run build` (`tsc -b && vite build`) and output the static SPA bundle ready for production edge distribution.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
