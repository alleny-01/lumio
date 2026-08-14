import { getProfile } from "@/shared/api/profiles";
import { listUserEnrollments } from "@/shared/api/enrollments";
import {
  listCompletedLessonProgress,
  listStudyActivity,
} from "@/shared/api/progress";
import type { Tables } from "@/shared/types/database";
import { fallbackQuotes } from "../constants";
import type {
  DashboardActivity,
  DashboardCourse,
  DashboardData,
  DashboardQuote,
} from "../types";

interface EnrollmentWithCourse extends Tables<"enrollments"> {
  courses: Tables<"courses"> | null;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getRecentWindow(days: number) {
  const end = startOfDay(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return { start: localDateKey(start), end: localDateKey(end) };
}

function getWeekStartDateKey() {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - 6);
  return localDateKey(start);
}

function calculateStreak(activity: DashboardActivity[]) {
  const activeDates = new Set(
    activity
      .filter((item) => item.minutes > 0 || item.lessonsCompleted > 0)
      .map((item) => item.date),
  );
  const cursor = startOfDay(new Date());
  let streak = 0;

  while (activeDates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function mapEnrollmentToCourse(
  enrollment: EnrollmentWithCourse,
): DashboardCourse | null {
  if (!enrollment.courses) return null;
  const progress = Number(enrollment.progress_percent ?? 0) / 100;
  const status =
    enrollment.completed_at || progress >= 1
      ? "completed"
      : progress > 0
        ? "in-progress"
        : "not-started";

  return {
    id: enrollment.course_id,
    module: enrollment.courses.category,
    title: enrollment.courses.title,
    image:
      enrollment.courses.thumbnail_url ??
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    progress,
    completedLessons:
      status === "completed"
        ? "Course completed"
        : `${Math.round(progress * 100)}% complete`,
    href: enrollment.last_watched_lesson_id
      ? `/viewer?course=${enrollment.course_id}&lesson=${enrollment.last_watched_lesson_id}`
      : `/viewer?course=${enrollment.course_id}`,
    status,
  };
}

async function fetchQuote(): Promise<DashboardQuote> {
  const fallback =
    fallbackQuotes[new Date().getDate() % fallbackQuotes.length] ??
    fallbackQuotes[0];

  return fallback;
}

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const { start, end } = getRecentWindow(35);
  const [
    profileResult,
    enrollmentsResult,
    activityResult,
    completedLessonsResult,
    quote,
  ] =
    await Promise.all([
      getProfile(userId),
      listUserEnrollments(userId),
      listStudyActivity(userId, start, end),
      listCompletedLessonProgress(userId),
      fetchQuote(),
    ]);

  const enrollments = (enrollmentsResult.data ?? []) as EnrollmentWithCourse[];
  const activityRows = activityResult.data ?? [];
  const courses = enrollments
    .map(mapEnrollmentToCourse)
    .filter((course): course is DashboardCourse => Boolean(course));
  const activity: DashboardActivity[] = activityRows.map((item) => ({
    date: item.activity_date,
    minutes: item.minutes_studied,
    lessonsCompleted: item.lessons_completed,
  }));

  const firstName =
    profileResult.data?.first_name ??
    profileResult.data?.email?.split("@")[0] ??
    "Learner";
  const weekStartDateKey = getWeekStartDateKey();
  const weeklyMinutes = activity
    .filter((item) => item.date >= weekStartDateKey)
    .reduce((sum, item) => sum + item.minutes, 0);
  const completedCourseCount = enrollments.filter(
    (item) => item.completed_at || Number(item.progress_percent) >= 100,
  ).length;
  const totalLessonsCompleted =
    completedLessonsResult.data?.length ??
    activity.reduce((sum, item) => sum + item.lessonsCompleted, 0);

  return {
    firstName,
    weeklyStudyHours: Number((weeklyMinutes / 60).toFixed(1)),
    averageGrade: 0,
    enrolledCourseCount: enrollments.length,
    completedCourseCount,
    activeCourseCount: enrollments.length - completedCourseCount,
    totalLessonsCompleted,
    streakDays: calculateStreak(activity),
    courses,
    activity,
    quote,
  };
}

export function createFallbackDashboardData(firstName = "Learner"): DashboardData {
  const quote =
    fallbackQuotes[new Date().getDate() % fallbackQuotes.length] ??
    fallbackQuotes[0];

  return {
    firstName,
    weeklyStudyHours: 0,
    averageGrade: 0,
    enrolledCourseCount: 0,
    completedCourseCount: 0,
    activeCourseCount: 0,
    totalLessonsCompleted: 0,
    streakDays: 0,
    courses: [],
    activity: [],
    quote,
  };
}
