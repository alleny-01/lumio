import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, TriangleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Spinner } from "@/components/ui/Spinner";
import { LMSContext } from "@/contexts/LMSContext";
import { signInWithGoogle, signUpWithPassword } from "@/shared/api/auth";
import { Button } from "@/components/ui/Button";
import Input from "@/features/authentication/ui/Input";
import SocialButton from "@/features/authentication/ui/SocialButton";
import AuthenticationForm from "../components/AuthenticationForm";
import AuthenticationHeader from "../components/AuthenticationHeader";
import AuthenticationLayout from "../components/AuthenticationLayout";

const signUpBackgroundImage = "/AuthBackground.png";

function SignupPage(): React.JSX.Element {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [signUpEmail, setSignUpEmail] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const atleastSixChars = signUpPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(signUpPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(signUpPassword);
  const passwordMatch = signUpPassword === confirmPassword;
  const isPasswordValid =
    atleastSixChars && hasUppercase && hasSpecialChar && passwordMatch;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const auth = useContext(LMSContext);
  const isLoading = auth?.isLoading ?? false;
  const session = auth?.session;
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate("/courses");
  }, [session, navigate]);

  const persistSignUpEmail = (email: string) => {
    try {
      localStorage.setItem("lumio_sign_up_email", email);
    } catch {
      return;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isLoading) return { success: false, error: "busy" };
    if (!email || !password) {
      return { success: false, error: "validation" };
    }

    auth?.setIsLoading(true);
    try {
      persistSignUpEmail(email.toLowerCase());
      const { data, error } = await signUpWithPassword(email, password, {
        first_name: firstName,
        last_name: lastName,
      });

      if (error) {
        auth?.setAuthError(error.message);
        return { success: false, error };
      }

      navigate("/email-confirmation");
      return { success: true, data };
    } catch (err) {
      auth?.setAuthError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-up.",
      );
      return { success: false, error: err };
    } finally {
      auth?.setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      auth?.setAuthError(error.message);
      throw error;
    }
  };

  return (
    <div className="md:flex justify-between gap-4 w-full h-full">
      <div
        className="relative md:w-[680px] w-full md:min-h-screen min-h-[200px] shadow-lg overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`absolute inset-0 bg-no-repeat bg-center bg-cover transition-all duration-700 ease-in-out ${
            isHovered
              ? "scale-[1.2] shadow-[0_0_40px_rgba(168,85,247,0.4),0_0_80px_rgba(59,130,246,0.2)]"
              : "scale-100"
          }`}
          style={{ backgroundImage: `url("${signUpBackgroundImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/45 md:bg-gradient-to-r md:from-black/35 md:via-black/5 md:to-transparent" />
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent opacity-0 animate-pulse-glow" />
        )}
        <div className="absolute inset-x-4 bottom-5 flex flex-col gap-3 rounded-md border border-white/15 bg-black/18 p-4 text-white backdrop-blur-sm sm:inset-auto sm:left-25 sm:top-20 sm:max-w-sm sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <span className="inline-flex items-center gap-2 w-fit rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now onboarding
          </span>
          <h1
            className="text-white text-lg tracking-wide"
            style={{ fontWeight: 100 }}
          >
            Create your Lumio account &rarr;
          </h1>
          <p className="text-white/60 text-[10px] tracking-wide font-light leading-relaxed">
            Join a growing community mastering their craft, one session at a
            time.
          </p>
        </div>
      </div>

      <AuthenticationLayout>
        <AuthenticationForm>
          <AuthenticationHeader
            title="Create your account"
            subtitle="Enter the digital atelier to start your mastery."
          />

          <div className="mt-6 rounded-md w-full border border-border/50 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5 p-5">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                signUp(signUpEmail, signUpPassword);
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <p className="text-[8.3px] sm:text-[10px] tracking-widest uppercase text-muted-foreground">
                    Personal Information
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center justify-between w-full">
                  <Input
                    id="first-name"
                    label="First name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />

                  <Input
                    id="last-name"
                    label="Last name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <Input
                id="email"
                label="Email address"
                type="email"
                placeholder="johndoe@gmail.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <p className="text-[8.3px] sm:text-[10px] tracking-widest uppercase text-muted-foreground">
                    Account Security
                  </p>
                </div>

                <div className="space-y-5">
                  <Input
                    id="password"
                    label="Create password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    showPasswordToggle
                  />

                  <Input
                    id="confirm-password"
                    label="Confirm password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showPasswordToggle
                  />

                  {signUpPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.3px] sm:text-[10px] tracking-widest text-muted-foreground">
                          Password Strength
                        </span>

                        <span className="text-[8.3px] sm:text-[10px] tracking-widest text-primary">
                          {
                            ["Weak", "Fair", "Strong"][
                              Math.max(
                                0,
                                [
                                  signUpPassword.length >= 6,
                                  /[A-Z]/.test(signUpPassword),
                                  /[^a-zA-Z0-9]/.test(signUpPassword),
                                ].filter(Boolean).length - 1,
                              )
                            ]
                          }
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${
                              [
                                signUpPassword.length >= 6,
                                /[A-Z]/.test(signUpPassword),
                                /[^a-zA-Z0-9]/.test(signUpPassword),
                              ].filter(Boolean).length * 33
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {signUpPassword && confirmPassword && (
                    <div
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
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
                  )}

                  {signUpPassword ? (
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="mb-3 text-[8.3px] sm:text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        Password Requirements
                      </p>

                      <div className="flex flex-col gap-2">
                        <div
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                            atleastSixChars
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {atleastSixChars ? (
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
                            Password must contain at least one uppercase
                            character
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
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-3 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                    />
                  </div>

                  <div className="text-xs leading-relaxed">
                    <label
                      htmlFor="terms"
                      className="font-body text-on-surface-variant"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary-container font-medium hover:underline underline-offset-4 transition-all"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary-container font-medium hover:underline underline-offset-4 transition-all"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                type="submit"
                className="w-full py-5 flex justify-center items-center gap-4 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
                disabled={
                  !firstName ||
                  !lastName ||
                  !signUpEmail ||
                  !signUpPassword ||
                  !confirmPassword ||
                  !isPasswordValid ||
                  !termsAccepted
                }
              >
                <span>
                  {isLoading ? "Creating Account..." : "Continue with email"}
                </span>

                {isLoading && <Spinner />}
              </Button>
            </form>

            <div className="relative my-8">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="relative flex justify-center text-xs uppercase tracking-widest font-label font-medium">
                <span className="bg-card px-4 text-on-surface-variant">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <SocialButton
                  icon={<FcGoogle size={20} />}
                  onClick={() => handleGoogleSignUp()}
                >
                  Google
                </SocialButton>
              </div>

              <p className="text-center text-[8.3px] sm:text-[10px] tracking-widest text-muted-foreground">
                Protected with industry-standard encryption
              </p>
            </div>
          </div>

          <div className="mt-10 text-center text-xs">
            <p className="font-body text-on-surface-variant">
              Already an initiate?{" "}
              <Link
                to="/signin"
                className="font-medium text-primary hover:underline underline-offset-4 transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </AuthenticationForm>
      </AuthenticationLayout>
    </div>
  );
}

export default SignupPage;
