import { Check, KeyRound, Mail, Shield, Trash2, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { AuthProvider } from "@/shared/types/database";

interface AccountSecuritySectionProps {
  email: string;
  authProvider: AuthProvider;
  isSaving: boolean;
  onPasswordChange: (password: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function AccountSecuritySection({
  email,
  authProvider,
  isSaving,
  onPasswordChange,
  onDeleteAccount,
}: AccountSecuritySectionProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEmailProvider = authProvider === "email";
  const atLeastSixChars = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);
  const passwordMatch = newPassword === confirmPassword;
  const isPasswordValid =
    atLeastSixChars && hasUppercase && hasSpecialChar && passwordMatch;
  const passwordStrength =
    [
      atLeastSixChars,
      hasUppercase,
      hasSpecialChar,
    ].filter(Boolean).length;

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPassword || !isPasswordValid) return;
    await onPasswordChange(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <section className="min-w-0 rounded-sm border border-border/30 bg-surface-container-lowest px-4 py-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6">
      <div className="flex items-center gap-2 border-b border-border/30 pb-4">
        <Shield className="size-4 text-primary" />
        <h2 className="text-[15px] font-normal text-on-background">
          Account & Security
        </h2>
      </div>

      <div className="divide-y divide-border/30">
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[13px] font-medium text-on-background">
              <Mail className="size-4 text-primary" />
              Email address
            </div>
            <p className="mt-1 break-all text-[12px]">
              {email}
            </p>
          </div>
          <div className="rounded-full border border-border/40 bg-surface-container-low px-3 py-1.5 text-[11px] font-medium capitalize text-on-surface">
            {authProvider === "google" ? "Google" : "Email/password"}
          </div>
        </div>

        <div className="py-5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-on-background">
            <KeyRound className="size-4 text-primary" />
            Password
          </div>
          {isEmailProvider ? (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    New password
                  </span>
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="h-10 w-full rounded-xl border border-border/40 bg-surface px-3 text-[13px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-10 w-full rounded-xl border border-border/40 bg-surface px-3 text-[13px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <Button
                  type="submit"
                  size="lg"
                  className="self-end"
                  disabled={isSaving || !newPassword || !isPasswordValid}
                >
                  Change
                </Button>
              </div>

              {newPassword ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.3px] sm:text-[10px] tracking-widest text-muted-foreground">
                      Password Strength
                    </span>
                    <span className="text-[8.3px] sm:text-[10px] tracking-widest text-primary">
                      {["Weak", "Fair", "Strong"][Math.max(0, passwordStrength - 1)]}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${passwordStrength * 33}%` }}
                    />
                  </div>

                  {confirmPassword ? (
                    <div
                      className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                        passwordMatch
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {passwordMatch ? (
                        <Check size={13} />
                      ) : (
                        <TriangleAlert size={13} />
                      )}
                      <span className="sm:text-[10px] text-[8.5px] tracking-widest">
                        {passwordMatch
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  ) : null}

                  <p className="mb-3 mt-4 text-[8.3px] sm:text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Password Requirements
                  </p>

                  <div className="flex flex-col gap-2">
                    <div
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                        atLeastSixChars
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {atLeastSixChars ? (
                        <Check size={13} className="shrink-0" />
                      ) : (
                        <X size={13} className="shrink-0" />
                      )}
                      <span className="sm:text-[10px] text-[8.3px] tracking-widest">
                        Password must contain at least 6 characters
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                        hasUppercase
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {hasUppercase ? (
                        <Check size={13} className="shrink-0" />
                      ) : (
                        <X size={13} className="shrink-0" />
                      )}
                      <span className="sm:text-[10px] text-[8.3px] tracking-widest">
                        Password must contain at least one uppercase character
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                        hasSpecialChar
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {hasSpecialChar ? (
                        <Check size={13} className="shrink-0" />
                      ) : (
                        <X size={13} className="shrink-0" />
                      )}
                      <span className="sm:text-[10px] text-[8.3px] tracking-widest">
                        Password must contain at least one special character
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </form>
          ) : (
            <p className="mt-2 text-[12px] font-light leading-5">
              This account signs in with Google, so password changes are managed
              through Google.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[13px] font-medium text-error">
              <Trash2 className="size-4" />
              Delete account
            </div>
            <p className="mt-1 max-w-2xl text-[12px] font-light leading-5">
              Permanently deleting a user must run through a secure server route
              or Supabase Edge Function.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {showDeleteConfirm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
        >
          <div className="w-full max-w-md rounded-sm border border-border/40 bg-surface-container-lowest p-5 shadow-xl">
            <h3
              id="delete-account-title"
              className="text-[15px] font-semibold text-on-background"
            >
              Confirm account deletion
            </h3>
            <p className="mt-2 text-[12px] font-light leading-5 text-on-surface-variant">
              Lumio needs a secure backend deletion endpoint before this can
              permanently remove account data. This action will request that
              flow and show the current backend status.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="w-full sm:w-auto"
                onClick={async () => {
                  await onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
              >
                Request deletion
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
