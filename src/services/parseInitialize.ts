import Parse from "parse";

// Initialize Parse
const parseInitialize = () => {
  const appId = process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID;
  const jsKey = process.env.NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY;
  const serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL;

  if (!appId || !jsKey || !serverURL) {
    console.error("ParseClient initialization failed: Missing environment variables.");
    return;
  }

  Parse.initialize(appId, jsKey);
  Parse.serverURL = `${serverURL}/parse`;

  // Middleware: Automatically use the session token (JWT) for all requests
  if (typeof window !== "undefined") {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      Parse.User.become(sessionToken).catch((error) => {
        console.error("Error becoming user with sessionToken:", error);
      });
    }
  }
};

export default parseInitialize;
