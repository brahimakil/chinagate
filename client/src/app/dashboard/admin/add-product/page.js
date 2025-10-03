/**
 * Title: Admin Product Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";   

import { useAddProductMutation } from "@/services/product/productApi";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetStoresQuery } from "@/services/store/storeApi";
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Add this import

import useGetColors from "@/libs/useGetColors";

const Page = () => {
  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Add New Product</h1>
        </div>
        <AddProduct />
      </section>
    </Dashboard>
  );
};

function AddProduct() {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [features, setFeatures] = useState([{ title: "", content: [""] }]);
  const router = useRouter(); // Add this line
  const [selectedColors, setSelectedColors] = useState([]);
  const [colorSearch, setColorSearch] = useState(""); // Add this line
  const [customAttributes, setCustomAttributes] = useState([{ name: "", value: "", unit: "" }]); // Add this
  const [socialLinks, setSocialLinks] = useState([{ name: "", url: "" }]); // Add this
  const [selectedSeason, setSelectedSeason] = useState(["all-season"]); // Changed to array
  const [selectedProductStatus, setSelectedProductStatus] = useState(["regular"]); // Changed to array
  const [isHidden, setIsHidden] = useState(false); // Add this line

  const colorsData = useGetColors() || [];
  
  // Remove these debug logs - they're causing performance issues!
  // console.log("Colors data:", colorsData);
  // console.log("Colors data length:", colorsData.length);
  // console.log("First color:", colorsData[0]);

  // Optimize the filtered colors with useMemo to prevent recalculation on every render
  const filteredColors = useMemo(() => 
    colorsData.filter(color => 
      color.name.toLowerCase().includes(colorSearch.toLowerCase())
    ), [colorsData, colorSearch]
  );

  const sizes = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];

  const [addProduct, { isLoading, data, error }] = useAddProductMutation();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: storesData } = useGetStoresQuery();

  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const stores = useMemo(() => storesData?.data || [], [storesData]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Adding Product...", { id: "addProduct" });
    }
// In useEffect:
if (data) {
    toast.success(data?.description, { id: "addProduct" });
    setTimeout(() => {
      router.push("/dashboard/admin/list-products"); // Add this redirect
    }, 1000);
  }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "addProduct" });
    }
  }, [isLoading, data, error]);

  // Update the useEffect to handle all toggles
  useEffect(() => {
    const setupToggle = (checkboxId, sectionId, resetFunction = null) => {
      const checkbox = document.getElementById(checkboxId);
      const section = document.getElementById(sectionId);
      
      const handleToggle = () => {
        if (checkbox.checked) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
          if (resetFunction) resetFunction();
        }
      };
      
      if (checkbox) {
        checkbox.addEventListener('change', handleToggle);
        return () => checkbox.removeEventListener('change', handleToggle);
      }
    };

    // Setup all toggles
    const cleanupColors = setupToggle('enableColors', 'colorSection', () => setSelectedColors([]));
    const cleanupSpecs = setupToggle('enableCustomSpecs', 'customSpecsSection', () => setCustomAttributes([{ name: "", value: "", unit: "" }]));
    const cleanupLinks = setupToggle('enableSocialLinks', 'socialLinksSection', () => setSocialLinks([{ name: "", url: "" }]));
    const cleanupStore = setupToggle('enableStore', 'storeSection');

    return () => {
      if (cleanupColors) cleanupColors();
      if (cleanupSpecs) cleanupSpecs();
      if (cleanupLinks) cleanupLinks();
      if (cleanupStore) cleanupStore();
    };
  }, []);

  const handleThumbnailPreview = (e) => {
    setThumbnail(e.target.files[0]);

    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryPreview = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check total limit
    const currentCount = galleryPreviews.length;
    const newCount = currentCount + files.length;
    
    if (newCount > 5) {
      toast.error(`You can only upload up to 5 images. You have ${currentCount} and tried to add ${files.length} more.`);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    const validPreviews = [];
    
    files.forEach((file) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length === 0) return;
    
    // Add to existing files
    const allFiles = [...gallery, ...validFiles];
    setGallery(allFiles);
    
    // Generate previews for new files
    let loadedCount = 0;
    const newPreviews = [...galleryPreviews];
    
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loadedCount++;
        
        if (loadedCount === validFiles.length) {
          setGalleryPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const handleAddFeature = () => {
    setFeatures([...features, { title: "", content: [""] }]);
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  const handleFeatureTitleChange = (index, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index].title = value;
    setFeatures(updatedFeatures);
  };

  const handleAddContent = (featureIndex) => {
    const updatedFeatures = [...features];
    updatedFeatures[featureIndex].content.push("");
    setFeatures(updatedFeatures);
  };

  const handleRemoveContent = (featureIndex, contentIndex) => {
    const updatedFeatures = [...features];
    updatedFeatures[featureIndex].content.splice(contentIndex, 1);
    setFeatures(updatedFeatures);
  };

  const handleContentChange = (featureIndex, contentIndex, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[featureIndex].content[contentIndex] = value;
    setFeatures(updatedFeatures);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color.name) 
        ? prev.filter(c => c !== color.name)
        : [...prev, color.name]
    );
  };

  // Add these new handler functions
  const handleAddCustomAttribute = () => {
    setCustomAttributes([...customAttributes, { name: "", value: "", unit: "" }]);
  };

  const handleRemoveCustomAttribute = (index) => {
    const updated = [...customAttributes];
    updated.splice(index, 1);
    setCustomAttributes(updated);
  };

  const handleCustomAttributeChange = (index, field, value) => {
    const updated = [...customAttributes];
    updated[index][field] = value;
    setCustomAttributes(updated);
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { name: "", url: "" }]);
  };

  const handleRemoveSocialLink = (index) => {
    const updated = [...socialLinks];
    updated.splice(index, 1);
    setSocialLinks(updated);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  function handleAddProduct(event) {
    event.preventDefault();

    const formData = new FormData();

    formData.append("title", event.target.productTitle.value);
    formData.append("summary", event.target.summary.value);
    formData.append("price", event.target.price.value);
    // RE-ADDED: stock quantity
    formData.append("stock", event.target.stock.value);

    formData.append("thumbnail", thumbnail);
    for (let i = 0; i < gallery.length; i++) {
      formData.append("gallery", gallery[i]);
    }

    // Read toggle states like in the update form
    const enableColorsChecked = event.target.enableColors?.checked || false;
    const enableCustomSpecsChecked = event.target.enableCustomSpecs?.checked || false;
    const enableSocialLinksChecked = event.target.enableSocialLinks?.checked || false;
    const enableStoreChecked = event.target.enableStore?.checked || false;

    // Ensure features are valid JSON
    const validFeatures = features.filter(feature =>
      feature.title.trim() !== "" &&
      feature.content.some(content => content.trim() !== "")
    ).map(feature => ({
      ...feature,
      content: feature.content.filter(content => content.trim() !== "")
    }));
    formData.append("features", JSON.stringify(validFeatures));

    // Map selected color names to full color objects only if enabled
    const colorObjects = enableColorsChecked
      ? (selectedColors || []).map((name) => {
          const c = colorsData.find(cc => cc.name === name);
          return c
            ? { name: c.name, theme: c.theme, group: c.group, hex: c.hex, rgb: c.rgb }
            : { name, hex: "CCCCCC" };
        })
      : [];

    // Custom attributes only if enabled
    const validCustomAttributes = enableCustomSpecsChecked
      ? customAttributes.filter(attr => attr.name && attr.value)
      : [];

    const validVariations = {
      colors: colorObjects,
      customAttributes: validCustomAttributes,
    };
    formData.append("variations", JSON.stringify(validVariations));

    // Social links - keep as-is
    const validSocialLinks = socialLinks.filter(link => link.name && link.url) || [];
    formData.append("socialLinks", JSON.stringify(validSocialLinks));

    formData.append("brand", event.target.brand.value);
    formData.append("category", event.target.category.value);

    // Store optional based on toggle
    const storeElement = event.target.store;
    if (enableStoreChecked && storeElement && storeElement.value) {
      formData.append("store", storeElement.value);
    }

    // New fields
    formData.append("season", JSON.stringify(selectedSeason));
    formData.append("productStatus", JSON.stringify(selectedProductStatus));
    formData.append("isHidden", isHidden.toString());

    // Send toggles so backend can persist them
    formData.append("enableColors", String(enableColorsChecked));
    formData.append("enableCustomSpecs", String(enableCustomSpecsChecked));
    formData.append("enableSocialLinks", String(enableSocialLinksChecked));
    formData.append("enableStore", String(enableStoreChecked));

    addProduct(formData);

    event.target.reset();
    setSelectedColors([]);
    setCustomAttributes([{ name: "", value: "", unit: "" }]);
    setSocialLinks([{ name: "", url: "" }]);
    setSelectedSeason(["all-season"]);
    setSelectedProductStatus(["regular"]);
    setIsHidden(false);
  }

  // Memoize the color grid to prevent unnecessary re-renders
  const colorGrid = useMemo(() => {
    if (filteredColors.length === 0) {
      return (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mt-2">No colors found for "{colorSearch}"</p>
          <button
            type="button"
            onClick={() => setColorSearch("")}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            Clear search
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-80 overflow-y-auto border rounded-lg p-3">
        {filteredColors.map((color, index) => (
          <div
            key={`${color.name}-${index}`}
            onClick={() => handleColorToggle(color)}
            className={`
              flex flex-col items-center p-2 rounded-lg cursor-pointer border-2 transition-all
              ${selectedColors.includes(color.name) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: `#${color.hex}` }}
            />
            <span className="text-xs mt-1 text-center line-clamp-1" title={color.name}>
              {color.name}
            </span>
            {selectedColors.includes(color.name) && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [filteredColors, selectedColors, colorSearch]);

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleAddProduct}>
      {/* Basic Info */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <label htmlFor="productTitle" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Product Title*</span>
          <input
            type="text"
            name="productTitle"
            id="productTitle"
            placeholder="i.e. iPhone 15 Pro"
            required
          />
        </label>

        <label htmlFor="summary" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Product Summary*</span>
          <textarea
            name="summary"
            id="summary"
            rows="3"
            placeholder="Brief description of the product..."
            required
          ></textarea>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label htmlFor="price" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Price*</span>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
            />
          </label>

          {/* RE-ADDED: Stock Quantity */}
          <label htmlFor="stock" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Stock Quantity*</span>
            <input
              type="number"
              name="stock"
              id="stock"
              min="0"
              step="1"
              required
            />
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Images</h3>
        
        {/* Thumbnail */}
        <div className="w-fit flex flex-col gap-y-4">
          <h4 className="text-md font-medium">Main Product Image</h4>
          
          {thumbnailPreview ? (
            // Show only the preview with X button when image is selected
            <div className="relative w-fit">
              <Image
                src={thumbnailPreview}
                alt="Product image preview"
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
            // Show upload placeholder only when no image is selected
            <label htmlFor="thumbnail" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
              <span className="text-sm font-medium">Main Image*</span>
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
                required
              />
            </label>
          )}
        </div>

        {/* Gallery */}
        <div className="w-full flex flex-col gap-y-4">
          <h4 className="text-md font-medium">Additional Images (Optional - Max 5)</h4>
          
          {/* Gallery Previews with individual remove buttons */}
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={preview}
                    alt={`gallery-${index}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Remove this specific image
                      const newPreviews = galleryPreviews.filter((_, i) => i !== index);
                      const newFiles = Array.from(gallery).filter((_, i) => i !== index);
                      setGalleryPreviews(newPreviews);
                      setGallery(newFiles);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area - Show if less than 5 images */}
          {galleryPreviews.length < 5 && (
            <label htmlFor="gallery" className="w-full flex flex-col gap-y-1 relative cursor-pointer">
              <span className="text-sm">
                Add More Images ({galleryPreviews.length}/5)
              </span>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-sm text-gray-600">
                  Click to select multiple images
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG • Select multiple files at once
                </p>
              </div>
              <input
                type="file"
                name="gallery"
                id="gallery"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".jpg, .jpeg, .png"
                multiple
                onChange={handleGalleryPreview}
              />
            </label>
          )}

          {/* Clear All Button */}
          {galleryPreviews.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setGalleryPreviews([]);
                setGallery([]);
                const galleryInput = document.getElementById('gallery');
                if (galleryInput) galleryInput.value = '';
              }}
              className="w-fit px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Clear All Images ({galleryPreviews.length})
            </button>
          )}
        </div>
      </div>

      {/* Categories & Brand - Store now optional */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Classification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label htmlFor="category" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Category*</span>
            <select name="category" id="category" required>
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="brand" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Brand*</span>
            <select name="brand" id="brand" required>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Optional Store */}
        <div className="w-full flex flex-col gap-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableStore"
              className="rounded"
              defaultChecked={false}
            />
            <label htmlFor="enableStore" className="text-sm font-medium">
              Associate with Store (Optional)
            </label>
          </div>
          
          <div id="storeSection" className="hidden">
            <label htmlFor="store" className="w-full flex flex-col gap-y-1">
              <span className="text-sm">Store</span>
              <select name="store" id="store">
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Variations - Custom Specs now optional */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Specifications</h3>
        
        <div className="grid grid-cols-1 gap-6">

          {/* Colors - Already Optional */}
          <div className="w-full flex flex-col gap-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableColors"
                className="rounded"
                defaultChecked={false}
              />
              <label htmlFor="enableColors" className="text-sm font-medium">
                Enable Color Variations (Optional)
              </label>
            </div>
            
            <div id="colorSection" className="hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm font-medium">
                  Available Colors ({filteredColors.length} of {colorsData.length} total)
                </span>
                
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={colorSearch}
                    onChange={(e) => setColorSearch(e.target.value)}
                    placeholder="Search colors..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {colorSearch && (
                    <button
                      type="button"
                      onClick={() => setColorSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Color grid - same as before */}
              {colorGrid}

              {/* Selected colors preview */}
              {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-gray-600">Selected ({selectedColors.length}):</span>
                  {selectedColors.map((colorName) => {
                    let color = colorsData.find(c => c.name === colorName);
                    if (!color) {
                      color = { name: colorName, hex: 'CCCCCC' };
                    }
                    
                    return (
                      <div key={colorName} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: `#${color.hex}` }}
                        />
                        <span className="text-xs">{colorName}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedColors(prev => prev.filter(c => c !== colorName))}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Custom Attributes - Now Optional */}
          <div className="w-full flex flex-col gap-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableCustomSpecs"
                className="rounded"
                defaultChecked={false}
              />
              <label htmlFor="enableCustomSpecs" className="text-sm font-medium">
                Add Custom Specifications (Optional)
              </label>
            </div>

            <div id="customSpecsSection" className="hidden">
              <div className="w-full flex flex-row justify-between items-center mb-4">
                <h4 className="text-md font-medium">Custom Specifications</h4>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  onClick={handleAddCustomAttribute}
                >
                  Add Specification
                </button>
              </div>

              <div className="space-y-3">
                {customAttributes.map((attribute, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                    <input
                      type="text"
                      value={attribute.name}
                      onChange={(e) => handleCustomAttributeChange(index, 'name', e.target.value)}
                      placeholder="e.g., Weight, Dimensions, Seats"
                      className="col-span-1 px-3 py-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={attribute.value}
                      onChange={(e) => handleCustomAttributeChange(index, 'value', e.target.value)}
                      placeholder="e.g., 2.5, 1920x1080, 4"
                      className="col-span-1 px-3 py-2 border rounded text-sm"
                    />
                    <select
                      value={attribute.unit}
                      onChange={(e) => handleCustomAttributeChange(index, 'unit', e.target.value)}
                      className="col-span-1 px-3 py-2 border rounded text-sm"
                    >
                      <option value="">No Unit</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                      <option value="in">Inches (in)</option>
                      <option value="ft">Feet (ft)</option>
                      <option value="px">Pixels (px)</option>
                      <option value="seats">Seats</option>
                      <option value="doors">Doors</option>
                      <option value="years">Years</option>
                      <option value="pieces">Pieces</option>
                      <option value="hours">Hours</option>
                      <option value="watts">Watts (W)</option>
                      <option value="volts">Volts (V)</option>
                      <option value="custom">Custom</option>
                    </select>
                    <div className="col-span-1 flex justify-end">
                      {customAttributes.length > 1 && (
                        <button
                          type="button"
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          onClick={() => handleRemoveCustomAttribute(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>Examples:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Weight: 2.5 kg</li>
                  <li>• Dimensions: 1920x1080 px</li>
                  <li>• Seats: 4 seats</li>
                  <li>• Screen Size: 15.6 in</li>
                  <li>• Battery Life: 8 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links - Now Optional */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableSocialLinks"
            className="rounded"
            defaultChecked={false}
          />
          <label htmlFor="enableSocialLinks" className="text-sm font-medium">
            Add Social Links & References (Optional)
          </label>
        </div>

        <div id="socialLinksSection" className="hidden">
          <div className="w-full flex flex-row justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Social Links & References</h3>
            <button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              onClick={handleAddSocialLink}
            >
              Add Link
            </button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                  placeholder="e.g., TikTok, YouTube, Official Site"
                  className="col-span-1 px-3 py-2 border rounded"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="col-span-1 px-3 py-2 border rounded"
                />
                <div className="col-span-1 flex justify-end">
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleRemoveSocialLink(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Examples:</strong> TikTok, YouTube, Instagram, Official Website, Review Video, Unboxing Video, etc.
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Product Features</h3>
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleAddFeature}
          >
            Add Feature
          </button>
        </div>

        {features.map((feature, featureIndex) => (
          <div key={featureIndex} className="border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                value={feature.title}
                onChange={(e) => handleFeatureTitleChange(featureIndex, e.target.value)}
                placeholder="Feature title (e.g., Specifications)"
                className="flex-1 mr-2"
              />
              {features.length > 1 && (
                <button
                  type="button"
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleRemoveFeature(featureIndex)}
                >
                  Remove Feature
                </button>
              )}
            </div>

            {feature.content.map((content, contentIndex) => (
              <div key={contentIndex} className="flex gap-x-2 items-center mb-2">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => handleContentChange(featureIndex, contentIndex, e.target.value)}
                  placeholder="Feature content"
                  className="flex-1"
                />
                {feature.content.length > 1 && (
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleRemoveContent(featureIndex, contentIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleAddContent(featureIndex)}
            >
              Add Content
            </button>
          </div>
        ))}
      </div>

      {/* Season Selection - Multiple Selection */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Season Selection (Multiple Selection)</h3>
        <p className="text-sm text-gray-600">Select one or more seasons for this product</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { value: "all-season", label: "All Season", icon: "🌍" },
            { value: "spring", label: "Spring", icon: "🌸" },
            { value: "summer", label: "Summer", icon: "☀️" },
            { value: "autumn", label: "Autumn", icon: "🍂" },
            { value: "winter", label: "Winter", icon: "❄️" },
          ].map((season) => (
            <label 
              key={season.value}
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedSeason.includes(season.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSeason(prev => [...prev, season.value]);
                  } else {
                    setSelectedSeason(prev => prev.filter(s => s !== season.value));
                  }
                }}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-xl">{season.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{season.label}</div>
                  <div className="text-sm text-gray-600">
                    {season.value === "all-season" ? "Available all year round" : `Perfect for ${season.label.toLowerCase()}`}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Product Status - Multiple Selection */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Status (Multiple Selection)</h3>
        <p className="text-sm text-gray-600">Select one or more statuses for this product</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selectedProductStatus.includes("regular")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProductStatus(prev => [...prev, "regular"]);
                } else {
                  setSelectedProductStatus(prev => prev.filter(status => status !== "regular"));
                }
              }}
              className="rounded text-gray-500 focus:ring-gray-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Regular Product</div>
              <div className="text-sm text-gray-600">Standard product listing</div>
            </div>
          </label>

          {/* Featured */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50">
            <input
              type="checkbox"
              checked={selectedProductStatus.includes("featured")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProductStatus(prev => [...prev, "featured"]);
                } else {
                  setSelectedProductStatus(prev => prev.filter(status => status !== "featured"));
                }
              }}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Featured Product</div>
              <div className="text-sm text-gray-600">Highlighted in featured section</div>
            </div>
          </label>

          {/* Trending */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-green-50">
            <input
              type="checkbox"
              checked={selectedProductStatus.includes("trending")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProductStatus(prev => [...prev, "trending"]);
                } else {
                  setSelectedProductStatus(prev => prev.filter(status => status !== "trending"));
                }
              }}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Trending Product</div>
              <div className="text-sm text-gray-600">Popular and trending item</div>
            </div>
          </label>

          {/* Best Seller */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-red-50">
            <input
              type="checkbox"
              checked={selectedProductStatus.includes("best-seller")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProductStatus(prev => [...prev, "best-seller"]);
                } else {
                  setSelectedProductStatus(prev => prev.filter(status => status !== "best-seller"));
                }
              }}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Best Seller</div>
              <div className="text-sm text-gray-600">Top performing product</div>
            </div>
          </label>
        </div>
      </div>

      {/* Hide Product Option */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Visibility</h3>
        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-yellow-50">
          <input
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="rounded text-yellow-500 focus:ring-yellow-500"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Hide Product</div>
            <div className="text-sm text-gray-600">
              {isHidden 
                ? "🔒 This product will be hidden from customers but saved in the system" 
                : "👁️ This product will be visible to customers"
              }
            </div>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isLoading ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
}

export default Page;
