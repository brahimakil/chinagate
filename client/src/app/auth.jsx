/**
 * Title: Write a program using JavaScript on Auth
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { usePersistLoginQuery } from "@/services/auth/authApi";
import { addUser } from "@/features/auth/authSlice";
import { toast } from "react-hot-toast";
import NoSSR from "@/components/shared/NoSSR";

const AuthContent = ({ children }) => {
  const dispatch = useDispatch();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setHasToken(!!token);
  }, []);

  const { data: userData, error: userError } = usePersistLoginQuery(undefined, {
    skip: !hasToken,
  });

  const user = useMemo(() => userData?.data || {}, [userData]);

  useEffect(() => {
    if (userData && !userError) {
      toast.success("Welcome back!", { id: "auth" });
      dispatch(addUser(user));
    }

    if (userError?.data && hasToken) {
      if (userError.status === 401) {
        toast.error("Your session has expired. Please sign in again.", { id: "auth" });
        localStorage.removeItem("accessToken");
        setHasToken(false);
      } else {
        toast.error("Authentication error. Please try again.", { id: "auth" });
      }
    }
  }, [userData, userError, dispatch, user, hasToken]);

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
