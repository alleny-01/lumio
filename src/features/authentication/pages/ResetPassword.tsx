import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { LMSContext } from "@/contexts/LMSContext";
import { updatePassword } from "@/shared/api/auth";
import Input from "../ui/Input";
import AuthenticationForm from "../components/AuthenticationForm";
import AuthenticationHeader from "../components/AuthenticationHeader";
import AuthenticationLayout from "../components/AuthenticationLayout";

function ResetPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const auth = useContext(LMSContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const isLoading = auth?.isLoading ?? false;
  const setIsLoading = auth?.setIsLoading;
  const setAuthError = auth?.setAuthError;
  const passwordsMatch = password === confirmPassword;
  const atleastSixChars = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = atleastSixChars && hasUppercase && hasSpecialChar && passwordsMatch;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPasswordValid || isLoading) return;

    setMessage(null);
    setIsLoading?.(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setAuthError?.(error.message);
        return;
      }
      setMessage("Password updated. Redirecting you to sign in...");
      setTimeout(() => navigate("/signin", { replace: true }), 1200);
    } catch (error) {
      setAuthError?.(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <AuthenticationLayout>
      <AuthenticationForm>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <LockKeyhole className="w-5 h-5 text-primary" strokeWidth={1} />
          </div>
          <AuthenticationHeader
            title="Set a new password"
            subtitle="Choose a secure password for your Lumio account."
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="password"
            label="New password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            showPasswordToggle
            autoFocus
          />
          <Input
            id="confirm-password"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            showPasswordToggle
          />

          {!passwordsMatch && confirmPassword && (
            <p className="text-xs text-error">Passwords do not match.</p>
          )}

          {password && (
            <div className="space-y-1 mt-2">
              <p
                className={`text-xs ${
                  atleastSixChars ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {atleastSixChars ? "✓" : "○"} At least 6 characters
              </p>
              <p
                className={`text-xs ${
                  hasUppercase ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {hasUppercase ? "✓" : "○"} At least one uppercase letter
              </p>
              <p
                className={`text-xs ${
                  hasSpecialChar ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {hasSpecialChar ? "✓" : "○"} At least one special character
              </p>
            </div>
          )}

          {message && <p className="text-xs text-emerald-600">{message}</p>}

          <Button
            variant="default"
            size="lg"
            type="submit"
            disabled={!isPasswordValid || isLoading}
            className="w-full py-5 flex justify-center items-center gap-3"
          >
            {isLoading && <Spinner />}
            {isLoading ? "Updating password..." : "Update password"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </AuthenticationForm>
    </AuthenticationLayout>
  );
}

export default ResetPassword;
