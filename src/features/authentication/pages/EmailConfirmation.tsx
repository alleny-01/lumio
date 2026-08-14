import { Button } from "@/components/ui/Button";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { LMSContext } from "@/contexts/LMSContext";
import { Spinner } from "@/components/ui/Spinner";
import { exchangeAuthCodeForSession } from "@/shared/api/auth";

type Status = "waiting" | "confirming" | "success" | "error";

const RESEND_COOLDOWN_SECONDS = 45;

function EmailConfirmation(): React.JSX.Element {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(() =>
    new URLSearchParams(window.location.search).get("code")
      ? "confirming"
      : "waiting",
  );
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [cooldown, setCooldown] = useState(0);
  const [redirectIn, setRedirectIn] = useState(3);
  const [signUpEmail] = useState<string>(
    () => localStorage.getItem("lumio_sign_up_email") ?? "",
  );
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { resendVerification } = useContext(LMSContext);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      exchangeAuthCodeForSession(code).then(({ error }) => {
        if (error) {
          setStatus("error");
        } else {
          setStatus("success");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (status !== "success") return;

    if (redirectIn <= 0) {
      navigate("/courses");
      return;
    }

    const timer = setTimeout(() => setRedirectIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, redirectIn, navigate]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  const handleResend = async () => {
    const emailToUse =
      signUpEmail || localStorage.getItem("lumio_sign_up_email") || undefined;
    if (!emailToUse || resendState === "sending" || cooldown > 0) return;

    setResendState("sending");
    try {
      const res = await resendVerification(emailToUse);
      if (res?.success) {
        setResendState("sent");
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setTimeout(() => setResendState("idle"), 2500);
      } else {
        setResendState("idle");
      }
    } catch {
      setResendState("idle");
    }
  };

  useEffect(() => {
    let polling: ReturnType<typeof setInterval> | null = null;
    if (status === "waiting") {
      polling = setInterval(async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            setStatus("success");
          }
        } catch {
          // ignore
        }
      }, 3000);
    }
    return () => {
      if (polling) clearInterval(polling);
    };
  }, [status]);

  const steps = [
    { label: "Create account", done: true },
    { label: "Confirm email", done: status === "success" },
    { label: "Start learning", done: false },
  ];

  return (
    <main className="relative flex items-center justify-center min-h-screen px-4 py-10 bg-surface-container-low overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative w-full sm:w-[420px]">
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  step.done
                    ? "w-6 bg-primary"
                    : i === 1
                      ? "w-6 bg-primary/40"
                      : "w-3 bg-outline-variant/40",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        <div className="relative rounded-md border border-outline-variant/15 bg-surface-container/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] p-7 sm:p-8 transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <p className="font-extralight text-[11px] tracking-[0.2em] uppercase text-muted-foreground text-center">
            Lumio · Account setup
          </p>

          <div className="relative flex items-center justify-center mt-6 mb-5">
            <div
              className={[
                "absolute inset-0 m-auto w-24 h-24 rounded-full blur-2xl scale-110 transition-colors duration-700",
                status === "success"
                  ? "bg-emerald-400/25"
                  : status === "error"
                    ? "bg-red-400/20"
                    : "bg-primary/20",
              ].join(" ")}
            />
            <div
              className={[
                "relative w-18 h-18 rounded-sm border flex items-center justify-center shadow-xl transition-all duration-500",
                status === "success"
                  ? "bg-surface-container border-emerald-400/30 scale-105"
                  : status === "error"
                    ? "bg-surface-container border-red-400/30"
                    : "bg-surface-container border-outline-variant/20 animate-float",
              ].join(" ")}
            >
              {status === "success" ? (
                <span
                  className="material-symbols-outlined text-5xl text-emerald-500 animate-in zoom-in duration-300"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              ) : status === "error" ? (
                <span
                  className="material-symbols-outlined text-5xl text-red-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-5xl text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mail
                </span>
              )}
            </div>

            {status === "confirming" && (
              <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            )}
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-sm font-medium text-foreground">
              {status === "waiting" && "Check your inbox"}
              {status === "confirming" && "Confirming your email"}
              {status === "success" && "You're verified"}
              {status === "error" && "Confirmation failed"}
            </h1>

            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              {status === "waiting" && (
                <>
                  We've sent a confirmation link to{" "}
                  <span className="font-semibold text-primary-container tracking-wide">
                    {signUpEmail}
                  </span>
                  . Click the link to activate your account.
                </>
              )}
              {status === "confirming" &&
                "Hang tight, we're verifying your link. This only takes a moment."}
              {status === "success" &&
                `Your account is active. Taking you to your courses in ${redirectIn}s…`}
              {status === "error" &&
                "That link may have expired or already been used. Request a new one below."}
            </p>
          </div>

          {status === "waiting" && (
            <div className="mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low/60 px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">
                  check
                </span>
                Email sent successfully
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  schedule
                </span>
                Link expires in 24 hours
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  folder_open
                </span>
                Not in your inbox? Check spam or promotions
              </div>
            </div>
          )}

          {(status === "confirming" || status === "success") && (
            <div className="flex justify-center mt-6">
              {status === "confirming" && <Spinner />}
            </div>
          )}

          <div className="mt-7 flex flex-col items-center gap-3">
            {status === "success" && (
              <Button
                variant="default"
                size="lg"
                className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                onClick={() => navigate("/courses")}
              >
                Go to my courses
              </Button>
            )}

            {(status === "waiting" || status === "error") && (
              <Button
                variant={status === "error" ? "default" : "outline"}
                size="lg"
                disabled={resendState === "sending" || cooldown > 0}
                onClick={handleResend}
                className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] disabled:hover:scale-100"
              >
                {resendState === "sending" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : resendState === "sent" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      check
                    </span>
                    Email resent
                  </span>
                ) : cooldown > 0 ? (
                  `Resend available in ${cooldown}s`
                ) : (
                  "Resend confirmation email"
                )}
              </Button>
            )}

            {status === "waiting" && (
              <p className="text-center text-muted-foreground text-[11px] leading-relaxed">
                Wrong email address?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-primary-container font-medium hover:underline underline-offset-2 transition-colors"
                >
                  Sign up again
                </button>
              </p>
            )}
          </div>

          <div className="mt-7 pt-5 border-t border-outline-variant/10 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">
                lock
              </span>
              Encrypted
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">
                verified_user
              </span>
              Identity verified
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">
                privacy_tip
              </span>
              No spam, ever
            </span>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-[11px] mt-5">
          Need help?{" "}
          <a
            href="mailto:support@lumio.com"
            className="text-primary-container font-medium hover:underline underline-offset-2"
          >
            Contact support
          </a>
        </p>
      </div>
    </main>
  );
}

export default EmailConfirmation;
