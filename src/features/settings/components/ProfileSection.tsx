import { RotateCcw, Save, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProfileSettingsForm } from "../types";

interface ProfileSectionProps {
  form: ProfileSettingsForm;
  isDirty: boolean;
  isSaving: boolean;
  isUploading: boolean;
  onChange: (values: Partial<ProfileSettingsForm>) => void;
  onDiscard: () => void;
  onSave: () => void;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove: () => void;
}

export function ProfileSection({
  form,
  isDirty,
  isSaving,
  isUploading,
  onChange,
  onDiscard,
  onSave,
  onAvatarUpload,
  onAvatarRemove,
}: ProfileSectionProps) {
  const initials =
    `${form.firstName.slice(0, 1)}${form.lastName.slice(0, 1)}`.trim() ||
    form.email.slice(0, 1).toUpperCase() ||
    "L";

  return (
    <section className="min-w-0 rounded-sm border border-border/30 bg-surface-container-lowest px-4 py-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5  pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 pb-4">
            <UserRound className="size-4 text-primary" />
            <h2 className="text-[15px] font-normal text-on-background">
              Profile
            </h2>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onDiscard}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="size-4" />
            Discard
          </Button>
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onSave}
            disabled={!isDirty || isSaving}
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:block lg:space-y-3">
            <div className="flex size-22 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/40 bg-primary/10 text-[24px] font-medium text-primary">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-on-background">
                Profile photo
              </p>
              <p className="mt-1 text-[11px] font-normal leading-5">
                Use a clear square image. JPG, PNG, or WebP works best.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              <Upload className="size-4" />
              {isUploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) onAvatarUpload(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onAvatarRemove}
              disabled={!form.avatarUrl || isUploading}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 overflow-hidden space-y-1.5">
            <span className="text-[11px] font-medium text-on-surface-variant">
              First name
            </span>
            <input
              value={form.firstName}
              onChange={(event) => onChange({ firstName: event.target.value })}
              className="h-10 w-full min-w-0 rounded-xl border border-border/40 bg-surface px-3 text-[13px] text-on-background outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="First name"
            />
          </label>
          <label className="space-y-1.5 min-w-0">
            <span className="text-[11px] font-medium text-on-surface-variant">
              Last name
            </span>
            <input
              value={form.lastName}
              onChange={(event) => onChange({ lastName: event.target.value })}
              className="h-10 w-full min-w-0 rounded-xl border border-border/40 bg-surface px-3 text-[13px] text-on-background outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="Last name"
            />
          </label>
          <label className="space-y-1.5 min-w-0">
            <span className="text-[11px] font-medium text-on-surface-variant">
              Date of birth
            </span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                onChange({ dateOfBirth: event.target.value })
              }
              className="block h-10 w-full min-w-0 max-w-full appearance-none overflow-hidden rounded-xl border border-border/40 bg-surface px-2 text-[13px] text-on-background outline-none transition [min-inline-size:0] focus:border-primary/50 focus:ring-2 focus:ring-primary/15 sm:px-3 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[11px] font-medium text-on-surface-variant">
              Bio
            </span>
            <textarea
              value={form.bio}
              onChange={(event) => onChange({ bio: event.target.value })}
              className="min-h-28 w-full resize-y rounded-xl border border-border/40 bg-surface px-3 py-2 text-[13px] leading-6 text-on-background outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="A short note about what you teach or what you are learning."
              maxLength={480}
            />
            <span className="block text-right text-[10px] text-on-surface-variant">
              {form.bio.length}/480
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
