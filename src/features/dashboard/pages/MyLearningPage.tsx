import { useContext, useEffect, useState } from "react";
import { LMSContext } from "@/contexts/LMSContext";
import { CoursesSection } from "../components/CoursesSection";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  createFallbackDashboardData,
  loadDashboardData,
} from "../api/dashboard";
import type { DashboardData } from "../types";

function MyLearningPage(): React.JSX.Element {
  const { session, setAuthError } = useContext(LMSContext);
  const [data, setData] = useState<DashboardData>(() =>
    createFallbackDashboardData(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!session?.user.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const dashboardData = await loadDashboardData(session.user.id);
        if (isMounted) setData(dashboardData);
      } catch (error) {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to load your learning dashboard.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [session?.user.id, setAuthError]);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-6">
      <header className="mb-5 rounded-sm bg-surface-container-lowest p-5">
        <p className="text-[10px] font-light uppercase tracking-[0.24em]">
          My Learning
        </p>
        <h1 className="mt-2 text-[20px] font-light text-on-surface">
          Continue learning
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] font-light leading-6 text-on-surface-variant">
          Track every enrolled course, see your progress, and jump back into the
          latest lesson.
        </p>
      </header>

      {isLoading ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-sm border border-border/40 bg-surface-container-lowest"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-3 px-4 py-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            </article>
          ))}
        </section>
      ) : (
        <CoursesSection
          courses={data.courses}
          title="All enrolled courses"
          showAllLink={false}
        />
      )}
    </div>
  );
}

export default MyLearningPage;
