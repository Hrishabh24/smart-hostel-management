import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Not logged in -> redirect to public login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If an allowedRole is specified, enforce it
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
