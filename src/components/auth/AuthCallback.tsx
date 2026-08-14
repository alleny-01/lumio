import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { exchangeAuthCodeForSession, getCurrentSession } from "@/shared/api/auth";
import { supabase } from "@/lib/supabase/client";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { LMSContext } from "@/contexts/LMSContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setSession, setAuthError } = useContext(LMSContext);

  useEffect(() => {
    let isMounted = true;
    let hasHandledAuth = false;

    const navigateToDashboard = (session: Session) => {
      if (!isMounted || hasHandledAuth) return;
      hasHandledAuth = true;
      setSession(session);
      navigate("/dashboard", { replace: true });
    };

    const navigateToSignin = (errorMsg?: string) => {
      if (!isMounted || hasHandledAuth) return;
      hasHandledAuth = true;
      if (errorMsg) setAuthError(errorMsg);
      navigate("/signin", { replace: true });
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && session) {
          navigateToDashboard(session);
        }
      }
    );

    const finishSignIn = async () => {
      try {
        const { data: sessionData } = await getCurrentSession();
        if (sessionData.session) {
          navigateToDashboard(sessionData.session);
          return;
        }
      } catch (error) {
        console.warn("Initial session check failed:", error);
      }

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const errorDescription = searchParams.get("error_description");

      if (errorDescription) {
        navigateToSignin(errorDescription);
        return;
      }

      if (code) {
        try {
          const { error } = await exchangeAuthCodeForSession(code);
          if (error) {
            const { data: checkData } = await getCurrentSession();
            if (checkData.session) {
              navigateToDashboard(checkData.session);
              return;
            }
            navigateToSignin(error.message);
            return;
          }

          const { data: finalSessionData } = await getCurrentSession();
          if (finalSessionData.session) {
            navigateToDashboard(finalSessionData.session);
            return;
          }
        } catch (error) {
          console.warn("Auth callback exchange failed:", error);
        }
      }

      const timerId = setTimeout(async () => {
        const { data: timeoutData } = await getCurrentSession();
        if (timeoutData.session) {
          navigateToDashboard(timeoutData.session);
        } else {
          navigateToSignin();
        }
      }, 1200);

      return () => clearTimeout(timerId);
    };

    finishSignIn();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, setSession, setAuthError]);

  return <PageSpinner />;
}
