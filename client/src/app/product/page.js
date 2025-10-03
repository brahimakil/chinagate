/**
 * Title: Professional Product Detail Page
 * Author: China Gate Team
 * Date: 27, September 2025
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  
  // API calls
  const { data: productData, error: productError, isLoading: productLoading } = useGetProductQuery(id);
  const { data: favoritesData } = useGetFavoritesQuery();
  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation();
  const [addToFavorite, { isLoading: addingToFavorite }] = useAddToFavoriteMutation();
  const { data: settingsData } = useGetSystemSettingsQuery();
  
  const product = useMemo(() => productData?.data || {}, [productData]);
  const favorites = useMemo(() => favoritesData?.data || [], [favoritesData]);
  const isFavorite = favorites.some(fav => fav.product._id === product._id);
  
  // All images (thumbnail + gallery)
  const allImages = useMemo(() => {
    if (!product.thumbnail) return [];
    return [product.thumbnail, ...(product.gallery || [])];
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

  // Smooth zoom handler - NO LAG
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/auth");
      return;
    }

    try {
      const cartData = {
        product: product._id,
        quantity: quantity,
      };

      const result = await addToCart(cartData);
      if (result?.data?.success) {
        toast.success("Added to cart successfully!");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // Handle add to favorites
  const handleAddToFavorite = async () => {
    if (!user) {
      toast.error("Please login to add to favorites");
      router.push("/auth");
      return;
    }

    try {
      const result = await addToFavorite({ product: product._id });
      if (result?.data?.success) {
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch (error) {
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

  return (
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
            {/* Smooth Professional Zoom - NO LAG */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <div 
                className="relative w-full h-full cursor-zoom-in group"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Main Image - NO TRANSFORM, NO LAG */}
                <Image
                  src={allImages[selectedImage]?.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Zoom Overlay - This is where the magic happens */}
                {isZooming && (
                  <div 
                    className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      backgroundImage: `url(${allImages[selectedImage]?.url})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${(mousePos.x / 400) * 100}% ${(mousePos.y / 400) * 100}%`,
                    }}
                  />
                )}
                
                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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
              {/* Stock Status - FIXED */}
              {product.stock > 5 ? (
                <span className="text-green-600 text-sm font-medium">
                  In Stock
                </span>
              ) : product.stock > 0 ? (
                <span className="text-orange-600 text-sm font-medium">
                  Low Stock
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <span className="text-sm text-gray-500">Free shipping</span>
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
                      onClick={() => setSelectedColor(color)}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0 || quantity > product.stock}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 
                  ? "Out of Stock" 
                  : addingToCart 
                    ? "Adding..." 
                    : "Add to Cart"
                }
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

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <BsTruck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BsArrowReturnLeft className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">30-Day Returns</p>
                  <p className="text-sm text-gray-600">Easy return policy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BsShieldCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">2 Year Warranty</p>
                  <p className="text-sm text-gray-600">Full manufacturer warranty</p>
                </div>
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
          <ProductsYouMayLike currentProduct={product} />
        )}
      </Container>
    </Main>
  );
};

export default ProductDetail;
