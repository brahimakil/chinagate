/**
 * Title: Admin Brand Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useAddBrandMutation } from "@/services/brand/brandApi";
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Add this import


const Page = () => {
  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Add New Brand</h1>
        </div>
        <AddBrand />
      </section>
    </Dashboard>
  );
};

function AddBrand() {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [keynotes, setKeynotes] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [addBrand, { isLoading, data, error }] = useAddBrandMutation();
  const router = useRouter(); // Add this line


  useEffect(() => {
    if (isLoading) {
      toast.loading("Adding Brand...", { id: "addBrand" });
    }

    if (data) {
      toast.success(data?.description, { id: "addBrand" });
      
      // Reset form state
      setThumbnailPreview(null);
      setThumbnail(null);
      setKeynotes([""]);
      setTags([""]);
      
      setTimeout(() => {
        router.push("/dashboard/admin/list-brands");
      }, 1000);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "addBrand" });
    }
  }, [isLoading, data, error, router]); // Add router to dependencies

  const handleThumbnailPreview = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPG, PNG, WEBP)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setThumbnail(file); // Store the actual file
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result); // This is just for preview
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const handleAddKeynote = () => {
    setKeynotes([...keynotes, ""]);
  };

  const handleRemoveKeynote = (index) => {
    const updatedKeynotes = [...keynotes];
    updatedKeynotes.splice(index, 1);
    setKeynotes(updatedKeynotes);
  };

  const handleKeynoteChange = (index, value) => {
    const updatedKeynotes = [...keynotes];
    updatedKeynotes[index] = value;
    setKeynotes(updatedKeynotes);
  };

  const handleAddTag = () => {
    setTags([...tags, ""]);
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const handleTagChange = (index, value) => {
    const updatedTags = [...tags];
    updatedTags[index] = value;
    setTags(updatedTags);
  };

  function handleAddBrand(e) {
    e.preventDefault();

    if (!thumbnail || !thumbnailPreview) {
      toast.error("Please select a brand logo", { id: "addBrand" });
      return;
    }

    const formData = new FormData();
    
    formData.append("logo", thumbnail);
    formData.append("keynotes", JSON.stringify(keynotes.filter(note => note.trim() !== "")));
    formData.append("tags", JSON.stringify(tags.filter(tag => tag.trim() !== "")));
    formData.append("title", e.target.title.value);
    formData.append("description", e.target.description.value);

    addBrand(formData);

    // Don't reset form here - let useEffect handle it after success
  }

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleAddBrand}>
      {/* thumbnail */}
      <div className="w-fit flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Brand Logo</h3>
        
        {thumbnailPreview ? (
          // Show only the preview with X button when image is selected
          <div className="relative w-fit">
            <Image
              src={thumbnailPreview}
              alt="Brand logo preview"
              width={150}
              height={150}
              className="w-40 h-40 object-cover rounded-lg border"
              priority={true}
            />
            <button
              type="button"
              onClick={() => {
                setThumbnailPreview(null);
                setThumbnail(null);
                // Reset the file input
                const fileInput = document.getElementById('logo');
                if (fileInput) fileInput.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          // Show upload placeholder only when no image is selected
          <label htmlFor="logo" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
            <span className="text-sm font-medium">Brand Logo*</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-40 h-40 flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-600 text-center">Click to upload</span>
              <p className="text-xs text-gray-500 text-center">PNG, JPG, JPEG</p>
            </div>
            <input
              type="file"
              name="logo"
              id="logo"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg, .jpeg, .png, .webp"
              onChange={handleThumbnailPreview}
              required
            />
          </label>
        )}
      </div>

      {/* title & description */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Brand Information</h3>
        
        <label htmlFor="title" className="w-full flex flex-col gap-y-1">
          <span className="text-sm font-medium">Brand Name*</span>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="e.g., Nike, Apple, Samsung"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </label>

        <label htmlFor="description" className="w-full flex flex-col gap-y-1">
          <span className="text-sm font-medium">Brand Description*</span>
          <textarea
            name="description"
            id="description"
            rows="4"
            placeholder="Describe the brand, its values, and what makes it unique..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          ></textarea>
        </label>
      </div>

      {/* keynotes */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Brand Features</h3>
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleAddKeynote}
          >
            Add Feature
          </button>
        </div>

        <div className="space-y-2">
          {keynotes.map((keynote, index) => (
            <div key={index} className="flex flex-row gap-x-2 items-center">
              <input
                type="text"
                value={keynote}
                onChange={(e) => handleKeynoteChange(index, e.target.value)}
                placeholder={`Feature ${index + 1} (e.g., Premium Quality, Fast Delivery)`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {keynotes.length > 1 && (
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => handleRemoveKeynote(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* tags */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Brand Tags</h3>
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleAddTag}
          >
            Add Tag
          </button>
        </div>

        <div className="space-y-2">
          {tags.map((tag, index) => (
            <div key={index} className="flex flex-row gap-x-2 items-center">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder={`Tag ${index + 1} (e.g., Fashion, Electronics)`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {tags.length > 1 && (
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => handleRemoveTag(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? "Adding Brand..." : "Add Brand"}
      </button>
    </form>
  );
}

export default Page;