/**
 * Title: Write a program using JavaScript on Auth
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import Signup from "@/components/icons/Signup";
import Link from "next/link";
import React, { useState } from "react";
import OutsideClick from "../OutsideClick";
import User from "@/components/icons/User";
import Signin from "@/components/icons/Signin";
import ForgotPassword from "@/components/icons/ForgotPassword";
import Logout from "@/components/icons/Logout";
import { useSelector } from "react-redux";
import Image from "next/image";
import NoSSR from "../NoSSR";

const AuthContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    // Redirect to store instead of just reloading
    window.location.href = "/";
  };

  return (
    <>
      <button
        className="p-2 rounded-secondary hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-6 w-6" />
      </button>
      {isOpen && (
        <OutsideClick
          onOutsideClick={() => setIsOpen(false)}
          className="absolute top-full right-0 w-80 h-fit bg-white border rounded p-2 flex flex-col gap-y-2.5 z-50"
        >
          {Object.keys(user).length === 0 ? (
            <>
              <Link
                href="/auth/signup"
                className="w-full flex flex-row items-start gap-x-2 p-2 border border-transparent hover:border-black rounded"
                onClick={() => setIsOpen(false)}
              >
                <span className="bg-sky-500/5 p-1 rounded">
                  <Signup />
                </span>
                <article className="whitespace-normal">
                  <h2 className="text-sm">Sign Up</h2>
                  <p className="text-xs">Register as a new user</p>
                </article>
              </Link>
              <Link
                href="/auth/signin"
                className="w-full flex flex-row items-start gap-x-2 p-2 border border-transparent hover:border-black rounded"
                onClick={() => setIsOpen(false)}
              >
                <span className="bg-sky-500/5 p-1 rounded">
                  <Signin />
                </span>
                <article className="whitespace-normal">
                  <h2 className="text-sm">Sign In</h2>
                  <p className="text-xs">Login as an existing user</p>
                </article>
              </Link>
              <Link
                href="/auth/forgot-password"
                className="w-full flex flex-row items-start gap-x-2 p-2 border border-transparent hover:border-black rounded"
                onClick={() => setIsOpen(false)}
              >
                <span className="bg-sky-500/5 p-1 rounded">
                  <ForgotPassword />
                </span>
                <article className="whitespace-normal">
                  <h2 className="text-sm">Forgot Password</h2>
                  <p className="text-xs">Reset your account credentials</p>
                </article>
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-row gap-x-2 p-4">
                <Image
                  src={user?.avatar?.url || "https://placehold.co/50x50.png"}
                  alt={user?.avatar?.public_id || "avatar"}
                  height={50}
                  width={50}
                  className="rounded object-cover h-[50px] w-[50px]"
                />
                <article className="flex flex-col">
                  <h2 className="line-clamp-1">{user?.name || "User"}</h2>
                  <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {user?.email || ""}
                  </p>
                  <p className="flex flex-row gap-x-2 mt-1.5">
                    <span className="px-2 border border-purple-900 text-purple-900 bg-purple-50 rounded-primary text-xs w-fit">
                      {user?.role || "buyer"}
                    </span>
                    {user?.status === "inactive" && (
                      <span className="bg-red-50 border border-red-900 px-2 rounded-secondary text-red-900 text-xs lowercase w-fit">
                        in review
                      </span>
                    )}
                  </p>
                </article>
              </div>
              <hr />
              <div className="w-full flex flex-row items-start gap-x-2 p-2 border border-transparent hover:border-black rounded cursor-pointer">
                <span className="bg-sky-500/5 p-1 rounded">
                  <Logout />
                </span>
                <article
                  className="whitespace-nowrap"
                  onClick={handleLogout}
                >
                  <h2 className="text-sm">Logout</h2>
                  <p className="text-xs">Clear your current activities</p>
                </article>
              </div>
            </div>
          )}
        </OutsideClick>
      )}
    </>
  );
};

const Auth = () => {
  return (
    <NoSSR 
      fallback={
        <button className="p-2 rounded-secondary hover:bg-slate-100 transition-colors">
          <User className="h-6 w-6" />
        </button>
      }
    >
      <AuthContent />
    </NoSSR>
  );
};

export default Auth;