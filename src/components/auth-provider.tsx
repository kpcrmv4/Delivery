"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          useAuthStore.setState({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          // Re-initialize to fetch profile
          initialize();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  return <>{children}</>;
}
