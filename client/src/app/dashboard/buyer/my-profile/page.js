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
 * Date: 14, January 2024
 */

"use client";

import Inform from "@/components/icons/Inform";
import Trash from "@/components/icons/Trash";
import Modal from "@/components/shared/Modal";
import Dashboard from "@/components/shared/layouts/Dashboard";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/services/user/userApi";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const Page = () => {
  const userInfo = useSelector((state) => state.auth.user);
  const [user, setUser] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updateUserInformation, { isLoading, data, error }] =
    useUpdateUserMutation();

  useEffect(() => {
    setUser(userInfo);

    if (isLoading) {
      toast.loading("Updating user...", { id: "updateUserInformation" });
    }

    if (data) {
      toast.success(data?.description, { id: "updateUserInformation" });
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "updateUserInformation" });
    }
  }, [userInfo, isLoading, data, error]);

  const handleAvatarPreview = (e) => {
    setAvatar(e.target.files[0]);

    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function handleEditProfile(event) {
    event.preventDefault();

    const updatedUser = {
      name: event.target.name.value,
      email: event.target.email.value,
      phone: event.target.phone.value,
      address: event.target.address.value,
      role: user.role, // Use existing role from user data
    };

    // Add 'status' property for seller
    if (updatedUser.role === "seller") {
      updatedUser.status = user.status || "inactive";
    }

    // If avatarPreview is available, add it to the formData
    const formData = new FormData();
    Object.entries(updatedUser).forEach(([key, value]) =>
      formData.append(key, value)
    );

    // Only include password if provided
    const passwordField = event.target.password?.value;
    if (passwordField && passwordField.trim() !== "") {
      formData.append("password", passwordField);
    }

    if (avatarPreview !== null) {
      formData.append("avatar", avatar);
    }

    updateUserInformation(formData);
  }

  return (
    <Dashboard>
      <section className="flex flex-col gap-y-4">
        <form
          action=""
          className="w-full flex flex-col gap-y-4"
          onSubmit={handleEditProfile}
        >
          {/* avatar */}
          <div className="w-fit flex flex-col gap-y-4 p-4 border rounded">
            <Image
              src={avatarPreview || user?.avatar?.url}
              alt={user?.avatar?.public_id || "avatar"}
              width={96}
              height={96}
              className="w-full h-24 object-cover rounded"
            />

            <label
              htmlFor="avatar"
              className="w-full flex flex-col gap-y-1 relative"
            >
              <span className="text-sm cursor-pointer">Choose Avatar</span>
              <input
                type="file"
                name="avatar"
                id="avatar"
                className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer z-50"
                accept=".jpg, .jpeg, .png"
                multiple={false}
                onChange={handleAvatarPreview}
              />
            </label>
          </div>

          {/* name & email */}
          <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
            {/* name */}
            <label htmlFor="name" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">Name</span>
              <input
                type="text"
                name="name"
                id="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </label>

            {/* email */}
            <label htmlFor="email" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">Email</span>
              <input
                type="email"
                name="email"
                id="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </label>
          </div>

          {/* phone, role & address */}
          <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
            {/* phone */}
            <label htmlFor="phone" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">Phone</span>
              <input
                type="text"
                name="phone"
                id="phone"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </label>

            {/* address */}
            <label htmlFor="address" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">Address</span>
              <input
                type="text"
                name="address"
                id="address"
                value={user.address}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
              />
            </label>

            {/* role - REMOVED, all users are buyers */}

          </div>

          {/* password section */}
          <div className="w-full flex flex-col gap-y-4 p-4 border rounded bg-yellow-50">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Change Password (Optional)</p>
                <p className="text-xs text-yellow-700 mt-1">Leave blank to keep your current password</p>
              </div>
            </div>
            
            <label htmlFor="password" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">New Password</span>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter new password (optional)"
              />
            </label>
          </div>

          {/* submit button */}
          <input
            type="submit"
            value="Update Profile"
            className="py-2 border border-black rounded bg-black hover:bg-black/90 text-white transition-colors drop-shadow cursor-pointer text-sm"
          />
        </form>

        <DeleteUser />
      </section>
    </Dashboard>
  );
};

function DeleteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [deleteUser, { isLoading, data, error }] = useDeleteUserMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Deleting User...", { id: "deleteUser" });
    }

    if (data) {
      toast.success(data?.description, { id: "deleteUser" });
    }

    if (error) {
      toast.error(error?.data?.description, { id: "deleteUser" });
    }
  }, [isLoading, data, error]);

  return (
    <>
      <button
        type="button"
        className="py-2 border border-black rounded bg-red-900 hover:bg-red-900/90 text-white transition-colors drop-shadow cursor-pointer text-sm"
        onClick={() => setIsOpen(true)}
      >
        Delete User
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="p-4 lg:w-1/5"
        >
          <article className="flex flex-col gap-y-4">
            <p className="text-xs bg-yellow-500/50 text-black px-2 py-0.5 rounded-sm text-center">
              Account will be deleted permanently!
            </p>
            <div className="flex flex-col gap-y-2">
              <h1 className="text-xl">Are you sure?</h1>
              <p className="text-sm flex flex-col gap-y-2">
                You are about to lost following:
                <p className="flex flex-col gap-y-1.5">
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> {user?.cart?.length} products from cart
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> {user?.favorites?.length} products from favorites
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> {user?.purchases?.length} purchases records
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> {user?.products?.length} products all time records
                  </span>
                </p>
              </p>
            </div>
            <div className="flex flex-row gap-x-4">
              <button
                className="text-white bg-slate-500 px-3 py-1.5 rounded text-sm"
                onClick={() => setIsOpen(false)}
              >
                No, cancel
              </button>
              <button
                className="flex flex-row gap-x-2 items-center text-white bg-red-500 px-3 py-1.5 rounded text-sm"
                onClick={() => deleteUser(user?._id)}
              >
                <Trash /> Yes, delete
              </button>
            </div>
          </article>
        </Modal>
      )}
    </>
  );
}

export default Page;
