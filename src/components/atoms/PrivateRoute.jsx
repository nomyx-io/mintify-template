import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import { useAccount, useDisconnect } from "wagmi";

function PrivateRoute({ children, onConnect, role, forceLogout, handleForecLogout, isConnected }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { address, isConnecting } = useAccount();
  const [history, setHistory] = useState([]);

  const handleDisconnect = () => {
    disconnect();
    handleForecLogout();
  };

  useEffect(() => {
    if (!isConnected && !address) {
      router.push("/login");
    }

    if (isConnected && role.length == 0) {
      onConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, role]);

  useEffect(() => {
    if (isConnected && role.length > 0) {
      debugger;
      const redirectTarget = history[1] == "/" || history[1] == "/login" ? "/home" : history[1] || history[0];
      if (redirectTarget) {
        router.push(redirectTarget);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isConnected]);

  useEffect(() => {
    forceLogout && handleDisconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceLogout]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      setHistory((prevHistory) => {
        const newHistory = [url, ...prevHistory].slice(0, 3);
        return newHistory;
      });
    };

    handleRouteChange(router.asPath);
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isConnected && role.length == 0 ? (
    <div className="z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center"></div>
  ) : (
    children
  );
}

export default PrivateRoute;
