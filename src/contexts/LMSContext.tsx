import { createContext, useCallback, useEffect, useState } from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import { showToast } from "@/components/ui/Toast";
import { useNavigate } from "react-router-dom";
import { getCurrentSession, resendVerificationEmail } from "@/shared/api/auth";
import { getProfile } from "@/shared/api/profiles";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/shared/types/database";

type ResendVerificationResult =
  | { success: true }
  | { success: false; error: unknown };

interface LMSContextValue {
  isAuthLoading: boolean;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  session: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
  userProfile: Tables<"profiles"> | null;
  setUserProfile: Dispatch<SetStateAction<Tables<"profiles"> | null>>;
  refreshProfile: () => Promise<void>;
  authError: string | null;
  setAuthError: Dispatch<SetStateAction<string | null>>;
  resendVerification: (email?: string) => Promise<ResendVerificationResult>;
}

const noopSetter: Dispatch<SetStateAction<boolean>> = () => undefined;
const noopSessionSetter: Dispatch<SetStateAction<Session | null>> = () =>
  undefined;
const noopProfileSetter: Dispatch<SetStateAction<Tables<"profiles"> | null>> = () =>
  undefined;
const noopAuthErrorSetter: Dispatch<SetStateAction<string | null>> = () =>
  undefined;

export const LMSContext = createContext<LMSContextValue>({
  isAuthLoading: true,
  isLoading: false,
  setIsLoading: noopSetter,
  session: null,
  setSession: noopSessionSetter,
  userProfile: null,
  setUserProfile: noopProfileSetter,
  refreshProfile: async () => undefined,
  authError: null,
  setAuthError: noopAuthErrorSetter,
  resendVerification: async () => ({ success: false, error: "no_provider" }),
});

function LMSProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Tables<"profiles"> | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setUserProfile(null);
      return;
    }
    try {
      const { data } = await getProfile(session.user.id);
      if (data) {
        setUserProfile(data);
      }
    } catch {
      // ignore
    }
  }, [session?.user.id]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function getSession() {
      try {
        const { data, error } = await getCurrentSession();
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (isMounted) setSession(data.session ?? null);
      } catch (err) {
        setAuthError(
          err instanceof Error
            ? err.message
            : "Unable to restore your session.",
        );
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session ?? null);
        if (event === "SIGNED_OUT") {
          setUserProfile(null);
          navigate("/");
        }
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (authError) {
      showToast({
        type: "error",
        title: "Authentication error",
        description: authError,
      });
    }
  }, [authError]);

  const resendVerification = async (
    email?: string,
  ): Promise<ResendVerificationResult> => {
    const target =
      email || localStorage.getItem("lumio_sign_up_email");
    if (!target) return { success: false, error: "no_email" };
    try {
      const { error } = await resendVerificationEmail(String(target));
      if (error) return { success: false, error };
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return (
    <LMSContext.Provider
      value={{
        isAuthLoading,
        isLoading,
        setIsLoading,
        session,
        setSession,
        userProfile,
        setUserProfile,
        refreshProfile,
        authError,
        resendVerification,
        setAuthError,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
}

export default LMSProvider;
