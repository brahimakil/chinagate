/**
 * Title: Admin Brand Update Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useUpdateBrandMutation, useGetBrandQuery } from "@/services/brand/brandApi";
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Update Brand</h1>
        </div>
        {brandId && <UpdateBrand brandId={brandId} />}
      </section>
    </Dashboard>
  );
};

function UpdateBrand({ brandId }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [keynotes, setKeynotes] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [brandTitle, setBrandTitle] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const router = useRouter();

  const [updateBrand, { isLoading, data, error }] = useUpdateBrandMutation();
  const { data: brandData, isLoading: fetchingBrand } = useGetBrandQuery(brandId);
  
  const brand = useMemo(() => brandData?.data || {}, [brandData]);

  // Load existing brand data
  useEffect(() => {
    if (brand && Object.keys(brand).length > 0) {
      setBrandTitle(brand.title || "");
      setBrandDescription(brand.description || "");
      
      if (brand.logo?.url) {
        setThumbnailPreview(brand.logo.url);
      }
      
      if (brand.keynotes && brand.keynotes.length > 0) {
        setKeynotes(brand.keynotes);
      }
      
      if (brand.tags && brand.tags.length > 0) {
        setTags(brand.tags);
      }
    }
  }, [brand]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Updating Brand...", { id: "updateBrand" });
    }

    if (data) {
      toast.success(data?.description, { id: "updateBrand" });
      setTimeout(() => {
        router.push("/dashboard/admin/list-brands");
      }, 1000);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "updateBrand" });
    }
  }, [isLoading, data, error, router]);

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
      
      setThumbnail(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
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

  function handleUpdateBrand(e) {
    e.preventDefault();

    console.log("=== UPDATE BRAND DEBUG START ===");
    console.log("Brand ID:", brandId);
    console.log("Brand Title:", brandTitle);
    console.log("Brand Description:", brandDescription);
    console.log("Raw Keynotes:", keynotes);
    console.log("Raw Tags:", tags);
    console.log("Thumbnail file:", thumbnail);

    const formData = new FormData();
    
    // Append the actual file, not the preview
    if (thumbnail) {
      formData.append("logo", thumbnail); // This matches upload.single("logo") in backend
      console.log("✅ Logo file appended");
    } else {
      console.log("⚠️ No new logo file");
    }
    
    // Filter and prepare data
    const filteredKeynotes = keynotes.filter(note => note.trim() !== "");
    const filteredTags = tags.filter(tag => tag.trim() !== "");
    
    console.log("Filtered Keynotes:", filteredKeynotes);
    console.log("Filtered Tags:", filteredTags);
    
    const keynotesJSON = JSON.stringify(filteredKeynotes);
    const tagsJSON = JSON.stringify(filteredTags);
    
    console.log("Keynotes JSON:", keynotesJSON);
    console.log("Tags JSON:", tagsJSON);
    
    formData.append("keynotes", keynotesJSON);
    formData.append("tags", tagsJSON);
    formData.append("title", brandTitle);
    formData.append("description", brandDescription);

    console.log("=== FormData Contents ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("=== UPDATE BRAND DEBUG END ===");

    // FIXED: Use 'body' instead of 'data' to match the API definition
    updateBrand({ id: brandId, body: formData });
  }

  if (fetchingBrand) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading brand...</div>
      </div>
    );
  }

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleUpdateBrand}>
      {/* Brand Logo */}
      <div className="w-fit flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Brand Logo</h3>
        
        {thumbnailPreview ? (
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
                const fileInput = document.getElementById('logo');
                if (fileInput) fileInput.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          <label htmlFor="logo" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
            <span className="text-sm font-medium">Brand Logo*</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-40 h-40 flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-600 text-center">Click to upload brand logo</span>
              <p className="text-xs text-gray-500 text-center">PNG, JPG, JPEG up to 5MB</p>
            </div>
            <input
              type="file"
              name="logo"
              id="logo"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg, .jpeg, .png, .webp"
              onChange={handleThumbnailPreview}
            />
          </label>
        )}
      </div>

      {/* Basic Information */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <label htmlFor="title" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Brand Name*</span>
          <input
            type="text"
            name="title"
            id="title"
            value={brandTitle}
            onChange={(e) => setBrandTitle(e.target.value)}
            placeholder="i.e. Apple"
            required
          />
        </label>

        <label htmlFor="description" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Description*</span>
          <textarea
            name="description"
            id="description"
            rows="4"
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder="Brief description of the brand..."
            required
          ></textarea>
        </label>
      </div>

      {/* Keynotes */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Key Features</h3>
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleAddKeynote}
          >
            Add Feature
          </button>
        </div>

        <div className="space-y-3">
          {keynotes.map((keynote, index) => (
            <div key={index} className="flex flex-row gap-x-2 items-center">
              <input
                type="text"
                value={keynote}
                onChange={(e) => handleKeynoteChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-1"
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

      {/* Tags */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Tags</h3>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddTag}
          >
            Add Tag
          </button>
        </div>

        <div className="space-y-3">
          {tags.map((tag, index) => (
            <div key={index} className="flex flex-row gap-x-2 items-center">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder={`Tag ${index + 1}`}
                className="flex-1"
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
        {isLoading ? "Updating Brand..." : "Update Brand"}
      </button>
    </form>
  );
}

export default Page;
