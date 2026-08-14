import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { LMSContext } from "@/contexts/LMSContext";
import { requestPasswordReset } from "@/shared/api/auth";
import { Spinner } from "@/components/ui/Spinner";
import Input from "../ui/Input";
import AuthenticationLayout from "../components/AuthenticationLayout";
import AuthenticationHeader from "../components/AuthenticationHeader";
import AuthenticationForm from "../components/AuthenticationForm";

const ForgotPassword = () : React.JSX.Element => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isSent, setIsSent] = useState(false);
  const auth = useContext(LMSContext);
  const isLoading = auth?.isLoading ?? false;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!forgotPasswordEmail || isLoading) return;

    setIsSent(false);
    auth?.setIsLoading(true);
    try {
      const { error } = await requestPasswordReset(forgotPasswordEmail);
      if (error) {
        auth?.setAuthError(error.message);
        return;
      }
      setIsSent(true);
    } catch (error) {
      auth?.setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to send a password reset link.",
      );
    } finally {
      auth?.setIsLoading(false);
    }
  };

  return (
    <AuthenticationLayout>
      <AuthenticationForm>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Mail className="w-5 h-5 text-primary" strokeWidth={1}/>
          </div>

          <AuthenticationHeader
            title="Forgot your password?"
            subtitle="No worries. Enter the email associated with your account and we'll send you a secure password reset link."
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input id="email" label="Email Address"
            type="email"
            placeholder="name@company.com"
            autoFocus
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              We&apos;ll send a password reset link to your inbox. If you don&apos;t see
              it, check your spam or junk folder.
            </p>
          </div>

          {isSent && (
            <p className="text-xs text-emerald-600">
              Reset link sent. Check your inbox to continue.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full py-5 flex justify-center items-center gap-3"
            type="submit"
            disabled={!forgotPasswordEmail || isLoading}
          >
            {isLoading && <Spinner />}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Remember your password?
          </p>

          <Link
            to="/signin"
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline mt-5"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </AuthenticationForm>
    </AuthenticationLayout>
  );
};

export default ForgotPassword;
