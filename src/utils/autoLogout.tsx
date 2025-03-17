import { useEffect, useState, useRef, useContext } from "react";

import { useDisconnect, useAccount } from "wagmi";

import { UserContext } from "../context/UserContext";

const AutoLogout = () => {
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const { user } = useContext(UserContext);

  const [waitingForToken, setWaitingForToken] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitForTokenRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggedOut = useRef(false);

  const isUserLoggedIn = isConnected || user || localStorage.getItem("sessionToken"); // Check if user is logged in

  useEffect(() => {
    if (!isUserLoggedIn) {
      console.log("🔒 User is not logged in. AutoLogout disabled.");
      return;
    }

    console.log("✅ User detected. AutoLogout enabled.");
    isLoggedOut.current = false; // Reset logout flag when user logs in

    const tokenExpString = localStorage.getItem("tokenExpiration");

    if (tokenExpString) {
      console.log("✅ TokenExpiration detected. Starting AutoLogout.");
      setWaitingForToken(false);
      checkExpiration();
    } else {
      console.log("⏳ Waiting for tokenExpiration...");
      waitForTokenRef.current = setInterval(() => {
        if (isLoggedOut.current) return; // Stop checking if logged out

        const tokenExpString = localStorage.getItem("tokenExpiration");
        if (tokenExpString) {
          console.log("✅ TokenExpiration detected. Starting AutoLogout.");
          clearInterval(waitForTokenRef.current!);
          waitForTokenRef.current = null;
          setWaitingForToken(false);
          checkExpiration();
        }
      }, 500);
    }

    return () => {
      if (waitForTokenRef.current) {
        clearInterval(waitForTokenRef.current);
        waitForTokenRef.current = null;
      }
    };
  }, [isUserLoggedIn]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (!isUserLoggedIn || isLoggedOut.current) return; // Stop execution if logged out

      const tokenExpString = localStorage.getItem("tokenExpiration");
      if (tokenExpString) {
        console.log("🔄 TokenExpiration updated. Restarting AutoLogout.");
        setWaitingForToken(false);
        checkExpiration();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isUserLoggedIn]);

  const checkExpiration = () => {
    if (isLoggedOut.current) {
      console.warn("⚠️ User has logged out. Stopping AutoLogout.");
      return; // Stop execution
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const tokenExpString = localStorage.getItem("tokenExpiration");

    if (!tokenExpString) {
      console.warn("⚠️ No token expiration found. Skipping logout timer.");
      return;
    }

    const tokenExp = Number(tokenExpString);
    if (isNaN(tokenExp)) {
      console.error("🚨 Invalid tokenExpiration format! Clearing session...");
      handleLogout();
      return;
    }

    const timeRemaining = tokenExp - Date.now();
    console.log(`⏳ Time remaining: ${Math.max(Math.round(timeRemaining / 1000), 0)}s`);

    if (timeRemaining <= 1000) {
      handleLogout();
    } else {
      timeoutRef.current = setTimeout(() => {
        if (!isLoggedOut.current) {
          checkExpiration();
        }
      }, 1000);
    }
  };

  const handleLogout = () => {
    if (isLoggedOut.current) {
      console.warn("🚫 Logout already triggered. Skipping...");
      return;
    }

    console.log("🚨 Logging out...");
    isLoggedOut.current = true; // Set flag to prevent future executions
    disconnect();

    // **Remove tokenExpiration so checkExpiration() stops running**
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("tokenExpiration");

    // **Fully cleanup all timeouts/intervals** to stop countdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (waitForTokenRef.current) {
      clearInterval(waitForTokenRef.current);
      waitForTokenRef.current = null;
    }

    setTimeout(() => {
      console.log("🔄 Redirecting to /login...");
      window.location.href = "/login";
    }, 500);
  };

  if (waitingForToken) {
    console.log("⏳ Waiting for tokenExpiration...");
    return null;
  }

  return null;
};

export default AutoLogout;
