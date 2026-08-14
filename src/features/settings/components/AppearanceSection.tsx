import { Monitor, Moon, Palette, Sun } from "lucide-react";
import type { ThemePreference } from "@/shared/types/database";

interface AppearanceSectionProps {
  theme: ThemePreference;
  isSaving: boolean;
  onThemeChange: (theme: ThemePreference) => void;
}

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Lumio's default clean, bright interface.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dark mode option (coming in a future update).",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follows light theme mode across all devices.",
    icon: Monitor,
  },
];

export function AppearanceSection({
  theme,
  isSaving,
  onThemeChange,
}: AppearanceSectionProps) {
  return (
    <section className="min-w-0 rounded-sm border border-border/30 bg-surface-container-lowest px-4 py-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6">
      <div className="flex items-center gap-2 border-b border-border/30 pb-4">
        <Palette className="size-4 text-primary" />
        <h2 className="text-[15px] font-normal text-on-background">
          Appearance
        </h2>
      </div>
      <div className="grid gap-3 py-5 md:grid-cols-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === theme;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isSaving}
              onClick={() => onThemeChange(option.value)}
              className={`rounded-sm border p-4 text-left transition ${
                isSelected
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/40 bg-surface hover:border-primary/25 hover:bg-surface-container-low"
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="size-4" />
              <p className="mt-3 text-[13px] font-medium">{option.label}</p>
              <p className="mt-1 text-[11px] font-light leading-5 text-on-surface-variant">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
