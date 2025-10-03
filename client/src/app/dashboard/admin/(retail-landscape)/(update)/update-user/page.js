/**
 * Title: Admin User Update Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useUpdateUserMutation, useGetUserQuery } from "@/services/user/userApi";
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Update User</h1>
        </div>
        {userId && <UpdateUser userId={userId} />}
      </section>
    </Dashboard>
  );
};

function UpdateUser({ userId }) {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+961");
  const router = useRouter();

  const [updateUser, { isLoading, data, error }] = useUpdateUserMutation();
  const { data: userData, isLoading: fetchingUser } = useGetUserQuery(userId);
  
  const user = useMemo(() => userData?.data || {}, [userData]);

  // Load existing user data
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setUserName(user.name || "");
      setUserEmail(user.email || "");
      setSelectedRole(user.role || "buyer");
      
      if (user.phone) {
        // Extract country code and phone number
        const phoneMatch = user.phone.match(/^(\+\d{1,4})(.+)$/);
        if (phoneMatch) {
          setCountryCode(phoneMatch[1]);
          setUserPhone(phoneMatch[2]);
        } else {
          setUserPhone(user.phone);
        }
      }
      
      if (user.avatar?.url) {
        setAvatarPreview(user.avatar.url);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Updating User...", { id: "updateUser" });
    }

    if (data) {
      toast.success("User updated successfully!", { id: "updateUser" });
      setTimeout(() => {
        router.push("/dashboard/admin/list-users");
      }, 1000);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "updateUser" });
    }
  }, [isLoading, data, error, router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function handleUpdateUser(e) {
    e.preventDefault();

    const formData = new FormData();
    
    // Always include these fields
    if (avatar) {
      formData.append("avatar", avatar);
    }
    formData.append("name", userName);
    formData.append("email", userEmail);
    formData.append("role", selectedRole);

    // Only include phone for non-admin users
    if (selectedRole !== "admin" && userPhone) {
      formData.append("phone", `${countryCode}${userPhone}`);
    }

    // Don't include password in update unless provided
    const passwordField = e.target.password?.value;
    if (passwordField && passwordField.trim() !== "") {
      formData.append("password", passwordField);
    }

    updateUser({ id: userId, data: formData });
  }

  if (fetchingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading user...</div>
      </div>
    );
  }

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleUpdateUser}>
      {/* Avatar */}
      <div className="w-fit flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">User Avatar (Optional)</h3>
        
        {avatarPreview ? (
          <div className="relative w-fit">
            <Image
              src={avatarPreview}
              alt="User avatar preview"
              width={120}
              height={120}
              className="w-30 h-30 object-cover rounded-full border"
              priority={true}
            />
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(null);
                setAvatar(null);
                const fileInput = document.getElementById('avatar');
                if (fileInput) fileInput.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          <label htmlFor="avatar" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
            <span className="text-sm font-medium">Choose Avatar</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-40 h-40 flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-600 text-center">Click to upload</span>
              <p className="text-xs text-gray-500 text-center">PNG, JPG, JPEG</p>
            </div>
            <input
              type="file"
              name="avatar"
              id="avatar"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg, .jpeg, .png"
              onChange={handleAvatarChange}
            />
          </label>
        )}
      </div>

      {/* User Role Selection */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">User Role</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Option */}
          <label className={`
            flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selectedRole === 'buyer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}>
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={selectedRole === 'buyer'}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedRole === 'buyer' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
              `}>
                {selectedRole === 'buyer' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">👤 Regular User (Buyer)</div>
                <div className="text-sm text-gray-600">Can browse and purchase products</div>
                <div className="text-xs text-blue-600 mt-1">• Requires phone number</div>
              </div>
            </div>
          </label>

          {/* Admin Option */}
          <label className={`
            flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selectedRole === 'admin' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          `}>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={selectedRole === 'admin'}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedRole === 'admin' ? 'border-red-500 bg-red-500' : 'border-gray-300'}
              `}>
                {selectedRole === 'admin' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">👑 Administrator</div>
                <div className="text-sm text-gray-600">Full system access and management</div>
                <div className="text-xs text-red-600 mt-1">• No phone number required</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* User Information */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">User Information</h3>
        
        <label htmlFor="name" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Full Name*</span>
          <input
            type="text"
            name="name"
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="i.e. John Doe"
            required
          />
        </label>

        <label htmlFor="email" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Email Address*</span>
          <input
            type="email"
            name="email"
            id="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="i.e. john@example.com"
            required
          />
        </label>

        {/* Phone Number - Only for non-admin users */}
        {selectedRole !== "admin" && (
          <label htmlFor="phone" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Phone Number*</span>
            <div className="flex gap-x-2">
              <select 
                name="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-32 px-2 py-2 border rounded text-sm"
              >
                <option value="+961">🇱🇧 +961</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+39">🇮🇹 +39</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
              </select>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter phone number"
                className="flex-1"
                required
              />
            </div>
            <small className="text-gray-600">
              Phone number is required for regular users
            </small>
          </label>
        )}

        {/* Show info message for admin users */}
        {selectedRole === "admin" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-800">
                <strong>Admin users</strong> don't require a phone number.
              </span>
            </div>
          </div>
        )}

        <label htmlFor="password" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">New Password (Optional)</span>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Leave blank to keep current password"
          />
          <small className="text-gray-600">
            Only fill this if you want to change the password. Leave blank to keep the current password.
          </small>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? "Updating User..." : `Update ${selectedRole === 'admin' ? 'Admin' : 'User'}`}
      </button>
    </form>
  );
}

export default Page;
