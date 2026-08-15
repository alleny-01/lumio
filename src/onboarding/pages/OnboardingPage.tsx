import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Menu,
  MonitorPlay,
  PanelLeft,
  PlayCircle,
  UserRound,
  UploadCloud,
  X,
} from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Builder", href: "#builder" },
  { label: "Preview", href: "#preview" },
];

const featureHighlights = [
  {
    title: "Course Builder",
    description:
      "Create modules, lessons, resources, and draft or published courses from one instructor flow.",
    icon: UploadCloud,
  },
  {
    title: "Student Dashboard",
    description:
      "Track enrolled courses, progress, streaks, study activity, and recent learning in one place.",
    icon: LayoutDashboard,
  },
  {
    title: "Lesson Viewer",
    description:
      "Watch YouTube-hosted lessons with course navigation, completion tracking, and core concepts.",
    icon: MonitorPlay,
  },
  {
    title: "Profile for Learners & Instructors",
    description:
      "Keep your profile the same either as a learner or as an instructor.",
    icon: UserRound,
  },
];

const workflowSteps = [
  {
    title: "Publish",
    description:
      "Instructors structure courses, import YouTube links, attach resources, and publish when ready.",
  },
  {
    title: "Learn",
    description:
      "Students browse the catalog, enroll, resume lessons, and complete content at their own pace.",
  },
  {
    title: "Track",
    description:
      "Lumio persists progress, study activity, streaks, and profile preferences across sessions.",
  },
];

const previewCourses = [
  { title: "React Foundations", progress: 72, accent: "bg-primary" },
  { title: "Design Systems", progress: 48, accent: "bg-secondary" },
  { title: "Intro to Supabase", progress: 86, accent: "bg-tertiary-fixed" },
];

