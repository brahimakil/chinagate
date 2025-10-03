/**
 * Title: Admin Store Update Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import { useUpdateStoreMutation, useGetStoreQuery } from "@/services/store/storeApi";
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");

  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Update Store</h1>
        </div>
        {storeId && <UpdateStore storeId={storeId} />}
      </section>
    </Dashboard>
  );
};

function UpdateStore({ storeId }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [keynotes, setKeynotes] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [storeTitle, setStoreTitle] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const router = useRouter();

  const [updateStore, { isLoading, data, error }] = useUpdateStoreMutation();
  const { data: storeData, isLoading: fetchingStore } = useGetStoreQuery(storeId);
  
  const store = useMemo(() => storeData?.data || {}, [storeData]);

  // Load existing store data
  useEffect(() => {
    if (store && Object.keys(store).length > 0) {
      setStoreTitle(store.title || "");
      setStoreDescription(store.description || "");
      
      if (store.thumbnail?.url) {
        setThumbnailPreview(store.thumbnail.url);
      }
      
      if (store.keynotes && store.keynotes.length > 0) {
        setKeynotes(store.keynotes);
      }
      
      if (store.tags && store.tags.length > 0) {
        setTags(store.tags);
      }
    }
  }, [store]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Updating Store...", { id: "updateStore" });
    }

    if (data) {
      toast.success(data?.description, { id: "updateStore" });
      setTimeout(() => {
        router.push("/dashboard/admin/list-stores");
      }, 1000);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "updateStore" });
    }
  }, [isLoading, data, error, router]);

  const handleThumbnailPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  function handleUpdateStore(e) {
    e.preventDefault();

    const formData = new FormData();
    
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    
    formData.append("keynotes", JSON.stringify(keynotes.filter(note => note.trim() !== "")));
    formData.append("tags", JSON.stringify(tags.filter(tag => tag.trim() !== "")));
    formData.append("title", storeTitle);
    formData.append("description", storeDescription);

    updateStore({ id: storeId, data: formData });
  }

  if (fetchingStore) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading store...</div>
      </div>
    );
  }

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleUpdateStore}>
      {/* Store Image */}
      <div className="w-fit flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Store Image</h3>
        
        {thumbnailPreview ? (
          <div className="relative w-fit">
            <Image
              src={thumbnailPreview}
              alt="Store image preview"
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
                const fileInput = document.getElementById('thumbnail');
                if (fileInput) fileInput.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          <label htmlFor="thumbnail" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
            <span className="text-sm font-medium">Store Image*</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-40 h-40 flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-600 text-center">Click to upload</span>
              <p className="text-xs text-gray-500 text-center">PNG, JPG, JPEG</p>
            </div>
            <input
              type="file"
              name="thumbnail"
              id="thumbnail"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg, .jpeg, .png"
              onChange={handleThumbnailPreview}
            />
          </label>
        )}
      </div>

      {/* Basic Information */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <label htmlFor="title" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Store Name*</span>
          <input
            type="text"
            name="title"
            id="title"
            value={storeTitle}
            onChange={(e) => setStoreTitle(e.target.value)}
            placeholder="i.e. TechWorld Store"
            required
          />
        </label>

        <label htmlFor="description" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Description*</span>
          <textarea
            name="description"
            id="description"
            rows="4"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            placeholder="Brief description of the store..."
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
        {isLoading ? "Updating Store..." : "Update Store"}
      </button>
    </form>
  );
}

export default Page;
