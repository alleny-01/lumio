import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { LMSContext } from "@/contexts/LMSContext";
import { signInWithGoogle, signInWithPassword } from "@/shared/api/auth";
import Input from "@/features/authentication/ui/Input";
import SocialButton from "@/features/authentication/ui/SocialButton";
import AuthenticationLayout from "../components/AuthenticationLayout";
import AuthenticationForm from "../components/AuthenticationForm";
import AuthenticationHeader from "../components/AuthenticationHeader";

function SigninPage(): React.JSX.Element {
  const navigate = useNavigate();
  const auth = useContext(LMSContext);
  const isLoading = auth?.isLoading ?? false;
  const session = auth?.session;
  const [signInEmail, setSignInEmail] = useState<string>("");
  const [signInPassword, setSignInPassword] = useState<string>("");

  useEffect(() => {
    if (session) navigate("/dashboard");
  }, [session, navigate]);

  const persistSignUpEmail = (email: string) => {
    try {
      localStorage.setItem("lumio_sign_up_email", email);
    } catch {
      return;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isLoading) return { success: false, error: "busy" };
    if (!email || !password) {
      return { success: false, error: "validation" };
    }

    auth?.setIsLoading(true);
    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error) {
        auth?.setAuthError(error.message);
        return { success: false, error };
      }

      const user = data.user;
      if (user && !(user?.email_confirmed_at || user?.confirmed_at)) {
        
        persistSignUpEmail(signInEmail.toLowerCase());
        navigate("/email-confirmation");
        return { success: false, error: "unverified" };
      }

      auth?.setSession(data.session ?? null);
      navigate("/dashboard", { replace: true });

      return { success: true, data };
    } catch (err) {
      auth?.setAuthError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-in.",
      );
      return { success: false, error: err };
    } finally {
      auth?.setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      auth?.setAuthError(error.message);
      throw error;
    }
  };

  return (
    <AuthenticationLayout>
      <AuthenticationForm>
        <div className="relative mb-8">
          <div className="mt-4">
            <AuthenticationHeader
            title="Welcome back to Lumio 👋"
            subtitle="Enter your details to sign in to your account and continue your learning journey ."
          />
          </div>
        </div>

        <div className="rounded-sm bg-card/50 shadow-md p-8 ">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(signInEmail, signInPassword);
            }}
          >
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              autoFocus
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              forgotPasswordLink
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              showPasswordToggle
            />

            <Button
              variant="default"
              size="lg"
              type="submit"
              disabled={isLoading}
              className="w-full py-5 flex items-center justify-center gap-3 rounded-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isLoading && <Spinner />}
              <span>
                {isLoading ? "Signing you in..." : "Continue with email"}
              </span>
            </Button>
          </form>

          <div className="relative my-8">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium">
              <span className="bg-card px-4 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <SocialButton
              icon={<FcGoogle size={20} />}
              onClick={() => handleGoogleSignIn()}
            >
              Google
            </SocialButton>
          </div>

          <p className="text-center mt-4 text-[8.3px] sm:text-[10px] tracking-widest text-muted-foreground">
            Protected with industry-standard encryption
          </p>
        </div>

        <div className="mt-10 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline underline-offset-4 transition-all"
              to="/signup"
            >
              Create an account
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a
              href="mailto:support@lumio.com"
              className="hover:underline underline-offset-4 transition-all"
            >
              Contact Support
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 Lumio Educational Systems. All rights reserved.
          </p>
        </div>
      </AuthenticationForm>
    </AuthenticationLayout>
  );
}

export default SigninPage;
