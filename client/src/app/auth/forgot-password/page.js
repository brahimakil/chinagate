/**
 * Title: Write a program using JavaScript on Page
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 08, November 2023
 */

"use client";

import Spinner from "@/components/shared/Spinner";
import { useForgotPasswordMutation } from "@/services/auth/authApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [forgotPassword, { isLoading, data, error }] = useForgotPasswordMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Sending reset link...", { id: "forgot-password" });
    }

    if (data) {
      toast.success(data?.description, { id: "forgot-password" });
      setEmailSent(true);
    }
    if (error?.data) {
      toast.error(error?.data?.description, { id: "forgot-password" });
    }
  }, [data, error, isLoading]);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    forgotPassword({ email: e.target.email.value });
  };

  if (emailSent) {
    return (
      <section className="w-screen h-screen flex justify-center items-center px-4">
        <div className="max-w-md w-full flex flex-col gap-y-4 border p-8 rounded-primary text-center">
          <h2 className="text-xl font-semibold">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to your email address. 
            Please check your inbox and click the link to reset your password.
          </p>
          <p className="text-sm text-gray-500">
            The link will expire in 1 hour.
          </p>
          <Link 
            href="/auth/signin" 
            className="text-blue-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </section>
    );
  }

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
        <form
          className="w-full flex flex-col gap-y-4"
          onSubmit={handleForgotPassword}
        >
          <label htmlFor="email" className="flex flex-col gap-y-1">
            <span className="text-sm">Enter Your Email</span>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="i.e. example@gmail.com"
              className=""
              required
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="py-2 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow disabled:bg-gray-200 disabled:border-gray-200 disabled:text-black/50 disabled:cursor-not-allowed flex flex-row justify-center items-center text-sm"
          >
            {isLoading ? <Spinner /> : "Send Reset Link"}
          </button>
        </form>
        <div className="flex flex-row justify-center items-center gap-x-2 text-xs">
          <Link href="/auth/signin" className="">
            Back to Sign In
          </Link>
          <span className="h-4 border-l" />
          <Link href="/auth/signup" className="">
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
