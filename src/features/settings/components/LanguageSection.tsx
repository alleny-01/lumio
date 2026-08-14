import { Globe } from "lucide-react";

interface LanguageSectionProps {
  language: "en";
}

export function LanguageSection({ language }: LanguageSectionProps) {
  return (
    <section className="min-w-0 rounded-sm border border-border/30 bg-surface-container-lowest px-4 py-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6">
      <div className="flex items-center gap-2 border-b border-border/30 pb-4">
        <Globe className="size-4 text-primary" />
        <h2 className="text-[15px] font-normal text-on-background">
          Language
        </h2>
      </div>
      <div className="py-5">
        <label className="block max-w-sm space-y-1.5">
          <span className="text-[11px] font-medium text-on-surface-variant">
            App language
          </span>
          <select
            value={language}
            className="h-10 w-full rounded-xl border border-border/40 bg-surface px-3 text-[13px] text-on-background outline-none"
          >
            <option value="en">English</option>
          </select>
        </label>
        <p className="mt-3 max-w-xl text-[11px] font-light leading-5 text-on-surface-variant">
          Lumio stores the language preference on the profile schema, with
          English enabled for this portfolio release.
        </p>
      </div>
    </section>
  );
}
