"use client";

import { useUpdateProductMutation, useGetProductQuery } from "@/services/product/productApi";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetStoresQuery } from "@/services/store/storeApi";
import { useGetSectionsQuery } from "@/services/section/sectionApi"; // ADD THIS
import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useGetColors from "@/libs/useGetColors";

const Page = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  return (
    <Dashboard>
      <section className="w-full space-y-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-2xl">Update Product</h1>
        </div>
        {productId && <UpdateProduct productId={productId} />}
      </section>
    </Dashboard>
  );
};

function UpdateProduct({ productId }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [features, setFeatures] = useState([{ title: "", content: [""] }]);
  const router = useRouter();
  const [selectedColors, setSelectedColors] = useState([]); // Will store color objects with images
  const [colorSearch, setColorSearch] = useState("");
  const [customAttributes, setCustomAttributes] = useState([{ name: "", value: "", unit: "" }]);
  const [socialLinks, setSocialLinks] = useState([{ name: "", url: "" }]);
  const [selectedSeason, setSelectedSeason] = useState(["all-season"]); // Changed to array
  const [selectedProductStatus, setSelectedProductStatus] = useState(["regular"]); // Changed to array
  const [isHidden, setIsHidden] = useState(false); // Add this line
  
  // Add these toggle state variables:
  const [enableColors, setEnableColors] = useState(false);
  const [enableCustomSpecs, setEnableCustomSpecs] = useState(false);
  const [enableSocialLinks, setEnableSocialLinks] = useState(false);
  const [enableStore, setEnableStore] = useState(false);
  const [stock, setStock] = useState(0); // Add this line

  // Form fields
  const [productTitle, setProductTitle] = useState("");
  const [productSummary, setProductSummary] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState(0); // Add this line
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStore, setProductStore] = useState("");

  const colorsData = useGetColors() || [];
  
  const filteredColors = useMemo(() => 
    colorsData.filter(color => 
      color.name.toLowerCase().includes(colorSearch.toLowerCase())
    ), [colorsData, colorSearch]
  );

  // Add loading state:
  const [updateProduct, { isLoading, data, error }] = useUpdateProductMutation();
  const { data: productData, isLoading: fetchingProduct } = useGetProductQuery(productId);
  const { data: brandsData } = useGetBrandsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: storesData } = useGetStoresQuery();
  const { data: sectionsData } = useGetSectionsQuery(); // ADD THIS

  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const stores = useMemo(() => storesData?.data || [], [storesData]);
  const sections = useMemo(() => sectionsData?.data || [], [sectionsData]); // ADD THIS
  const product = useMemo(() => productData?.data || {}, [productData]);

  // Load existing product data
  useEffect(() => {
    if (product && Object.keys(product).length > 0) {
      setProductTitle(product.title || "");
      setProductSummary(product.summary || "");
      setProductPrice(product.price || "");
      setProductStock(product.stock || 0); // Add this line
      setProductBrand(product.brand?._id || "");
      setProductCategory(product.category?._id || "");
      setProductStore(product.store?._id || "");
      
      // Load existing thumbnail
      if (product.thumbnail?.url) {
        setThumbnailPreview(product.thumbnail.url);
      }
      
      // Load existing gallery
      if (product.gallery && product.gallery.length > 0) {
        const galleryUrls = product.gallery.map(img => img.url);
        setGalleryPreviews(galleryUrls);
      }
      
      // Load existing features
      if (product.features && product.features.length > 0) {
        setFeatures(product.features);
      }
      
      // LOAD TOGGLE STATES FROM DATABASE - FIXED
      setEnableColors(product.enableColors === true || product.enableColors === 'true');
      setEnableCustomSpecs(product.enableCustomSpecs === true || product.enableCustomSpecs === 'true');
      setEnableSocialLinks(product.enableSocialLinks === true || product.enableSocialLinks === 'true');
      setEnableStore(product.enableStore === true || product.enableStore === 'true');
      
      console.log('Loaded toggle states from DB:', {
        enableColors: product.enableColors,
        enableCustomSpecs: product.enableCustomSpecs,
        enableSocialLinks: product.enableSocialLinks,
        enableStore: product.enableStore,
      });
      
      // Load colors with their images
      if (product?.colors && Array.isArray(product.colors)) {
        setSelectedColors(product.colors.map(color => ({
          name: color.name,
          hex: color.hex,
          theme: color.theme,
          group: color.group,
          rgb: color.rgb,
          image: null, // File object (won't have on load)
          imagePreview: color.image?.url || null, // Existing image URL
          existingImage: color.image || null, // Store existing image data
        })));
      }
      
      // CUSTOM ATTRIBUTES: Load from variations.customAttributes
      if (product.variations?.customAttributes && Array.isArray(product.variations.customAttributes) && product.variations.customAttributes.length > 0) {
        setCustomAttributes(product.variations.customAttributes);
        console.log('Loaded custom attributes:', product.variations.customAttributes);
      } else {
        setCustomAttributes([{ name: "", value: "", unit: "" }]);
      }
      
      // SOCIAL LINKS: Load from socialLinks array
      if (product.socialLinks && Array.isArray(product.socialLinks) && product.socialLinks.length > 0) {
        setSocialLinks(product.socialLinks);
        console.log('Loaded social links:', product.socialLinks);
      } else {
        setSocialLinks([{ name: "", url: "" }]);
      }
      
      // STORE: Load store assignment
      if (product.store?._id) {
        setProductStore(product.store._id);
        console.log('Loaded store:', product.store);
      } else {
        setProductStore("");
      }

      // Load season and product status
      setSelectedSeason(Array.isArray(product.season) ? product.season : [product.season || "all-season"]); // Handle both array and string
      setSelectedProductStatus(Array.isArray(product.productStatus) ? product.productStatus : [product.productStatus || "regular"]); // Handle both array and string
      setIsHidden(product.isHidden || false); // Load hidden status
      
      console.log('Full product data loaded:', product);
      console.log('=== DEBUGGING SOCIAL LINKS ===');
      console.log('enableSocialLinks state:', enableSocialLinks);
      console.log('socialLinks state:', socialLinks);
      console.log('product.socialLinks from DB:', product.socialLinks);
      console.log('product.enableSocialLinks from DB:', product.enableSocialLinks);
    }
  }, [product]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Updating Product...", { id: "updateProduct" });
    }

    if (data) {
      toast.success(data?.description, { id: "updateProduct" });
      setTimeout(() => {
        router.push("/dashboard/admin/list-products");
      }, 1000);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "updateProduct" });
    }
  }, [isLoading, data, error, router]);

  // Toggle handlers
  useEffect(() => {
    const setupToggle = (checkboxId, sectionId, resetFunction = null) => {
      const checkbox = document.getElementById(checkboxId);
      const section = document.getElementById(sectionId);
      
      const handleToggle = () => {
        if (checkbox && section) {
          if (checkbox.checked) {
            section.classList.remove('hidden');
          } else {
            section.classList.add('hidden');
            if (resetFunction) resetFunction();
          }
        }
      };
      
      if (checkbox) {
        checkbox.addEventListener('change', handleToggle);
        return () => checkbox.removeEventListener('change', handleToggle);
      }
    };

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

  const handleGalleryPreview = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const currentCount = galleryPreviews.length;
    const newCount = currentCount + files.length;
    
    if (newCount > 5) {
      toast.error(`You can only upload up to 5 images. You have ${currentCount} and tried to add ${files.length} more.`);
      return;
    }
    
    const validFiles = [];
    
    files.forEach((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length === 0) return;
    
    const allFiles = [...gallery, ...validFiles];
    setGallery(allFiles);
    
    let loadedCount = 0;
    const newPreviews = [...galleryPreviews];
    
    validFiles.forEach((file) => {
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
    
    e.target.value = '';
  };

  // Feature handlers
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
    const updatedFeatures = features.map((feature, index) => {
      if (index === featureIndex) {
        return {
          ...feature,
          content: [...feature.content, ""] // Create a new array with the new empty string
        };
      }
      return { ...feature }; // Deep copy other features too
    });
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
    setSelectedColors(prev => {
      const exists = prev.some(c => c.name === color.name);
      if (exists) {
        return prev.filter(c => c.name !== color.name);
      } else {
        return [...prev, {
          name: color.name,
          hex: color.hex,
          theme: color.theme,
          group: color.group,
          rgb: color.rgb,
          image: null,
          imagePreview: null,
          existingImage: null,
        }];
      }
    });
  };

  // Add color image handlers (same as add product form)
  const handleColorImageUpload = (colorName, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedColors(prev => prev.map(color => 
          color.name === colorName 
            ? { ...color, image: file, imagePreview: reader.result, existingImage: null }
            : color
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveColorImage = (colorName) => {
    setSelectedColors(prev => prev.map(color => 
      color.name === colorName 
        ? { ...color, image: null, imagePreview: null, existingImage: null }
        : color
    ));
  };

  // Custom attribute handlers
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

  // Social link handlers
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

  async function handleUpdateProduct(event) {
    event.preventDefault();
    
    console.log('=== FRONTEND UPDATE DEBUG ===');
    console.log('Toggle states BEFORE sending:', {
      enableColors,
      enableCustomSpecs,
      enableSocialLinks,
      enableStore
    });

    const formData = new FormData();

    formData.append("title", productTitle);
    formData.append("summary", productSummary);
    formData.append("price", productPrice);
    formData.append("stock", productStock); // Add this line

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    
    for (let i = 0; i < gallery.length; i++) {
      formData.append("gallery", gallery[i]);
    }

    const validFeatures = features.filter(feature => 
      feature.title.trim() !== "" && 
      feature.content.some(content => content.trim() !== "")
    ).map(feature => ({
      ...feature,
      content: feature.content.filter(content => content.trim() !== "")
    }));
    
    formData.append("features", JSON.stringify(validFeatures));
    
    const validCustomAttributes = enableCustomSpecs ? customAttributes.filter(attr => attr.name && attr.value) || [] : [];

    // Handle colors with images
    const colorObjects = enableColors
      ? selectedColors.map((colorObj) => ({
          name: colorObj.name,
          theme: colorObj.theme,
          group: colorObj.group,
          hex: colorObj.hex,
          rgb: colorObj.rgb,
          // Keep existing image if no new image uploaded
          ...(colorObj.existingImage && !colorObj.image ? { image: colorObj.existingImage } : {})
        }))
      : [];

    // Append new color images
    if (enableColors) {
      selectedColors.forEach((colorObj) => {
        if (colorObj.image) {
          formData.append(`colorImages`, colorObj.image);
          formData.append(`colorImageNames`, colorObj.name);
        }
      });
    }

    const validVariations = {
      colors: colorObjects,
      customAttributes: validCustomAttributes,
    };
    
    formData.append("variations", JSON.stringify(validVariations));

    const validSocialLinks = enableSocialLinks ? socialLinks.filter(link => link.name && link.url) || [] : [];  // Only send social links if enabled
    formData.append("socialLinks", JSON.stringify(validSocialLinks));

    formData.append("brand", productBrand);
    formData.append("category", productCategory);
    
    if (enableStore && productStore) {  // Only send store if enabled and selected
      formData.append("store", productStore);
    }

    formData.append("season", JSON.stringify(selectedSeason)); // Send as JSON array
    formData.append("productStatus", JSON.stringify(selectedProductStatus));
    formData.append("isHidden", isHidden ? 'true' : 'false');

    // IMPORTANT: Send toggle states - make sure they're the actual boolean values
    formData.append("enableColors", enableColors ? 'true' : 'false');
    formData.append("enableCustomSpecs", enableCustomSpecs ? 'true' : 'false');
    formData.append("enableSocialLinks", enableSocialLinks ? 'true' : 'false');
    formData.append("enableStore", enableStore ? 'true' : 'false');

    console.log('Toggle states AFTER converting to strings:', {
      enableColors: enableColors ? 'true' : 'false',
      enableCustomSpecs: enableCustomSpecs ? 'true' : 'false',
      enableSocialLinks: enableSocialLinks ? 'true' : 'false',
      enableStore: enableStore ? 'true' : 'false'
    });

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    updateProduct({ id: productId, data: formData });
  }

  // Color grid component
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
              ${selectedColors.some(c => c.name === color.name) 
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
            {selectedColors.some(c => c.name === color.name) && (
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

  if (fetchingProduct) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading product...</div>
        </div>
      </Dashboard>
    );
  }

  return (
    <form className="w-full flex flex-col gap-y-4" onSubmit={handleUpdateProduct}>
      {/* Basic Info */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <label htmlFor="productTitle" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Product Title*</span>
          <input
            type="text"
            name="productTitle"
            id="productTitle"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
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
            value={productSummary}
            onChange={(e) => setProductSummary(e.target.value)}
            placeholder="Brief description of the product..."
            required
          ></textarea>
        </label>

        <label htmlFor="price" className="w-full flex flex-col gap-y-1">
          <span className="text-sm">Price (USD)*</span>
          <input
            type="number"
            name="price"
            id="price"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            placeholder="i.e. 999"
            min="0"
            step="0.01"
            required
          />
        </label>

        {/* Stock Management - IMPROVED */}
        <div className="w-full flex flex-col gap-y-3">
          <span className="text-sm font-medium">Stock Management</span>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-700">Current Stock in System</p>
                <p className="text-3xl font-bold text-blue-600">{product.stock || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">After Update</p>
                <p className="text-2xl font-semibold text-green-600">
                  {(product.stock || 0) + (productStock || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="stockChange" className="text-sm text-gray-700">
              Add or Remove Stock
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProductStock(Math.max(-product.stock, productStock - 10))}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setProductStock(Math.max(-product.stock, productStock - 1))}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                -1
              </button>
              <input
                type="number"
                id="stockChange"
                value={productStock}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  // Don't allow going below negative current stock
                  if ((product.stock || 0) + value >= 0) {
                    setProductStock(value);
                  }
                }}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-center font-semibold text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => setProductStock(productStock + 1)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setProductStock(productStock + 10)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
              >
                +10
              </button>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
              <span>
                {productStock > 0 ? `📈 Adding ${productStock} units` : productStock < 0 ? `📉 Removing ${Math.abs(productStock)} units` : '➡️ No change'}
              </span>
              <button
                type="button"
                onClick={() => setProductStock(0)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Images</h3>
        
        {/* Thumbnail */}
        <div className="w-fit flex flex-col gap-y-4">
          <h4 className="text-md font-medium">Main Product Image</h4>
          
          {thumbnailPreview ? (
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
              />
            </label>
          )}
        </div>

        {/* Gallery */}
        <div className="w-full flex flex-col gap-y-4">
          <h4 className="text-md font-medium">Additional Images (Optional - Max 5)</h4>
          
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

      {/* Classification */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Classification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label htmlFor="category" className="w-full flex flex-col gap-y-1">
            <span className="text-sm">Category*</span>
            <select 
              name="category" 
              id="category" 
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              required
            >
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
            <select 
              name="brand" 
              id="brand" 
              value={productBrand}
              onChange={(e) => setProductBrand(e.target.value)}
              required
            >
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
  
      </div>

      {/* Colors Section - COMPLETELY FIXED */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Product Colors (Optional)</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableColors"
              checked={enableColors}
              onChange={(e) => {
                console.log('Colors checkbox changed:', e.target.checked);
                setEnableColors(e.target.checked);
                if (!e.target.checked) {
                  setSelectedColors([]);
                }
              }}
              className="rounded"
            />
            <label htmlFor="enableColors" className="text-sm font-medium cursor-pointer">
              Enable Color Variations
            </label>
          </div>
        </div>

        {enableColors && (
          <div className="space-y-4">
            {/* Color Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search colors..."
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded-lg"
              />
            </div>

            {/* Color grid */}
            {colorGrid}
          </div>
        )}

        {/* Selected Colors with Image Upload */}
        {selectedColors.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-4">Selected Colors ({selectedColors.length})</h4>
            <div className="space-y-4">
              {selectedColors.map((color, index) => (
                <div key={color.name} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    {/* Color Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: `#${color.hex}` }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{color.name}</div>
                        <div className="text-xs text-gray-500">#{color.hex}</div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Image (Optional)
                      </label>
                      {color.imagePreview ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={color.imagePreview}
                            alt={color.name}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveColorImage(color.name)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg"
                          >
                            ×
                          </button>
                          {color.existingImage && !color.image && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Current
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleColorImageUpload(color.name, e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Upload product image in {color.name} color
                      </p>
                    </div>

                    {/* Remove Color Button */}
                    <button
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove color"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Specifications Section - COMPLETELY FIXED */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Custom Specifications (Optional)</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableCustomSpecs"
              checked={enableCustomSpecs}
              onChange={(e) => {
                console.log('Custom specs checkbox changed:', e.target.checked);
                setEnableCustomSpecs(e.target.checked);
                if (!e.target.checked) {
                  setCustomAttributes([{ name: "", value: "", unit: "" }]);
                }
              }}
              className="rounded"
            />
            <label htmlFor="enableCustomSpecs" className="text-sm font-medium cursor-pointer">
              Add Custom Specifications
            </label>
          </div>
        </div>

        {enableCustomSpecs && (
          <div className="space-y-4">
            {customAttributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <input
                  type="text"
                  placeholder="Specification name (e.g., Weight, Width)"
                  value={attr.name}
                  onChange={(e) => {
                    const newAttrs = [...customAttributes];
                    newAttrs[index].name = e.target.value;
                    setCustomAttributes(newAttrs);
                  }}
                  className="w-full"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 2.5, 15)"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttrs = [...customAttributes];
                    newAttrs[index].value = e.target.value;
                    setCustomAttributes(newAttrs);
                  }}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Unit (e.g., kg, cm)"
                    value={attr.unit}
                    onChange={(e) => {
                      const newAttrs = [...customAttributes];
                      newAttrs[index].unit = e.target.value;
                      setCustomAttributes(newAttrs);
                    }}
                    className="flex-1"
                  />
                  {customAttributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCustomAttributes(prev => prev.filter((_, i) => i !== index))}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setCustomAttributes(prev => [...prev, { name: "", value: "", unit: "" }])}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Specification
            </button>
          </div>
        )}
      </div>

     {/* Social Links Section - COMPLETELY FIXED */}
<div className="w-full flex flex-col gap-y-4 p-4 border rounded">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Social Links (Optional)</h3>
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="enableSocialLinks"
        checked={enableSocialLinks}  // ← This should be 'checked', not 'defaultChecked'
        onChange={(e) => {
          console.log('Social links checkbox changed:', e.target.checked);
          setEnableSocialLinks(e.target.checked);
          if (!e.target.checked) {
            setSocialLinks([{ name: "", url: "" }]);
          }
        }}
        className="rounded"
      />
            <label htmlFor="enableSocialLinks" className="text-sm font-medium cursor-pointer">
              Add Social Links & References
            </label>
          </div>
        </div>

        {enableSocialLinks && (
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <input
                  type="text"
                  placeholder="Platform name (e.g., TikTok, Instagram)"
                  value={link.name}
                  onChange={(e) => {
                    const newLinks = [...socialLinks];
                    newLinks[index].name = e.target.value;
                    setSocialLinks(newLinks);
                  }}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[index].url = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    className="flex-1"
                  />
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== index))}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setSocialLinks(prev => [...prev, { name: "", url: "" }])}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Social Link
            </button>
          </div>
        )}
      </div>

      {/* Store Selection Section - COMPLETELY FIXED */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Store Assignment (Optional)</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableStore"
              checked={enableStore}
              onChange={(e) => {
                console.log('Store checkbox changed:', e.target.checked);
                setEnableStore(e.target.checked);
                if (!e.target.checked) {
                  setProductStore("");
                }
              }}
              className="rounded"
            />
            <label htmlFor="enableStore" className="text-sm font-medium cursor-pointer">
              Associate with Store
            </label>
          </div>
        </div>

        {enableStore && (
          <select
            value={productStore}
            onChange={(e) => setProductStore(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select a store...</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.title}
              </option>
            ))}
          </select>
        )}
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

      {/* Product Status - Multiple Selection - NOW DYNAMIC */}
      <div className="w-full flex flex-col gap-y-4 p-4 border rounded">
        <h3 className="text-lg font-semibold">Product Sections (Multiple Selection)</h3>
        <p className="text-sm text-gray-600">Select one or more sections where this product should appear</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular - Always show */}
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
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <div className="font-semibold text-gray-900">Regular Product</div>
              </div>
              <div className="text-sm text-gray-600">Standard product listing</div>
            </div>
          </label>

          {/* Dynamic sections from database */}
          {sections
            .filter(section => section.filterKey !== "seasonal") // Seasonal handled separately
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <label 
                key={section._id} 
                className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-opacity-10"
                style={{ 
                  borderColor: selectedProductStatus.includes(section.filterKey) ? section.color : '#e5e7eb',
                  backgroundColor: selectedProductStatus.includes(section.filterKey) ? `${section.color}10` : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProductStatus.includes(section.filterKey)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductStatus(prev => [...prev, section.filterKey]);
                    } else {
                      setSelectedProductStatus(prev => prev.filter(status => status !== section.filterKey));
                    }
                  }}
                  style={{ accentColor: section.color }}
                  className="rounded focus:ring-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{section.icon}</span>
                    <div className="font-semibold text-gray-900">{section.displayName}</div>
                  </div>
                  {section.description && (
                    <div className="text-sm text-gray-600">{section.description}</div>
                  )}
                </div>
              </label>
            ))}
        </div>
      </div>

      {/* Hide Product Section - IMPROVED */}
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
        className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? "Updating Product..." : "Update Product"}
      </button>
    </form>
  );
}

export default Page;
