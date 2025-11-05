/**
 * Title: Professional Product Detail Page
 * Author: China Gate Team
 * Date: 27, September 2025
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsShieldCheck, BsTruck, BsArrowReturnLeft, BsHeart, BsHeartFill } from "react-icons/bs";
import { MdVerified, MdLocalShipping } from "react-icons/md";
import { FiShare2, FiZoomIn } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";

import Container from "@/components/shared/Container";
import Main from "@/components/shared/layouts/Main";
import { useGetProductQuery } from "@/services/product/productApi";
import { useAddToCartMutation } from "@/services/cart/cartApi";
import { useAddToFavoriteMutation, useGetFavoritesQuery } from "@/services/favorite/favoriteApi";
import { useSelector } from "react-redux";
import ProductsYouMayLike from "@/components/product/ProductsYouMayLike";

import { useGetSystemSettingsQuery } from "@/services/system/systemApi";

const ProductDetail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state?.auth?.user);
  
  const id = searchParams.get("product_id");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 🆕 For mobile zoom modal
  const [isMobile, setIsMobile] = useState(false); // 🆕 Detect mobile
  
  // API calls with real-time polling
  const { data: productData, error: productError, isLoading: productLoading } = useGetProductQuery(id, {
    pollingInterval: 3000, // Poll every 3 seconds for real-time stock updates
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const { data: favoritesData } = useGetFavoritesQuery(undefined, {
    skip: !user, // 🆕 Skip query if user is not logged in
  });
  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation();
  const [addToFavorite, { isLoading: addingToFavorite }] = useAddToFavoriteMutation();
  const { data: settingsData } = useGetSystemSettingsQuery();
  
  const product = useMemo(() => productData?.data || {}, [productData]);
  const favorites = useMemo(() => favoritesData?.data || [], [favoritesData]);
  const isFavorite = favorites.some(fav => fav?.product?._id && product?._id && fav.product._id === product._id);
  
  // Track stock changes for real-time notifications
  const previousStockRef = useRef(null);
  useEffect(() => {
    if (product.stock !== undefined) {
      if (previousStockRef.current !== null && previousStockRef.current !== product.stock) {
        const diff = product.stock - previousStockRef.current;
        if (diff < 0) {
          toast(`Stock updated: ${Math.abs(diff)} item${Math.abs(diff) > 1 ? 's' : ''} just ${Math.abs(diff) > 1 ? 'were' : 'was'} purchased! 📦`, {
            duration: 3000,
          });
        } else if (diff > 0) {
          toast(`Stock replenished: ${diff} item${diff > 1 ? 's' : ''} added! ✨`, {
            duration: 3000,
          });
        }
      }
      previousStockRef.current = product.stock;
    }
  }, [product.stock]);
  
  // All images (thumbnail + gallery + color images)
  const allImages = useMemo(() => {
    if (!product.thumbnail) return [];
    
    const images = [product.thumbnail, ...(product.gallery || [])];
    
    // 🆕 Add color-specific images that aren't already in the gallery
    if (product.colors && Array.isArray(product.colors)) {
      product.colors.forEach(color => {
        if (color.image?.url) {
          // Check if this image is not already in the array
          const exists = images.some(img => img.url === color.image.url);
          if (!exists) {
            images.push(color.image);
          }
        }
      });
    }
    
    return images;
  }, [product]);

  // Initialize selected color and size
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product.variations?.sizes && product.variations.sizes.length > 0) {
      setSelectedSize(product.variations.sizes[0]);
    }
  }, [product]);

  // 🆕 Handle color selection and image switching
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    
    // If this color has an associated image, switch to it
    if (color.image?.url) {
      const colorImageIndex = allImages.findIndex(img => img.url === color.image.url);
      if (colorImageIndex !== -1) {
        setSelectedImage(colorImageIndex);
      }
    }
  };

  useEffect(() => {
    if (productError) {
      toast.error(productError?.data?.description, { id: "productData" });
    }
  }, [productError]);

  // Load WhatsApp number from DB settings
  useEffect(() => {
    const savedWhatsappNumber = settingsData?.data?.whatsappNumber;
    if (typeof savedWhatsappNumber === "string" && savedWhatsappNumber.trim().length > 0) {
      setWhatsappNumber(savedWhatsappNumber);
    } else {
      setWhatsappNumber("");
    }
  }, [settingsData]);

  // Smooth zoom handler - Fixed calculation
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // 🆕 Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🆕 Prevent body scroll when modal is open
  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen]);

  // Handle add to cart
  const handleAddToCart = async () => {
    // CRITICAL: Check user authentication FIRST
    if (!user) {
      console.log("User not authenticated - showing sign-in prompt");
      toast.error(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base mb-1">Sign In Required</div>
                <div className="text-sm text-gray-600">Please sign in to add items to your cart and continue shopping</div>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push("/auth");
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </button>
          </div>
        ),
        { 
          duration: 8000,
          style: {
            minWidth: "320px",
            maxWidth: "400px",
            background: "white",
            padding: "8px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          },
          icon: null, // Remove default icon
        }
      );
      return; // STOP HERE - do NOT proceed to API call
    }

    // User is authenticated - proceed with adding to cart
    console.log("User authenticated - adding to cart");
    
    try {
      const cartData = {
        product: product._id,
        quantity: quantity,
      };

      const result = await addToCart(cartData);
      if (result?.data?.acknowledgement) {
        toast.success(result?.data?.description || "Added to cart successfully!");
      } else if (result?.error) {
        toast.error(result?.error?.data?.description || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  // Handle add to favorites
  const handleAddToFavorite = async () => {
    // CRITICAL: Check user authentication FIRST
    if (!user) {
      console.log("User not authenticated - showing sign-in prompt for favorites");
      toast.error(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base mb-1">Sign In Required</div>
                <div className="text-sm text-gray-600">Please sign in to save your favorite items and access them anytime</div>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push("/auth");
              }}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </button>
          </div>
        ),
        { 
          duration: 8000,
          style: {
            minWidth: "320px",
            maxWidth: "400px",
            background: "white",
            padding: "8px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          },
          icon: null, // Remove default icon
        }
      );
      return; // STOP HERE - do NOT proceed to API call
    }

    // User is authenticated - proceed with adding to favorites
    console.log("User authenticated - adding to favorites");
    
    try {
      const result = await addToFavorite({ product: product._id });
      if (result?.data?.acknowledgement) {
        toast.success(result?.data?.description || (isFavorite ? "Removed from favorites" : "Added to favorites"));
      } else if (result?.error) {
        toast.error(result?.error?.data?.description || "Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  // WhatsApp message handler
  const handleWhatsAppChat = () => {
    if (!whatsappNumber) {
      toast.error('WhatsApp number not configured. Please contact the administrator.');
      return;
    }

    const message = encodeURIComponent(
      `Hello! I'm interested in this product:\n\n` +
      `*${product.title}*\n` +
      `Price: $${product.price}\n` +
      `Link: ${window.location.href}\n\n` +
      `Can you provide more information?`
    );

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Calculate average rating
  const averageRating = product.reviews?.length > 0 
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
    : 0;

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <AiFillStar key={i} className="w-4 h-4 text-yellow-400" />
        ) : (
          <AiOutlineStar key={i} className="w-4 h-4 text-gray-300" />
        )
      );
    }
    return stars;
  };

  // 🆕 Handle image click - open modal on mobile, zoom on desktop
  const handleImageClick = () => {
    if (isMobile) {
      setIsImageModalOpen(true);
    }
  };

  // 🆕 Render modal using portal (professional approach)
  const renderModal = () => {
    if (!isImageModalOpen) return null;

    const modalContent = (
      <div 
        className="fixed inset-0 bg-black z-[9999]"
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          touchAction: 'pan-x pan-y',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm flex-shrink-0">
          <div className="text-white text-sm font-medium">
            {selectedImage + 1} / {allImages.length}
          </div>
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="bg-white/30 hover:bg-white/40 text-white p-2.5 rounded-full transition-colors shadow-lg border border-white/20"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Main Image Area */}
        <div 
          className="relative flex items-center justify-center"
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={allImages[selectedImage]?.url}
            alt={product.title}
            className="max-w-full max-h-full object-contain"
            style={{
              imageRendering: 'high-quality',
            }}
          />

          {/* Navigation Arrows - Only show if multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </button>
              
              <button
                onClick={() => setSelectedImage(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {allImages.length > 1 && (
          <div className="bg-black/50 backdrop-blur-sm p-4 overflow-x-auto flex-shrink-0">
            <div className="flex space-x-2 min-w-min">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                    selectedImage === index 
                      ? 'border-white' 
                      : 'border-white/30'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    // Render to body using portal
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
  };

  if (productLoading) {
  return (
    <Main>
      <Container>
          <div className="animate-pulse py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
                </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
          </div>
        </Container>
      </Main>
    );
  }

  if (!product._id) {
    return (
      <Main>
        <Container>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <button
              onClick={() => router.push('/collections/all')}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </button>
        </div>
      </Container>
    </Main>
    );
  }

  // In Approach 2, stock is directly decreased when added to cart
  const availableStock = product.stock || 0;

  return (
    <>
      <Main>
        <Container className="py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button onClick={() => router.push('/')} className="hover:text-gray-900">Home</button>
            <span>/</span>
            <button onClick={() => router.push('/collections/all')} className="hover:text-gray-900">Products</button>
            <span>/</span>
            <button onClick={() => router.push(`/collections/all?category=${product.category?._id}`)} className="hover:text-gray-900">
              {product.category?.title}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Images */}
            <div className="space-y-4">
              {/* Image Display - Desktop Zoom / Mobile Modal */}
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                <div 
                  className={`relative w-full h-full group ${
                    isMobile ? 'cursor-pointer active:scale-95' : 'cursor-zoom-in'
                  } transition-transform duration-150`}
                  onClick={handleImageClick}
                  onMouseEnter={() => !isMobile && setIsZooming(true)}
                  onMouseLeave={() => !isMobile && setIsZooming(false)}
                  onMouseMove={!isMobile ? handleMouseMove : undefined}
                >
                  {/* Main Image */}
                  <Image
                    src={allImages[selectedImage]?.url}
                    alt={product.title}
                    fill
                    className={`object-contain p-4 transition-opacity duration-200 ${
                      !isMobile && isZooming ? 'opacity-0' : 'opacity-100'
                    }`}
                    priority
                  />
                  
                  {/* Desktop Zoom Overlay - Smooth and responsive */}
                  {!isMobile && isZooming && (
                    <div 
                      className="absolute inset-0 bg-no-repeat pointer-events-none"
                      style={{
                        backgroundImage: `url(${allImages[selectedImage]?.url})`,
                        backgroundSize: '250%',
                        backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                        transition: 'background-position 0.1s ease-out',
                      }}
                    />
                  )}
                  
                  {/* Zoom Icon */}
                  <div className={`absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full transition-opacity ${
                    isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <FiZoomIn className="w-5 h-5" />
                  </div>

                  {/* Product Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20">
                    {product.productStatus && Array.isArray(product.productStatus) && product.productStatus.map((status) => {
                      const statusConfig = {
                        featured: { label: "Featured", color: "bg-blue-500" },
                        trending: { label: "Trending", color: "bg-green-500" },
                        "best-seller": { label: "Best Seller", color: "bg-red-500" },
                      };
                      const config = statusConfig[status];
                      if (!config) return null;
                      
                      return (
                        <span key={status} className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                          {config.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-black shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-6">
              {/* Title and Brand */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {product.brand?.logo && (
                    <Image
                      src={product.brand.logo.url}
                      alt={product.brand.title}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <span className="text-blue-600 font-medium text-sm">{product.brand?.title}</span>
                  <MdVerified className="w-4 h-4 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-600 ml-2">
                    {averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Stock Status</h3>
                  {availableStock > 5 ? (
                    <p className="text-green-600 font-medium transition-all duration-300">
                      ✓ In Stock
                    </p>
                  ) : availableStock > 0 ? (
                    <p className="text-orange-600 font-medium transition-all duration-300 animate-pulse">
                      ⚠ Low Stock
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold transition-all duration-300">
                      ✗ Out of Stock
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              </div>

                   {/* Action Buttons */}
                   <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0 || addingToCart}
                  className={`w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${availableStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                {/* WhatsApp Chat Button - NEW */}
                {whatsappNumber && (
                  <button
                    onClick={handleWhatsAppChat}
                    className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BsWhatsapp className="text-2xl" />
                    <span>Chat on WhatsApp</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToFavorite}
                    disabled={addingToFavorite}
                    className="flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isFavorite ? (
                      <BsHeartFill className="w-5 h-5 text-red-500" />
                    ) : (
                      <BsHeart className="w-5 h-5" />
                    )}
                    <span className="font-medium">Favorite</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiShare2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>


              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Color: <span className="font-normal">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor?.name === color.name 
                            ? 'border-gray-900 scale-110' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex?.startsWith('#') ? color.hex : `#${color.hex}` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.variations?.sizes && product.variations.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.variations.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Specifications */}
              {product.variations?.customAttributes && product.variations.customAttributes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variations.customAttributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{attr.name}:</span>
                        <span className="text-sm font-medium">{attr.value}{attr.unit}</span>
                      </div>
                    ))}
                  </div>
                    </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock === 0 
                      ? 'Out of stock' 
                      : product.stock <= 5 
                        ? 'Limited stock available' 
                        : 'Available'
                    }
                  </span>
                </div>
              </div>

         
          

              {/* Description */}
              {product.description && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this item</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                  <div className="space-y-4">
                    {product.features.map((feature, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
                        <ul className="space-y-1">
                          {feature.content?.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-700 flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Products You May Like Section - ADD THIS BEFORE THE CLOSING DIVS */}
          {product && Object.keys(product).length > 0 && (
            <ProductsYouMayLike 
              categoryId={product.category?._id}
              brandId={product.brand?._id}
              currentProductId={product._id}
            />
          )}
        </Container>
      </Main>

      {/* 🆕 Modal rendered via Portal - REMOVE the old modal code and add this */}
      {renderModal()}
    </>
  );
};

export default ProductDetail;
