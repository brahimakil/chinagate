/**
 * Title: Admin Settings Management  
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import Dashboard from "@/components/shared/layouts/Dashboard";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { BsWhatsapp } from "react-icons/bs";
import { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } from "@/services/system/systemApi";
import Image from "next/image";

const Page = () => {
  return (
    <Dashboard>
      <section className="w-full space-y-6">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        </div>
        <SystemSettings />
      </section>
    </Dashboard>
  );
};

function SystemSettings() {
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+961");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  
  // 🆕 Banner states with text fields
  const [banners, setBanners] = useState({
    homePage: { 
      image: null, imageUrl: "", overlayColor: "rgba(0, 0, 0, 0.5)", textColor: "#FFFFFF",
      badge: "WELCOME TO OUR STORE", title: "🏪 Welcome to China Gate", 
      subtitle: "Your One-Stop Shop for Quality Products", 
      description: "Discover amazing products curated just for you. Shop with confidence!" 
    },
    categoriesPage: { 
      image: null, imageUrl: "", overlayColor: "rgba(0, 0, 0, 0.5)", textColor: "#FFFFFF",
      badge: "SHOP BY CATEGORY", title: "📂 Browse Categories", 
      subtitle: "Explore Our Product Categories", 
      description: "Find exactly what you're looking for by browsing our organized categories" 
    },
    brandsPage: { 
      image: null, imageUrl: "", overlayColor: "rgba(0, 0, 0, 0.5)", textColor: "#FFFFFF",
      badge: "SHOP BY BRAND", title: "🏷️ Browse Brands", 
      subtitle: "Shop Your Favorite Brands", 
      description: "Discover products from the world's leading brands" 
    },
    allProductsPage: { 
      image: null, imageUrl: "", overlayColor: "rgba(0, 0, 0, 0.5)", textColor: "#FFFFFF",
      badge: "ALL PRODUCTS", title: "📦 All Products", 
      subtitle: "Complete Collection", 
      description: "Browse our entire product catalog" 
    },
  });

  const { data: settingsData, isSuccess, refetch } = useGetSystemSettingsQuery();
  const [updateSettings, { isLoading: savingSettings }] = useUpdateSystemSettingsMutation();

  // Load settings from DB
  useEffect(() => {
    if (!isSuccess || !settingsData?.data) return;

    const settings = settingsData.data;
    
    // Load WhatsApp
    const dbNumber = (settings.whatsappNumber || "").trim();
    if (dbNumber.length > 0) {
      let code = "+961";
      let phone = dbNumber;
      const countryCodes = ["+961", "+1", "+44", "+971", "+966", "+20"];
      for (const countryCode of countryCodes) {
        if (dbNumber.startsWith(countryCode)) {
          code = countryCode;
          phone = dbNumber.substring(countryCode.length).trim();
          break;
        }
      }
      setWhatsappCountryCode(code);
      setWhatsappPhone(phone);
    }

    // Load banners
    setBanners({
      homePage: {
        image: null,
        imageUrl: settings.homePageBanner?.image?.url || "",
        overlayColor: settings.homePageBanner?.overlayColor || "rgba(0, 0, 0, 0.5)",
        textColor: settings.homePageBanner?.textColor || "#FFFFFF",
        badge: settings.homePageBanner?.badge || "WELCOME TO OUR STORE",
        title: settings.homePageBanner?.title || "🏪 Welcome to China Gate",
        subtitle: settings.homePageBanner?.subtitle || "Your One-Stop Shop for Quality Products",
        description: settings.homePageBanner?.description || "Discover amazing products curated just for you. Shop with confidence!",
      },
      categoriesPage: {
        image: null,
        imageUrl: settings.categoriesPageBanner?.image?.url || "",
        overlayColor: settings.categoriesPageBanner?.overlayColor || "rgba(0, 0, 0, 0.5)",
        textColor: settings.categoriesPageBanner?.textColor || "#FFFFFF",
        badge: settings.categoriesPageBanner?.badge || "SHOP BY CATEGORY",
        title: settings.categoriesPageBanner?.title || "📂 Browse Categories",
        subtitle: settings.categoriesPageBanner?.subtitle || "Explore Our Product Categories",
        description: settings.categoriesPageBanner?.description || "Find exactly what you're looking for",
      },
      brandsPage: {
        image: null,
        imageUrl: settings.brandsPageBanner?.image?.url || "",
        overlayColor: settings.brandsPageBanner?.overlayColor || "rgba(0, 0, 0, 0.5)",
        textColor: settings.brandsPageBanner?.textColor || "#FFFFFF",
        badge: settings.brandsPageBanner?.badge || "SHOP BY BRAND",
        title: settings.brandsPageBanner?.title || "🏷️ Browse Brands",
        subtitle: settings.brandsPageBanner?.subtitle || "Shop Your Favorite Brands",
        description: settings.brandsPageBanner?.description || "Discover products from leading brands",
      },
      allProductsPage: {
        image: null,
        imageUrl: settings.allProductsPageBanner?.image?.url || "",
        overlayColor: settings.allProductsPageBanner?.overlayColor || "rgba(0, 0, 0, 0.5)",
        textColor: settings.allProductsPageBanner?.textColor || "#FFFFFF",
        badge: settings.allProductsPageBanner?.badge || "ALL PRODUCTS",
        title: settings.allProductsPageBanner?.title || "📦 All Products",
        subtitle: settings.allProductsPageBanner?.subtitle || "Complete Collection",
        description: settings.allProductsPageBanner?.description || "Browse our entire catalog",
      },
    });
  }, [isSuccess, settingsData]);

  // Handle banner image upload
  const handleBannerImageChange = (page, e) => {
    const file = e.target.files[0];
    if (file) {
      setBanners(prev => ({
        ...prev,
        [page]: {
          ...prev[page],
          image: file,
        }
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanners(prev => ({
          ...prev,
          [page]: {
            ...prev[page],
            imageUrl: reader.result,
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner field changes
  const handleBannerChange = (page, field, value) => {
    setBanners(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value,
      }
    }));
  };

  // Handle save
  const handleSaveSettings = async () => {
    try {
      const formData = new FormData();
      
      // WhatsApp
      const fullWhatsappNumber = `${whatsappCountryCode}${whatsappPhone}`.trim();
      formData.append("whatsappNumber", fullWhatsappNumber);

      // Helper to append banner data
      const appendBanner = (prefix, data) => {
        if (data.image) formData.append(`${prefix}Image`, data.image);
        formData.append(`${prefix}OverlayColor`, data.overlayColor);
        formData.append(`${prefix}TextColor`, data.textColor);
        formData.append(`${prefix}Badge`, data.badge);
        formData.append(`${prefix}Title`, data.title);
        formData.append(`${prefix}Subtitle`, data.subtitle);
        formData.append(`${prefix}Description`, data.description);
      };

      appendBanner('homePage', banners.homePage);
      appendBanner('categoriesPage', banners.categoriesPage);
      appendBanner('brandsPage', banners.brandsPage);
      appendBanner('allProductsPage', banners.allProductsPage);

      await updateSettings(formData).unwrap();
      toast.success("Settings saved successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    }
  };

  const renderBannerSection = (title, page, icon) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>

      {/* Text Content Fields */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
          <input
            type="text"
            value={banners[page]?.badge}
            onChange={(e) => handleBannerChange(page, 'badge', e.target.value)}
            placeholder="WELCOME TO OUR STORE"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
          <input
            type="text"
            value={banners[page]?.title}
            onChange={(e) => handleBannerChange(page, 'title', e.target.value)}
            placeholder="Welcome to China Gate"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={banners[page]?.subtitle}
            onChange={(e) => handleBannerChange(page, 'subtitle', e.target.value)}
            placeholder="Your One-Stop Shop"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={banners[page]?.description}
            onChange={(e) => handleBannerChange(page, 'description', e.target.value)}
            placeholder="Discover amazing products..."
            rows="2"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image (Optional)
        </label>
        {banners[page]?.imageUrl && (
          <div className="relative w-full h-32 md:h-40 mb-3 rounded-lg overflow-hidden">
            <Image
              src={banners[page].imageUrl}
              alt={`${title} banner`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setBanners(prev => ({
                  ...prev,
                  [page]: { ...prev[page], image: null, imageUrl: '' }
                }));
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
            >
              ×
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleBannerImageChange(page, e)}
          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">1920x400px recommended</p>
      </div>

      {/* Color Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overlay Color & Opacity
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="color"
                value={banners[page]?.overlayColor.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#000000'}
                onChange={(e) => {
                  const hex = e.target.value;
                  const opacity = banners[page]?.overlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.5';
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  handleBannerChange(page, 'overlayColor', `rgba(${r}, ${g}, ${b}, ${opacity})`);
                }}
                className="w-12 md:w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={banners[page]?.overlayColor}
                onChange={(e) => handleBannerChange(page, 'overlayColor', e.target.value)}
                placeholder="rgba(0, 0, 0, 0.5)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Opacity: {(parseFloat(banners[page]?.overlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5) * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={banners[page]?.overlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5}
                onChange={(e) => {
                  const match = banners[page]?.overlayColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                  if (match) {
                    const [, r, g, b] = match;
                    handleBannerChange(page, 'overlayColor', `rgba(${r}, ${g}, ${b}, ${e.target.value})`);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={banners[page]?.textColor}
              onChange={(e) => handleBannerChange(page, 'textColor', e.target.value)}
              className="w-12 md:w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={banners[page]?.textColor}
              onChange={(e) => handleBannerChange(page, 'textColor', e.target.value)}
              placeholder="#FFFFFF"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
        <div 
          className="relative w-full h-24 md:h-32 rounded-lg overflow-hidden flex flex-col items-center justify-center"
          style={{
            backgroundImage: banners[page]?.imageUrl ? `url(${banners[page].imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: banners[page]?.overlayColor }}
          ></div>
          <div className="relative z-10 text-center px-4">
            <div 
              className="inline-block text-xs font-bold mb-1 px-3 py-1 rounded-full bg-black/50"
              style={{ color: banners[page]?.textColor }}
            >
              {banners[page]?.badge}
            </div>
            <h3 
              className="text-lg md:text-xl font-bold mb-1"
              style={{ color: banners[page]?.textColor }}
            >
              {banners[page]?.title}
            </h3>
            <p 
              className="text-xs opacity-90"
              style={{ color: banners[page]?.textColor }}
            >
              {banners[page]?.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* WhatsApp Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BsWhatsapp className="text-green-500 text-2xl" />
          WhatsApp Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
            <select
              value={whatsappCountryCode}
              onChange={(e) => setWhatsappCountryCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="+961">🇱🇧 +961 (Lebanon)</option>
              <option value="+1">🇺🇸 +1 (USA)</option>
              <option value="+44">🇬🇧 +44 (UK)</option>
              <option value="+971">🇦🇪 +971 (UAE)</option>
              <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
              <option value="+20">🇪🇬 +20 (Egypt)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="71234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {whatsappPhone && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-700">
              Full Number: <span className="font-semibold">{whatsappCountryCode}{whatsappPhone}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Banner Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderBannerSection("Home Page Banner", "homePage", "🏠")}
        {renderBannerSection("Categories Page Banner", "categoriesPage", "📂")}
        {renderBannerSection("Brands Page Banner", "brandsPage", "🏷️")}
        {renderBannerSection("All Products Page Banner", "allProductsPage", "📦")}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors shadow-md"
        >
          {savingSettings ? "Saving..." : "💾 Save All Settings"}
        </button>
      </div>
    </div>
  );
}

export default Page;