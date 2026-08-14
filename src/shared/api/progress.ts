import { supabase } from "@/lib/supabase/client";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function listLessonProgress(userId: string, courseId: string) {
  return supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId);
}

export function listCompletedLessonProgress(userId: string) {
  return supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("is_completed", true);
}

export async function recordLessonCompletionActivity(
  userId: string,
  durationMinutes: number,
) {
  const activityDate = localDateKey();
  const { data: current, error: currentError } = await supabase
    .from("study_activity")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", activityDate)
    .maybeSingle();

  if (currentError) return { data: null, error: currentError };

  return upsertStudyActivity({
    user_id: userId,
    activity_date: activityDate,
    minutes_studied:
      Number(current?.minutes_studied ?? 0) + Math.max(1, durationMinutes || 0),
    lessons_completed: Number(current?.lessons_completed ?? 0) + 1,
  });
}

export function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string,
) {
  const completedAt = new Date().toISOString();
  return supabase
    .from("lesson_progress")
    .upsert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: completedAt,
      updated_at: completedAt,
    })
    .select("*")
    .single();
}

export function listStudyActivity(
  userId: string,
  fromDate: string,
  toDate: string,
) {
  return supabase
    .from("study_activity")
    .select("*")
    .eq("user_id", userId)
    .gte("activity_date", fromDate)
    .lte("activity_date", toDate)
    .order("activity_date", { ascending: true });
}

export function upsertStudyActivity(values: {
  user_id: string;
  activity_date: string;
  minutes_studied?: number;
  lessons_completed?: number;
}) {
  return supabase
    .from("study_activity")
    .upsert(values, { onConflict: "user_id,activity_date" })
    .select("*")
    .single();
}