const heroStats = [
  { label: "Courses", value: "24" },
  { label: "Lessons", value: "148" },
  { label: "Progress", value: "86%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function OnboardingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-on-background/5 bg-white/82 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Primary navigation"
        >
          <a href="#" className="flex items-center gap-1 text-on-background">
            <img src="/L.svg" alt="Lumio logo" className="h-15 w-15" />
            <span className="text-[18px] font-normal">Lumio</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-light text-on-surface-variant transition-colors hover:text-on-background"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/signin"
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-[13px] font-light text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-background"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-on-primary shadow-[0_14px_30px_-18px_rgba(53,37,205,0.85)] transition-all hover:-translate-y-0.5 hover:bg-primary-container"
            >
              Start free
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg text-on-background transition-colors hover:bg-surface-container-low md:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </nav>

        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-on-background/5 bg-white px-4 py-4 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-[13px] font-light text-on-surface-variant hover:bg-surface-container-low hover:text-on-background"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/signin"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 text-[13px] text-on-background"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary text-[13px] font-medium text-on-primary"
                >
                  Start free
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pt-28 sm:px-6 lg:px-8">
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.12 }}
              className="max-w-2xl"
            >
              <motion.div
                variants={fadeUp}
                animate={{
                  y: [0, -1.5, -3, -4, -3, -1.5, 0],
                }}
                transition={{
                  y: {
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.16, 0.33, 0.5, 0.67, 0.84, 1],
                  },
                }}
                whileHover={{ scale: 1.035, y: -6 }}
                className="relative mb-6 inline-flex overflow-hidden rounded-lg bg-[linear-gradient(110deg,rgba(15,23,42,0.16),rgba(255,255,255,0.92),rgba(15,23,42,0.12))] p-px shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)] will-change-transform"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 bg-white/55"
                  animate={{ opacity: [0.18, 0.4, 0.18] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-[7px] bg-white px-3 py-1.5 text-[11px] font-normal tracking-wider">
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 -left-14 w-12 rotate-12 bg-on-background/10"
                    animate={{ x: [0, 240] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.span
                    animate={{
                      rotate: [0, 18, -12, 0],
                      scale: [1, 1.15, 0.95, 1],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 inline-flex text-on-background"
                  >
                    <Sparkles size={18} strokeWidth={1} />
                  </motion.span>
                  <span className="relative z-10">
                    Free, self-hosted LMS for modern course platforms
                  </span>
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-[46px] font-semibold leading-[0.98] text-on-background sm:text-[66px] lg:text-[78px]"
              >
                Build the Future of{" "}
                <span className="font-light italic text-primary">Learning</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-[14px] font-light leading-7 sm:text-[15px]"
              >
                Lumio is a simplified LMS platform where instructors publish
                structured courses and students move through lessons,
                dashboards, and real progress tracking.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/signup"
                  className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-[13px] font-semibold text-on-primary shadow-[0_18px_36px_-18px_rgba(53,37,205,0.9)] transition-all hover:-translate-y-0.5 hover:bg-primary-container"
                >
                  <span className="absolute inset-y-0 -left-16 w-12 rotate-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-72" />
                  <span className="relative inline-flex items-center gap-2">
                    Start free
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-on-background/10 bg-white px-5 text-[13px] font-medium text-on-background shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
                >
                  Browse courses
                  <BookOpenCheck className="size-4" />
                </Link>
              </motion.div>
            </motion.div>

            <div
              className="relative min-h-[540px] lg:min-h-[680px]"
              id="preview"
            >
              <motion.div
                className="absolute left-0 top-8 w-[88%] rounded-lg border border-on-background/10 bg-white p-3 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)] sm:w-[78%] lg:left-4 lg:top-14"
                initial={{ opacity: 0, y: 34, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                whileHover={{ y: -8, rotate: -0.5 }}
              >
                <div className="rounded-lg border border-border/40 bg-surface-container-lowest p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-error" />
                      <span className="size-3 rounded-full bg-tertiary-fixed" />
                      <span className="size-3 rounded-full bg-secondary" />
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Dashboard
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                    <aside className="rounded-lg bg-on-background p-3 text-white">
                      <div className="mb-5 flex items-center gap-2">
                        <PanelLeft className="size-4 text-primary-fixed-dim" />
                        <span className="text-[12px] font-semibold">Lumio</span>
                      </div>
                      {["Dashboard", "Learning", "Catalog", "Builder"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`mb-2 rounded-lg px-3 py-2 text-[11px] ${
                              index === 0
                                ? "bg-primary text-on-primary"
                                : "text-white/70"
                            }`}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </aside>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {heroStats.map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            className="rounded-lg border border-border/40 bg-surface p-3"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 + index * 0.08 }}
                          >
                            <p className="text-[10px] text-on-surface-variant">
                              {stat.label}
                            </p>
                            <p className="mt-2 text-[20px] font-semibold">
                              {stat.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-border/40 bg-surface p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-[13px] font-semibold">
                            Weekly progress
                          </h3>
                          <PlayCircle className="size-5 text-primary" />
                        </div>
                        <svg
                          viewBox="0 0 420 140"
                          className="h-32 w-full overflow-visible"
                          role="img"
                          aria-label="Animated learning progress chart"
                        >
                          <defs>
                            <linearGradient id="chartFill" x1="0" x2="1">
                              <stop stopColor="#c3c0ff" />
                              <stop offset="1" stopColor="#ffdad6" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 105 C50 95 70 82 110 88 C150 94 168 50 208 58 C250 67 268 34 310 42 C355 52 374 25 420 34 L420 140 L0 140 Z"
                            fill="url(#chartFill)"
                            opacity="0.45"
                          />
                          <motion.path
                            d="M0 105 C50 95 70 82 110 88 C150 94 168 50 208 58 C250 67 268 34 310 42 C355 52 374 25 420 34"
                            fill="none"
                            stroke="#3525cd"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.6, delay: 0.75 }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute right-0 top-0 w-40 rounded-[34px] border-[8px] border-on-background bg-white p-3 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.75)] sm:right-10 sm:w-48 lg:right-2"
                initial={{ opacity: 0, y: 40, rotate: 10 }}
                animate={{ opacity: 1, y: [0, -14, 0], rotate: 7 }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.45 },
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 0.7, delay: 0.45 },
                }}
              >
                <div className="mx-auto mb-3 h-4 w-16 rounded-full bg-on-background" />
                <div className="rounded-lg bg-surface p-3">
                  <p className="text-[10px] text-on-surface-variant">Today</p>
                  <p className="mt-1 text-[13px] font-semibold">
                    Lesson streak
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <motion.span
                        key={index}
                        className={`h-7 rounded-md ${
                          index % 3 === 0
                            ? "bg-primary"
                            : "bg-surface-container-high"
                        }`}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.035 }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg bg-primary-fixed p-3">
                    <p className="text-[10px] text-on-primary-fixed">
                      Next lesson
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-on-primary-fixed">
                      Components
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-8 right-6 w-[72%] rounded-lg border border-on-background/10 bg-white p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.65)] sm:w-[54%] lg:right-20"
                initial={{ opacity: 0, y: 36, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.75, delay: 0.62 }}
                whileHover={{ y: -8 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold">Course Builder</p>
                    <p className="text-[10px] text-on-surface-variant">
                      Draft saved
                    </p>
                  </div>
                  <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-semibold text-on-tertiary-fixed">
                    Publish
                  </span>
                </div>
                <div className="space-y-2">
                  {["Course info", "Modules", "Lessons"].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2"
                    >
                      <span className="text-[11px] font-medium">{item}</span>
                      <motion.span
                        className="h-1.5 rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: [48, 72, 58][index] }}
                        transition={{ delay: 1 + index * 0.18, duration: 0.6 }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.1 }}
              className="max-w-2xl"
            >
              <motion.p
                variants={fadeUp}
                className="text-[12px] font-semibold uppercase text-primary"
              >
                Feature highlights
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-2 text-[32px] font-semibold leading-tight sm:text-[46px]"
              >
                A platform for students, instructors, and learning progress.
              </motion.h2>
            </motion.div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureHighlights.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="group rounded-lg border border-on-background/10 bg-white p-5 shadow-[0_18px_52px_-42px_rgba(15,23,42,0.5)]"
                  >
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary-fixed text-primary transition-transform group-hover:rotate-3 group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-[15px] font-semibold text-on-background">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[12px] font-light leading-6 text-on-surface-variant">
                      {feature.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-[12px] font-semibold uppercase text-primary">
                How it works
              </p>
              <h2 className="mt-2 text-[32px] font-semibold leading-tight sm:text-[46px]">
                Simple enough for a solo project, structured enough for a real
                product demo.
              </h2>
              <p className="mt-4 max-w-xl text-[13px] font-light leading-6 text-on-surface-variant">
                Lumio keeps the core loop tight: publish, learn, track, and
                iterate without adding payments, quizzes, or enterprise noise.
              </p>
            </motion.div>

            <div className="relative grid gap-4">
              <div className="absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px bg-border sm:block" />
              {workflowSteps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, x: 34 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className="relative grid gap-4 rounded-lg border border-on-background/10 bg-surface-container-low p-5 sm:grid-cols-[48px_minmax(0,1fr)]"
                >
                  <div className="z-10 flex size-10 items-center justify-center rounded-lg bg-on-background text-[13px] font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-on-background">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[12px] font-light leading-6 text-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="builder" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-[12px] font-semibold uppercase text-primary">
                Instructor workflow
              </p>
              <h2 className="mt-2 text-[32px] font-semibold leading-tight sm:text-[46px]">
                Publish with YouTube embeds and Supabase-backed resources.
              </h2>
              <p className="mt-4 text-[13px] font-light leading-6 text-on-surface-variant">
                The builder keeps Lumio free-tier friendly: videos live on
                YouTube, while course metadata, resources, ownership, and
                publish state live in Supabase.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  "Draft, save, and publish course states",
                  "Module and lesson ordering without extra dependencies",
                  "Instructor-owned CRUD guarded by RLS",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-tertiary" />
                    <span className="text-[13px] text-on-surface">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ rotate: -1, y: -6 }}
              className="rounded-lg border border-on-background/10 bg-white p-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.55)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-on-background">
                    Course Builder
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Save & Publish
                  </p>
                </div>
                <span className="rounded-lg bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold text-on-tertiary-fixed">
                  Draft
                </span>
              </div>
              <div className="space-y-3">
                {["Course info", "Modules", "Lessons", "Resources"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-border/35 bg-surface px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-fixed text-[11px] font-semibold text-on-primary-fixed">
                          {index + 1}
                        </span>
                        <span className="text-[13px] font-medium text-on-background">
                          {item}
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-on-surface-variant" />
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-7xl"
          >
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest">
              Future improvements
            </p>
            <h2 className="mb-2 text-xl font-normal leading-snug text-foreground sm:text-2xl">
              Lumio Assistant - Built-in intelligence, where you need it
            </h2>
            <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
              Two purpose-built AI tools that adapt to your learning — available
              throughout every course.
            </p>

            <div className="grid overflow-hidden rounded-xl border border-border divide-x divide-border sm:grid-cols-2">
              <div className="group bg-background p-8 transition-colors duration-200 hover:bg-muted/40">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted group-hover:border-border/80">
                  <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                    chat
                  </span>
                </div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  AI Chatbot
                </p>
                <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                  Ask anything, get instant clarity. The course chatbot
                  understands your material and responds with context-aware
                  answers that keep you moving forward.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Conversational", "Instant answers", "Context-aware"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="group bg-background p-8 transition-colors duration-200 hover:bg-muted/40">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted group-hover:border-border/80">
                  <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                    quiz
                  </span>
                </div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  AI Quiz Generator
                </p>
                <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                  Reinforce what you've learned with automatically generated
                  quizzes. Questions adapt to each lesson's content, testing
                  comprehension at the right depth.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Auto-generated",
                    "Adaptive difficulty",
                    "Instant feedback",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-lg bg-primary-container text-white p-6 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.8)] sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center"
          >
            <div>
              <p className="text-[12px] font-normal uppercase">
                Analytics preview
              </p>
              <blockquote className="mt-3 max-w-3xl text-[26px] font-light leading-tight sm:text-[30px]">
                Lumio is shaped around the architecture signals reviewers look
                for: auth correctness, typed service boundaries, real data
                flows, and responsive product screens.
              </blockquote>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/10 p-5">
              <p className="text-[13px] font-semibold">Continue learning</p>
              <div className="mt-5 space-y-4">
                {previewCourses.map((course, index) => (
                  <div key={course.title}>
                    <div className="mb-1 flex justify-between gap-3 text-[12px]">
                      <span>{course.title}</span>
                      <span className="text-white/70">{course.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/12">
                      <motion.div
                        className={`h-full ${course.accent}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${course.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.16, duration: 0.75 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg border border-on-background/10 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h2 className="text-[28px] font-normal leading-tight text-on-background sm:text-[36px]">
                Start learning or publish your first course.
              </h2>
              <p className="mt-2 max-w-2xl text-[13px] font-light leading-6 text-on-surface-variant">
                Create an account, open the dashboard, and move through Lumio as
                either a student or instructor.
              </p>
            </div>
            <Link
              to="/signup"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-[13px] font-medium text-on-primary shadow-[0_18px_36px_-20px_rgba(53,37,205,0.9)] transition-all hover:-translate-y-0.5 hover:bg-primary-container"
            >
              Get started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-on-background/10 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-[12px] text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-on-background">&copy; 2026 Lumio. All rights reserved.</p>
          <p>Free, self-hosted learning management for modern course demos.</p>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-primary">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-primary">
              How it works
            </a>
            <Link to="/signin" className="hover:text-primary">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OnboardingPage;
