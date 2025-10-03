"use client";

import Spinner from "@/components/shared/Spinner";
import { useResetPasswordMutation } from "@/services/auth/authApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [resetPassword, { isLoading, data, error }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Resetting password...", { id: "reset-password" });
    }

    if (data) {
      toast.success(data?.description, { id: "reset-password" });
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
    }
    if (error?.data) {
      toast.error(error?.data?.description, { id: "reset-password" });
    }
  }, [data, error, isLoading, router]);

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPassword({ token, password });
  };

  return (
    <section className="w-screen h-screen flex justify-center items-center px-4">
      <div className="max-w-md w-full flex flex-col gap-y-4 border p-8 rounded-primary">
        <div className="flex flex-row items-center gap-x-2">
          <hr className="w-full" />
          <Image
            src="/logo.png"
            alt="logo"
            width={141}
            height={40}
            className="max-w-full cursor-pointer"
            onClick={() => router.push("/")}
          />
          <hr className="w-full" />
        </div>
        <h2 className="text-xl font-semibold text-center">Reset Password</h2>
        <form
          className="w-full flex flex-col gap-y-4"
          onSubmit={handleResetPassword}
        >
          <label htmlFor="password" className="flex flex-col gap-y-1">
            <span className="text-sm">New Password</span>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter new password"
              className=""
              required
            />
          </label>
          <label htmlFor="confirmPassword" className="flex flex-col gap-y-1">
            <span className="text-sm">Confirm New Password</span>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm new password"
              className=""
              required
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="py-2 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow disabled:bg-gray-200 disabled:border-gray-200 disabled:text-black/50 disabled:cursor-not-allowed flex flex-row justify-center items-center text-sm"
          >
            {isLoading ? <Spinner /> : "Reset Password"}
          </button>
        </form>
        <div className="flex flex-row justify-center items-center gap-x-2 text-xs">
          <Link href="/auth/signin" className="">
            Back to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
