import { useEffect, useMemo, useState } from "react";
import CatalogNavbar from "../components/CatalogNavbar";
import FilterBar from "../components/FilterBar";
import { CourseGrid } from "../components/CourseGrid";
import { CatalogHeader } from "../components/CatalogHeader";
import { loadCatalogCourses } from "../../api/courseData";
import type { Course, SortOption } from "../types/types";

const PAGE_SIZE = 8;

export default function CourseCatalogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [difficulty, setDifficulty] = useState("all");
  const [publishDateSort, setPublishDateSort] = useState<SortOption>("default");
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      setIsLoading(true);
      try {
        const result = await loadCatalogCourses({
          search: debouncedSearch,
          category,
          difficulty,
          publishDateSort,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!isMounted) return;
        setCourses(result.courses);
        setTotal(result.total);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, [category, debouncedSearch, difficulty, publishDateSort, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  return (
    <div className="text-on-background antialiased ">
      <main className="mx-auto px-4 pb-8 pt-4 sm:px-6 lg:px-6">
        <CatalogNavbar search={search} onSearchChange={setSearch} />
        <CatalogHeader />
        <FilterBar
          category={category}
          difficulty={difficulty}
          publishDateSort={publishDateSort}
          onCategoryChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          onDifficultyChange={(value) => {
            setDifficulty(value);
            setPage(1);
          }}
          onPublishDateSortChange={(value) => {
            setPublishDateSort(value as SortOption);
            setPage(1);
          }}
        />



        <CourseGrid courses={courses} isLoading={isLoading} />

        <div className="mt-14 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-sm border border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-xs text-on-surface disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-sm border border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-xs text-on-surface disabled:opacity-40"
            >
              Next
            </button>
          </div>
          <p className="text-on-surface-variant text-xs font-light">
            Showing {isLoading ? "..." : courses.length} of {total} courses available
          </p>
        </div>
      </main>
    </div>
  );
}
