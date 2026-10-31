/**
 * Title: Write a program using JavaScript on Auth
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { usePersistLoginQuery } from "@/services/auth/authApi";
import { addUser } from "@/features/auth/authSlice";
import { toast } from "react-hot-toast";
import NoSSR from "@/components/shared/NoSSR";

const AuthContent = ({ children }) => {
  const dispatch = useDispatch();
  const [hasToken, setHasToken] = useState(false);

  // A failed /me is NOT proof the session is over: cold starts, CORS hiccups
  // and Vercel challenges all look like errors. Retry before signing out.
  const attempts = useRef(0);
  const welcomed = useRef(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("accessToken"));
  }, []);

  const {
    data: userData,
    error: userError,
    refetch,
  } = usePersistLoginQuery(undefined, {
    skip: !hasToken,
  });

  const user = useMemo(() => userData?.data || {}, [userData]);

  useEffect(() => {
    if (userData && !userError) {
      attempts.current = 0;
      if (!welcomed.current) {
        welcomed.current = true;
        toast.success("Welcome back!", { id: "auth" });
      }
      dispatch(addUser(user));
    }
  }, [userData, userError, dispatch, user]);

  useEffect(() => {
    if (!userError || !hasToken) return undefined;

    const status = userError.status;
    const code = userError.data?.code;
    const token = localStorage.getItem("accessToken");

    // No response body at all = network / CORS / firewall challenge.
    // The token is still valid, so never destroy the session over this.
    const isNetworkFailure =
      !userError.data ||
      status === "FETCH_ERROR" ||
      status === "TIMEOUT_ERROR" ||
      status === "PARSING_ERROR";

    if (isNetworkFailure || (typeof status === "number" && status >= 500)) {
      if (attempts.current < 2) {
        attempts.current += 1;
        const id = setTimeout(() => refetch(), 1200 * attempts.current);
        return () => clearTimeout(id);
      }
      return undefined;
    }

    if (status === 401) {
      // Only sign out when the API says the credential itself is dead.
      const credentialIsDead =
        code === "TOKEN_EXPIRED" ||
        code === "TOKEN_INVALID" ||
        code === "NO_TOKEN" ||
        !token;

      if (!credentialIsDead && attempts.current < 2) {
        attempts.current += 1;
        const id = setTimeout(() => refetch(), 1200 * attempts.current);
        return () => clearTimeout(id);
      }

      toast.error("Your session has expired. Please sign in again.", {
        id: "auth",
      });
      localStorage.removeItem("accessToken");
      setHasToken(false);
      return undefined;
    }

    if (attempts.current < 2) {
      attempts.current += 1;
      const id = setTimeout(() => refetch(), 1200 * attempts.current);
      return () => clearTimeout(id);
    }

    toast.error("Authentication error. Please try again.", { id: "auth" });
    return undefined;
  }, [userError, hasToken, refetch]);

  return <>{children}</>;
};

const Auth = ({ children }) => {
  return (
    <NoSSR fallback={<>{children}</>}>
      <AuthContent>{children}</AuthContent>
    </NoSSR>
  );
};

export default Auth;
