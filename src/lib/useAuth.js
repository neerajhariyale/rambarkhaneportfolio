import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// session: undefined = still loading, null = signed out, object = signed in.
export function useAuth() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}
