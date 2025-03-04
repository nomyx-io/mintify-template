import React from "react";

// This is a mock version of PrivateRoute that doesn't try to connect to web3
// It's used for demo pages that don't require authentication or web3 connections
function MockPrivateRoute({ children }) {
  return <>{children}</>;
}

export default MockPrivateRoute;
