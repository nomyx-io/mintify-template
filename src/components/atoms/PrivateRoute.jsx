import { useEffect, useRef } from "react";

import { Spin } from "antd";
import { useRouter } from "next/router";
import { useAccount, useDisconnect } from "wagmi";

function PrivateRoute({ children, onConnect, role, forceLogout, handleForecLogout, isConnected }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { address, isConnecting } = useAccount();
  const redirectingRef = useRef(false);

  const handleDisconnect = () => {
    disconnect();
    handleForecLogout();
  };

  // Handle authentication and routing
  useEffect(() => {
    const allowedRoutes = ["/login", "/forgot-password", "/reset-password/[token]"];
    const isAllowedRoute = allowedRoutes.includes(router.pathname) || router.pathname.startsWith("/reset-password/");

    // Redirect to login if not authenticated and not on allowed routes
    if (!isConnected && !address && !isAllowedRoute && !redirectingRef.current) {
      redirectingRef.current = true;
      router.push("/login").finally(() => {
        redirectingRef.current = false;
      });
    }

    // Trigger wallet connection if connected but no role
    if (isConnected && role.length === 0) {
      onConnect();
    }
  }, [address, isConnected, role, router, onConnect]);

  // Handle force logout
  useEffect(() => {
    if (forceLogout) {
      handleDisconnect();
    }
  }, [forceLogout]);

  // Show loading state when connected but waiting for role
  if (isConnected && role.length === 0) {
    return (
      <div className="z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return children;
}

export default PrivateRoute;
