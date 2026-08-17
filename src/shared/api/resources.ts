import { supabase } from "@/lib/supabase/client";
import type { Inserts, Updates } from "@/shared/types/database";

export function listCourseResources(courseId: string) {
  return supabase
    .from("lesson_resources")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
}

export function createResource(resource: Inserts<"lesson_resources">) {
  return supabase.from("lesson_resources").insert(resource).select("*").single();
}

export function updateResource(
  resourceId: string,
  values: Updates<"lesson_resources">,
) {
  return supabase
    .from("lesson_resources")
    .update(values)
    .eq("id", resourceId)
    .select("*")
    .single();
}

export function deleteResource(resourceId: string) {
  return supabase.from("lesson_resources").delete().eq("id", resourceId);
}

export function uploadResourceFile(path: string, file: File) {
  return supabase.storage.from("lesson-resources").upload(path, file, {
    upsert: true,
  });
}

export function uploadCourseThumbnail(path: string, file: File) {
  return supabase.storage.from("course-thumbnails").upload(path, file, {
    upsert: true,
  });
}

export function getPublicStorageUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
