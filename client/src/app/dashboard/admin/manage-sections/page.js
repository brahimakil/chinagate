"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Dashboard from "@/components/shared/layouts/Dashboard";
import {
  useGetSectionsQuery,
  useAddSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} from "@/services/section/sectionApi";
import { useGetProductsQuery } from "@/services/product/productApi"; // 🆕 Add this

const ManageSections = () => {
  const { data: sectionsData, isLoading } = useGetSectionsQuery();
  const { data: productsData } = useGetProductsQuery(); // 🆕 Fetch products
  const [addSection] = useAddSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [reorderSections] = useReorderSectionsMutation();

  const sections = sectionsData?.data || [];
  const products = productsData?.data || []; // 🆕 Get products array

  // 🔍 Add debugging
  console.log('📊 All Sections:', sections);
  console.log('📊 Sections Count:', sections.length);
  sections.forEach((section, index) => {
    console.log(`Section ${index + 1}:`, {
      id: section._id,
      name: section.name,
      displayName: section.displayName,
      sectionCategory: section.sectionCategory,
      type: section.type,
      isActive: section.isActive,
      adText: section.adText,
      adImage: section.adImage,
    });
  });

  // Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    filterKey: "",
    icon: "",
    color: "#3B82F6",
    seasons: [],
    sectionCategory: "product", // 🆕 'product' or 'advertisement'
    
    // Advertisement fields (SIMPLE!)
    adImage: null,
    adImageUrl: "",
    adText: "",
    adTextColor: "#FFFFFF",
    adOverlayColor: "rgba(0, 0, 0, 0.5)",
    adButtonText: "Shop Now",
    adButtonLink: "/collections/all",
    adButtonLinkType: "page", // 🆕 'page' or 'product'
    adButtonProductId: "", // 🆕 Store selected product ID
    adButtonBackgroundColor: "#FFFFFF", // 🆕
    adButtonTextColor: "#000000", // 🆕
    
    // Existing banner fields...
    bannerImage: null,
    bannerImageUrl: "",
    bannerOverlayColor: "rgba(0, 0, 0, 0.5)",
    bannerTextColor: "#FFFFFF",
  });

  // Add search state at the top of the component (around line 26, with other useState)
  const [productSearchQuery, setProductSearchQuery] = useState(""); // 🆕

  // Handle form input changes - AUTO-GENERATE SLUG
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate filterKey from displayName
    if (name === "displayName") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      setFormData((prev) => ({
        ...prev,
        displayName: value,
        name: slug || value.toLowerCase(), // Use slug or lowercase original
        filterKey: slug || value.toLowerCase(), // Use slug or lowercase original
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 🆕 Handle banner image upload
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        bannerImage: file,
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          bannerImageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      filterKey: "",
      icon: "",
      color: "#3B82F6",
      seasons: [],
      sectionCategory: "product", // 🆕 'product' or 'advertisement'
      
      // Advertisement fields (SIMPLE!)
      adImage: null,
      adImageUrl: "",
      adText: "",
      adTextColor: "#FFFFFF",
      adOverlayColor: "rgba(0, 0, 0, 0.5)",
      adButtonText: "Shop Now",
      adButtonLink: "/collections/all",
      adButtonLinkType: "page", // 🆕 'page' or 'product'
      adButtonProductId: "", // 🆕 Store selected product ID
      adButtonBackgroundColor: "#FFFFFF", // 🆕
      adButtonTextColor: "#000000", // 🆕
      
      // Existing banner fields...
      bannerImage: null,
      bannerImageUrl: "",
      bannerOverlayColor: "rgba(0, 0, 0, 0.5)",
      bannerTextColor: "#FFFFFF",
    });
    setEditingSection(null);
    setShowAddModal(false);
  };

  // Handle add section
  const handleAddSection = async (e) => {
    e.preventDefault();
    
    console.log('🚀 ADD SECTION CLICKED');
    console.log('📋 Form Data sectionCategory:', formData.sectionCategory); // 🔍 Check this!
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("displayName", formData.displayName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("filterKey", formData.filterKey);
      formDataToSend.append("icon", formData.icon);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("seasons", JSON.stringify(formData.seasons));
      formDataToSend.append("bannerOverlayColor", formData.bannerOverlayColor);
      formDataToSend.append("bannerTextColor", formData.bannerTextColor);
      
      // Advertisement fields
      console.log('📤 Appending sectionCategory:', formData.sectionCategory); // 🔍 Check this!
      formDataToSend.append("sectionCategory", formData.sectionCategory);
      formDataToSend.append("adText", formData.adText || "");
      formDataToSend.append("adTextColor", formData.adTextColor);
      formDataToSend.append("adOverlayColor", formData.adOverlayColor);
      formDataToSend.append("adButtonText", formData.adButtonText);
      formDataToSend.append("adButtonLink", formData.adButtonLink);
      formDataToSend.append("adButtonLinkType", formData.adButtonLinkType);
      formDataToSend.append("adButtonProductId", formData.adButtonProductId || "");
      formDataToSend.append("adButtonBackgroundColor", formData.adButtonBackgroundColor); // 🆕
      formDataToSend.append("adButtonTextColor", formData.adButtonTextColor); // 🆕
      
      if (formData.bannerImage) {
        formDataToSend.append("bannerImage", formData.bannerImage);
      }
      
      if (formData.adImage) {
        console.log('📸 Ad Image found:', formData.adImage);
        formDataToSend.append("adImage", formData.adImage);
      } else {
        console.log('⚠️ No ad image!');
      }
      
      console.log('📤 Sending FormData...');
      
      // Log all FormData entries
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const result = await addSection(formDataToSend).unwrap();
      console.log('✅ Success:', result);
      
      toast.success("Section added successfully!");
      resetForm();
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error?.data?.description || "Failed to add section");
    }
  };

  // Handle update section
  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("displayName", formData.displayName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("filterKey", formData.filterKey);
      formDataToSend.append("icon", formData.icon);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("seasons", JSON.stringify(formData.seasons));
      formDataToSend.append("bannerOverlayColor", formData.bannerOverlayColor);
      formDataToSend.append("bannerTextColor", formData.bannerTextColor);
      
      // 🆕 Advertisement fields
      formDataToSend.append("sectionCategory", formData.sectionCategory);
      formDataToSend.append("adText", formData.adText || "");
      formDataToSend.append("adTextColor", formData.adTextColor);
      formDataToSend.append("adOverlayColor", formData.adOverlayColor);
      formDataToSend.append("adButtonText", formData.adButtonText);
      formDataToSend.append("adButtonLink", formData.adButtonLink);
      formDataToSend.append("adButtonLinkType", formData.adButtonLinkType);
      formDataToSend.append("adButtonProductId", formData.adButtonProductId || "");
      formDataToSend.append("adButtonBackgroundColor", formData.adButtonBackgroundColor); // 🆕
      formDataToSend.append("adButtonTextColor", formData.adButtonTextColor); // 🆕
      
      if (formData.bannerImage) {
        formDataToSend.append("bannerImage", formData.bannerImage);
      }
      
      // 🆕 Ad image
      if (formData.adImage) {
        formDataToSend.append("adImage", formData.adImage);
      }
      
      await updateSection({ id: editingSection._id, data: formDataToSend }).unwrap();
      toast.success("Section updated successfully!");
      resetForm();
    } catch (error) {
      toast.error(error?.data?.description || "Failed to update section");
    }
  };

  // Handle delete section
  const handleDeleteSection = async (id) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSection(id).unwrap();
        toast.success("Section deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.description || "Failed to delete section");
      }
    }
  };

  // Handle toggle active
  const handleToggleActive = async (section) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", section.name);
      formDataToSend.append("displayName", section.displayName);
      formDataToSend.append("description", section.description || "");
      formDataToSend.append("filterKey", section.filterKey);
      formDataToSend.append("icon", section.icon || "");
      formDataToSend.append("color", section.color || "#3B82F6");
      formDataToSend.append("seasons", JSON.stringify(section.seasons || []));
      formDataToSend.append("bannerOverlayColor", section.bannerOverlayColor || "rgba(0, 0, 0, 0.5)");
      formDataToSend.append("bannerTextColor", section.bannerTextColor || "#FFFFFF");
      formDataToSend.append("isActive", !section.isActive); // Toggle the status
      
      await updateSection({ id: section._id, data: formDataToSend }).unwrap();
      toast.success(`Section ${section.isActive ? "hidden" : "shown"} successfully!`);
    } catch (error) {
      toast.error("Failed to toggle section visibility");
    }
  };

  // Handle move up/down
  const handleMoveSection = async (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap sections
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order values
    const reorderedSections = newSections.map((section, idx) => ({
      id: section._id,
      order: idx,
    }));

    try {
      await reorderSections(reorderedSections).unwrap();
      toast.success("Sections reordered successfully!");
    } catch (error) {
      toast.error("Failed to reorder sections");
    }
  };

  // Handle edit click - Load correct form based on sectionCategory
  const handleEditClick = (section) => {
    console.log('✏️ Editing section:', section);
    console.log('🔍 Section category from DB:', section.sectionCategory); // Should show what's in DB
    
    const hasSpaces = section.filterKey && section.filterKey.includes(' ');
    const autoSlug = section.displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setEditingSection(section);
    setFormData({
      name: hasSpaces ? autoSlug : section.name,
      displayName: section.displayName,
      description: section.description || "",
      filterKey: hasSpaces ? autoSlug : (section.filterKey || ""),
      icon: section.icon || "",
      color: section.color || "#3B82F6",
      seasons: section.seasons || [],
      sectionCategory: section.sectionCategory || "product", // 🆕 Load the category
      
      // 🆕 Advertisement fields - Load if it's an ad
      adImage: null,
      adImageUrl: section.adImage?.url || "",
      adText: section.adText || "",
      adTextColor: section.adTextColor || "#FFFFFF",
      adOverlayColor: section.adOverlayColor || "rgba(0, 0, 0, 0.5)",
      adButtonText: section.adButtonText || "Shop Now",
      adButtonLink: section.adButtonLink || "/collections/all",
      adButtonLinkType: section.adButtonLinkType || "page",
      adButtonProductId: section.adButtonProductId || "",
      adButtonBackgroundColor: section.adButtonBackgroundColor || "#FFFFFF", // 🆕
      adButtonTextColor: section.adButtonTextColor || "#000000", // 🆕
      
      // Banner fields
      bannerImage: null,
      bannerImageUrl: section.bannerImage?.url || "",
      bannerOverlayColor: section.bannerOverlayColor || "rgba(0, 0, 0, 0.5)",
      bannerTextColor: section.bannerTextColor || "#FFFFFF",
    });
    
    console.log('📋 Form category set to:', section.sectionCategory || "product");
    
    if (hasSpaces) {
      toast.info(`Auto-correcting URL slug from "${section.filterKey}" to "${autoSlug}"`, {
        duration: 4000,
      });
    }
    
    setShowAddModal(true);
  };

  // 🆕 Handle season toggle
  const handleSeasonToggle = (season) => {
    setFormData(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  if (isLoading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Sections</h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and reorder homepage sections
            </p>
          </div>
          <div className="flex gap-3">
          <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
              + Add Product Section
            </button>

<button
  onClick={() => {
    const timestamp = Date.now();
    // Don't call resetForm, just set all fields directly
    setFormData({
      name: `ad-${timestamp}`,
      displayName: `Advertisement ${timestamp}`,
      description: "",
      filterKey: `ad-${timestamp}`,
      icon: "",
      color: "#3B82F6",
      seasons: [],
      sectionCategory: 'advertisement', // ✅ Set to advertisement
      
      // Advertisement fields
      adImage: null,
      adImageUrl: "",
      adText: "",
      adTextColor: "#FFFFFF",
      adOverlayColor: "rgba(0, 0, 0, 0.5)",
      adButtonText: "Shop Now",
      adButtonLink: "/collections/all",
      adButtonLinkType: "page",
      adButtonProductId: "",
      adButtonBackgroundColor: "#FFFFFF", // 🆕
      adButtonTextColor: "#000000", // 🆕
      
      // Banner fields
      bannerImage: null,
      bannerImageUrl: "",
      bannerOverlayColor: "rgba(0, 0, 0, 0.5)",
      bannerTextColor: "#FFFFFF",
    });
    setShowAddModal(true);
  }}
  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-lg"
>
  + Add Advertisement
</button>
          </div>
        </div>

        {/* Sections List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No sections found. Add your first section to get started!
                    </td>
                  </tr>
                ) : (
                  sections.map((section, index) => (
                    <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                      {/* Order */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveSection(index, "up")}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMoveSection(index, "down")}
                              disabled={index === sections.length - 1}
                              className={`p-1 rounded ${
                                index === sections.length - 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Icon */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">{section.icon}</span>
                      </td>

                      {/* Section Name */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{section.displayName}</div>
                          <div className="text-xs text-gray-500">{section.filterKey}</div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* Section Type (built-in/custom) */}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
                              section.type === "built-in"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {section.type}
                          </span>
                          {/* 🆕 Section Category (product/advertisement) */}
                          {section.sectionCategory === 'advertisement' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                              📢 Ad
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status - ENHANCED */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(section)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                            section.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {section.isActive ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Visible
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(section)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {section.type === "custom" && (
                            <button
                              onClick={() => handleDeleteSection(section._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSection ? "Edit Section" : "Add New Section"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={editingSection ? handleUpdateSection : handleAddSection} className="space-y-4">
                  
                  {/* 🆕 ADVERTISEMENT FORM - SUPER SIMPLE */}
                  {formData.sectionCategory === 'advertisement' ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        📢 Advertisement Details
                      </h3>

                      {/* Ad Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advertisement Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          required={!formData.adImageUrl}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, adImage: file }));
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData(prev => ({ ...prev, adImageUrl: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {formData.adImageUrl && (
                          <div className="relative mt-3">
                            <img src={formData.adImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, adImage: null, adImageUrl: "" }))}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Ad Text (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text (Optional)
                        </label>
                        <textarea
                          value={formData.adText}
                          onChange={(e) => setFormData(prev => ({ ...prev, adText: e.target.value }))}
                          placeholder="Enter your advertisement text..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows="3"
                        />
                      </div>

                      {/* Text Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Color
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={formData.adTextColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, adTextColor: e.target.value }))}
                            className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                          />
                          <input
                            type="text"
                            value={formData.adTextColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, adTextColor: e.target.value }))}
                            placeholder="#FFFFFF"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Overlay Color with Opacity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Overlay Color & Opacity
                        </label>
                        <div className="space-y-3">
                          {/* Color Picker */}
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={formData.adOverlayColor.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#000000'}
                              onChange={(e) => {
                                const hex = e.target.value;
                                const opacity = formData.adOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.5';
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  adOverlayColor: `rgba(${r}, ${g}, ${b}, ${opacity})`
                                }));
                              }}
                              className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                              type="text"
                              value={formData.adOverlayColor}
                              readOnly
                              placeholder="rgba(0, 0, 0, 0.5)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          
                          {/* Opacity Slider */}
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">
                              Opacity: {(parseFloat(formData.adOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5) * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={formData.adOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5}
                              onChange={(e) => {
                                const match = formData.adOverlayColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                if (match) {
                                  const [, r, g, b] = match;
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    adOverlayColor: `rgba(${r}, ${g}, ${b}, ${e.target.value})`
                                  }));
                                }
                              }}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose color and adjust transparency
                        </p>
                      </div>

                      {/* Button Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={formData.adButtonText}
                          onChange={(e) => setFormData(prev => ({ ...prev, adButtonText: e.target.value }))}
                          placeholder="Shop Now"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      {/* Button Link - Enhanced with Product Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Links To
                        </label>
                        
                        {/* Link Type Selector */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, adButtonLinkType: 'page' }))}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              formData.adButtonLinkType === 'page'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            📄 Page
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, adButtonLinkType: 'product' }))}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              formData.adButtonLinkType === 'product'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            🛍️ Product
                          </button>
                        </div>

                        {formData.adButtonLinkType === 'page' ? (
                          <select
                            value={formData.adButtonLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, adButtonLink: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="/collections/all">All Products</option>
                            <option value="/collections/featured">Featured</option>
                            <option value="/collections/trending">Trending</option>
                            <option value="/collections/seasonal">Seasonal</option>
                            <option value="/categories">Categories</option>
                            <option value="/brands">Brands</option>
                            {sections.filter(s => s.sectionCategory === 'product').map(section => (
                              <option key={section._id} value={`/collections/${section.filterKey}`}>
                                {section.displayName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          /* Product Selector with Search */
                          <div className="space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                              <input
                                type="text"
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                placeholder="Search products by name..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <svg 
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                              </svg>
                              {productSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setProductSearchQuery("")}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Filtered Products List */}
                            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                              {products
                                .filter(product => 
                                  product.title.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                  product.category?.title?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                  product.brand?.title?.toLowerCase().includes(productSearchQuery.toLowerCase())
                                )
                                .slice(0, 50) // Limit to 50 results for performance
                                .map(product => (
                                  <button
                                    key={product._id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        adButtonProductId: product._id,
                                        adButtonLink: `/product?product_id=${product._id}&product_title=${product.title.replace(/ /g, '-').toLowerCase()}`
                                      }));
                                      setProductSearchQuery(""); // Clear search after selection
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                      formData.adButtonProductId === product._id 
                                        ? 'bg-purple-100 border-l-4 border-l-purple-500' 
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Product Image */}
                                      {product.thumbnail?.url && (
                                        <img 
                                          src={product.thumbnail.url} 
                                          alt={product.title}
                                          className="w-12 h-12 object-cover rounded-lg"
                                        />
                                      )}
                                      {/* Product Info */}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                          {product.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span className="font-semibold text-purple-600">${product.price}</span>
                                          {product.category?.title && (
                                            <>
                                              <span>•</span>
                                              <span>{product.category.title}</span>
                                            </>
                                          )}
                                          {product.brand?.title && (
                                            <>
                                              <span>•</span>
                                              <span>{product.brand.title}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {/* Selected Checkmark */}
                                      {formData.adButtonProductId === product._id && (
                                        <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {products.filter(product => 
                                product.title.toLowerCase().includes(productSearchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <p>No products found</p>
                                  <p className="text-xs mt-1">Try a different search term</p>
                                </div>
                              )}
                            </div>

                            {/* Selected Product Confirmation */}
                            {formData.adButtonProductId && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-purple-900">
                                      Selected: {products.find(p => p._id === formData.adButtonProductId)?.title}
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1 break-all">
                                      Link: {formData.adButtonLink}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, adButtonProductId: '', adButtonLink: '/collections/all' }))}
                                    className="text-purple-600 hover:text-purple-800"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 🆕 Button Styling */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Button Background Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button Background Color
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={formData.adButtonBackgroundColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, adButtonBackgroundColor: e.target.value }))}
                              className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                              type="text"
                              value={formData.adButtonBackgroundColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, adButtonBackgroundColor: e.target.value }))}
                              placeholder="#FFFFFF"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Button Text Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button Text Color
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={formData.adButtonTextColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, adButtonTextColor: e.target.value }))}
                              className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                              type="text"
                              value={formData.adButtonTextColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, adButtonTextColor: e.target.value }))}
                              placeholder="#000000"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          {formData.adImageUrl ? (
                            <img src={formData.adImageUrl} alt="Ad" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                          )}
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6" 
                            style={{ backgroundColor: formData.adOverlayColor }}
                          >
                            {formData.adText && (
                              <p className="text-xl font-bold mb-4" style={{ color: formData.adTextColor }}>
                                {formData.adText}
                              </p>
                            )}
                            <button 
                              type="button"
                              className="px-6 py-2 rounded-full font-medium transition-all hover:scale-105 shadow-xl"
                              style={{
                                backgroundColor: formData.adButtonBackgroundColor,
                                color: formData.adButtonTextColor,
                              }}
                            >
                              {formData.adButtonText}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 pt-4 border-t">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                        >
                          {editingSection ? "Update Advertisement" : "Add Advertisement"}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* PRODUCT SECTION FORM */
                    <>
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Name (Internal) *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={editingSection?.type === "built-in"}
                          placeholder="e.g., best-products"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Used as unique identifier (lowercase, no spaces)
                        </p>
                      </div>

                      {/* Display Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name *
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Best Products"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Shown on the homepage
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Brief description of this section"
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Filter Key */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filter Key *
                        </label>
                        <input
                          type="text"
                          name="filterKey"
                          value={formData.filterKey}
                          onChange={handleInputChange}
                          required
                          disabled={editingSection?.type === "built-in"}
                          placeholder="e.g., best-products"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Used to filter products by productStatus field
                        </p>
                      </div>

                      {/* 🆕 Season Selection - Only for Seasonal Section */}
                      {(formData.filterKey === "seasonal" || formData.name === "seasonal") && (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Select Active Seasons *
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { value: "spring", label: "🌸 Spring", color: "#10B981" },
                              { value: "summer", label: "☀️ Summer", color: "#F59E0B" },
                              { value: "autumn", label: "🍂 Autumn", color: "#EF4444" },
                              { value: "winter", label: "❄️ Winter", color: "#3B82F6" },
                              { value: "all-season", label: "🌍 All Season", color: "#8B5CF6" },
                            ].map((season) => (
                              <button
                                key={season.value}
                                type="button"
                                onClick={() => handleSeasonToggle(season.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                  formData.seasons.includes(season.value)
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-medium">{season.label}</span>
                                  {formData.seasons.includes(season.value) && (
                                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            Products matching these seasons will be displayed in this section
                          </p>
                        </div>
                      )}

                      {/* Icon & Color */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (Emoji)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="icon"
                              value={formData.icon}
                              onChange={handleInputChange}
                              placeholder=""
                              maxLength="2"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
                            />
                            {/* Show placeholder icon if empty */}
                            {!formData.icon && (
                              <span className="absolute inset-0 flex items-center justify-center text-2xl text-gray-400 pointer-events-none">
                                
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Add an emoji (can be empty)
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color Theme
                          </label>
                          <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-full h-[42px] px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Banner Customization */}
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          📸 Collection Page Banner
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mb-4">
                          Customize the banner on the collection page
                        </p>

                        {/* Banner Image */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Image (Optional)
                          </label>
                          {formData.bannerImageUrl && (
                            <div className="relative w-full h-32 md:h-48 mb-3 rounded-lg overflow-hidden">
                              <img
                                src={formData.bannerImageUrl}
                                alt="Banner"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, bannerImage: null, bannerImageUrl: "" }))}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            1920x400px recommended
                          </p>
                        </div>

                        {/* Overlay and Text Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Overlay Color with Color Picker + Opacity Slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Overlay Color & Opacity
                            </label>
                            <div className="space-y-3">
                              {/* Color Picker */}
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={formData.bannerOverlayColor.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#000000'}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    const opacity = formData.bannerOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.5';
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      bannerOverlayColor: `rgba(${r}, ${g}, ${b}, ${opacity})`
                                    }));
                                  }}
                                  className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={formData.bannerOverlayColor}
                                  onChange={handleInputChange}
                                  name="bannerOverlayColor"
                                  placeholder="rgba(0, 0, 0, 0.5)"
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              {/* Opacity Slider */}
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">
                                  Opacity: {(parseFloat(formData.bannerOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5) * 100).toFixed(0)}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={formData.bannerOverlayColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || 0.5}
                                  onChange={(e) => {
                                    const match = formData.bannerOverlayColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                    if (match) {
                                      const [, r, g, b] = match;
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        bannerOverlayColor: `rgba(${r}, ${g}, ${b}, ${e.target.value})`
                                      }));
                                    }
                                  }}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Choose color and adjust transparency
                            </p>
                          </div>

                          {/* Text Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text Color
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={formData.bannerTextColor}
                                onChange={(e) => setFormData(prev => ({ ...prev, bannerTextColor: e.target.value }))}
                                className="w-12 md:w-16 h-[38px] border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                name="bannerTextColor"
                                value={formData.bannerTextColor}
                                onChange={handleInputChange}
                                placeholder="#FFFFFF"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Color of text in the banner
                            </p>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                          <div 
                            className="relative w-full h-24 md:h-32 rounded-lg overflow-hidden flex flex-col items-center justify-center"
                            style={{
                              backgroundImage: formData.bannerImageUrl ? `url(${formData.bannerImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div 
                              className="absolute inset-0"
                              style={{ backgroundColor: formData.bannerOverlayColor }}
                            ></div>
                            <div className="relative z-10 text-center px-4">
                              <h3 
                                className="text-lg md:text-2xl font-bold mb-1"
                                style={{ color: formData.bannerTextColor }}
                              >
                                {formData.icon} {formData.displayName || "Section Name"}
                              </h3>
                              <p 
                                className="text-xs md:text-sm opacity-90"
                                style={{ color: formData.bannerTextColor }}
                              >
                                {formData.description || "Section description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          {editingSection ? "Update Section" : "Add Section"}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default ManageSections;
