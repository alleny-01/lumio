import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LMSContext } from "@/contexts/LMSContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { enrollInCourse, getEnrollment } from "@/shared/api/enrollments";
import { CourseHero } from "../components/CourseHero";
import { CourseOverview } from "../components/CourseOverview";
import { CourseSyllabus } from "../components/CourseSyllabus";
import { InstructorSection } from "../components/InstructorSection";
import { COURSE_DETAIL } from "../constants";
import { loadCourseDetail } from "../../api/courseData";
import type { CourseDetail } from "../types/types";

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { session, setAuthError } = useContext(LMSContext);
  const [course, setCourse] = useState<CourseDetail>(COURSE_DETAIL);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const detail = await loadCourseDetail(courseId);
        if (!isMounted) return;
        setCourse(detail);

        if (session?.user.id && !/^\d+$/.test(courseId)) {
          const { data } = await getEnrollment(session.user.id, courseId);
          if (isMounted) setIsEnrolled(Boolean(data));
        }
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : "Unable to load course.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [courseId, session?.user.id, setAuthError]);

  const handleEnroll = async () => {
    if (!courseId) return;

    if (isEnrolled) {
      showToast({
        type: "info",
        title: "Already Enrolled",
        description: "Opening the course viewer.",
      });
      navigate(`/viewer?course=${courseId}`);
      return;
    }

    // Demo/Static numeric courses
    if (/^\d+$/.test(courseId)) {
      setIsEnrolled(true);
      showToast({
        type: "success",
        title: "Course Enrolled!",
        description: `Successfully enrolled in ${course.title}.`,
      });
      navigate(`/viewer?course=${courseId}`);
      return;
    }

    if (!session?.user.id) {
      navigate("/signin");
      return;
    }

    setIsEnrolling(true);
    try {
      const { error } = await enrollInCourse(session.user.id, courseId);
      if (error) {
        setAuthError(error.message);
        showToast({
          type: "error",
          title: "Enrollment Failed",
          description: error.message,
        });
        return;
      }
      setIsEnrolled(true);
      showToast({
        type: "success",
        title: "Course Enrolled!",
        description: `Successfully enrolled in ${course.title}.`,
      });
      navigate(`/viewer?course=${courseId}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-grow px-4 py-10 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-8 h-10 w-4/5" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-8 flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow">
      <CourseHero
        course={course}
        isEnrolled={isEnrolled}
        isEnrolling={isEnrolling}
        onEnroll={handleEnroll}
      />
      <CourseOverview course={course} />
      <InstructorSection instructor={course.instructor} />
      <CourseSyllabus modules={course.modules} />
    </main>
  );
}

export default CourseDetailPage;
