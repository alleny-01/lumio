import { categories } from "../constants";

interface FilterBarProps {
  category: string;
  difficulty: string;
  publishDateSort: string;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onPublishDateSortChange: (value: string) => void;
}

function FilterBar({
  category,
  difficulty,
  publishDateSort,
  onCategoryChange,
  onDifficultyChange,
  onPublishDateSortChange,
}: FilterBarProps) {
  return (
    <div className="mb-7 grid gap-3 rounded-sm border border-border/40 bg-surface-container-lowest p-3 sm:grid-cols-3">
      <label className="space-y-1.5 text-[11px] font-light text-on-surface-variant">
        Category
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="h-9 w-full rounded-sm bg-surface-container-low px-3 text-xs text-on-surface outline-none"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5 text-[11px] font-light text-on-surface-variant">
        Difficulty
        <select
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value)}
          className="h-9 w-full rounded-sm bg-surface-container-low px-3 text-xs text-on-surface outline-none"
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <label className="space-y-1.5 text-[11px] font-light text-on-surface-variant">
        Publish date
        <select
          value={publishDateSort}
          onChange={(event) => onPublishDateSortChange(event.target.value)}
          className="h-9 w-full rounded-sm bg-surface-container-low px-3 text-xs text-on-surface outline-none"
        >
          <option value="default">Default</option>
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </label>
    </div>
  );
}

export default FilterBar;
