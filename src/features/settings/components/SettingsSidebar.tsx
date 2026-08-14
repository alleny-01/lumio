import type { SettingsNavItem, SettingsSectionId } from "../types";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  items: SettingsNavItem[];
  activeId: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}

export function SettingsSidebar({
  items,
  activeId,
  onSelect,
}: SettingsSidebarProps) {
  return (
    <aside className="hidden w-full shrink-0 rounded-sm bg-surface-container-lowest p-3.5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.15)] md:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[12px] font-light tracking-wide transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
              aria-pressed={isActive}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}

              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant group-hover:text-on-surface",
                )}
                strokeWidth={1.75}
              />

              <span className="min-w-0 truncate text-black">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
