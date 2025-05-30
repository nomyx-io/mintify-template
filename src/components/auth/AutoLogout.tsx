import { useEffect, useState } from "react";

import { useSession, signOut } from "next-auth/react";

const AutoLogout = () => {
  const { data: session, status } = useSession();
  const [expirationTime, setExpirationTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Prevents early logout
  const [hasLoggedOut, setHasLoggedOut] = useState(false); // NEW: Prevents multiple logouts

  useEffect(() => {
    if (status === "loading") {
      console.log("Session is still loading... Waiting.");
      return;
    }

    if (!session?.expires) {
      console.warn("No session expiration found. Skipping logout timer.");
      return;
    }
    console.log("Session values", session);
    const expTime = new Date(session.expires).getTime();

    // Only update expiration time if it actually changes
    if (expTime !== expirationTime) {
      setExpirationTime(expTime);
      console.log(`AutoLogout initialized - Session expires at: ${new Date(expTime).toLocaleTimeString()}`);
    }

    // Ensure initialization only happens once per login
    if (!isInitialized) {
      setTimeout(() => {
        setIsInitialized(true);
      }, 5000); // 5-second grace period before enforcing logout
    }
  }, [session, status, expirationTime, isInitialized]);

  useEffect(() => {
    if (!expirationTime || status !== "authenticated" || !isInitialized || hasLoggedOut) return;

    const intervalId = setInterval(() => {
      const timeRemaining = expirationTime - Date.now();
      console.log(`Time remaining: ${Math.round(timeRemaining / 1000)}s`);

      if (timeRemaining <= 0) {
        console.log("Session expired! Clearing session and logging out...");
        clearInterval(intervalId); // Ensure logout only happens once

        // Clear session before calling signOut to prevent session refresh issues
        localStorage.clear(); // Clear any stored session data
        sessionStorage.clear();
        setHasLoggedOut(true); // Prevent multiple logouts
        signOut(); //**Trigger full logout & redirect**

        setTimeout(() => {
          window.location.href = "/login"; // Force a hard page refresh to ensure full logout
        }, 1000);
      }
    }, 1000); // Runs every second

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [expirationTime, status, isInitialized, hasLoggedOut]);
  return null;
};

export default AutoLogout;
