/**
 * Title: Write a program using JavaScript on Product Service
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 11, November 2023
 */

/* internal import */
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Store = require("../models/store.model");
const Brand = require("../models/brand.model");
const remove = require("../utils/remove.util");
const Review = require("../models/review.model");
const User = require("../models/user.model");

/* add product information */
exports.addProduct = async (req, res) => {
  const { 
    features, variations, socialLinks, season, productStatus, isHidden, 
    enableColors, enableCustomSpecs, enableSocialLinks, enableStore,
    colorImageNames, // 🆕 Track which colors have images
    ...otherInformation 
  } = req.body;
  const { thumbnail, gallery, colorImages } = req.files || {};

  console.log('📝 Adding product with color images:', {
    colorImageNames: colorImageNames,
    colorImagesCount: colorImages?.length || 0
  });

  const productInformation = {
    ...otherInformation,
    thumbnail: {
      url: thumbnail[0].path,
      public_id: thumbnail[0].filename,
    },
    gallery: gallery.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })),
    features: JSON.parse(features || "[]"),
    variations: JSON.parse(variations || "{}"),
    socialLinks: socialLinks ? JSON.parse(socialLinks) : [],
    season: season ? JSON.parse(season) : ["all-season"],
    productStatus: productStatus ? JSON.parse(productStatus) : ["regular"],
    isHidden: isHidden === 'true',
    
    // Save toggle states
    enableColors: enableColors === 'true',
    enableCustomSpecs: enableCustomSpecs === 'true',
    enableSocialLinks: enableSocialLinks === 'true',
    enableStore: enableStore === 'true',
  };

  // 🆕 Attach images to colors
  if (productInformation.variations.colors && Array.isArray(productInformation.variations.colors)) {
    const colorNamesArray = Array.isArray(colorImageNames) ? colorImageNames : (colorImageNames ? [colorImageNames] : []);
    const colorImagesArray = colorImages || [];

    console.log('🎨 Processing color images:', {
      colorNames: colorNamesArray,
      imagesCount: colorImagesArray.length
    });

    productInformation.variations.colors = productInformation.variations.colors.map(color => {
      // Find the index of this color in colorImageNames
      const imageIndex = colorNamesArray.findIndex(name => name === color.name);
      
      if (imageIndex !== -1 && colorImagesArray[imageIndex]) {
        const imageFile = colorImagesArray[imageIndex];
        console.log(`✅ Attaching image to color: ${color.name}`);
        return {
          ...color,
          image: {
            url: imageFile.path,
            public_id: imageFile.filename,
          }
        };
      }
      
      return color;
    });

    // Save colors to top-level field
    productInformation.colors = productInformation.variations.colors;
  }

  const product = new Product(productInformation);
  await product.save();

  // Update store if provided
  if (otherInformation.store) {
    await Store.findByIdAndUpdate(otherInformation.store, {
      $push: { products: product._id },
    });
  }

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "Product created successfully with color images",
  });
};

/* get all products */
exports.getProducts = async (res) => {
  const products = await Product.find().populate([
    "category",
    "brand",
    "store",
    {
      path: "reviews",
      options: { sort: { updatedAt: -1 } },
      populate: [
        "reviewer",
        {
          path: "product",
          populate: ["brand", "category", "store"],
        },
      ],
    },
    "buyers",
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Products fetched successfully",
    data: products,
  });
};

/* get a single product */
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate([
    "category",
    "brand",
    "store",
    {
      path: "reviews",
      options: { sort: { updatedAt: -1 } },
      populate: [
        "reviewer",
        {
          path: "product",
          populate: ["brand", "category", "store"],
        },
      ],
    },
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Product fetched successfully",
    data: product,
  });
};

/* filtered products */
exports.getFilteredProducts = async (req, res) => {
  try {
    let filter = {};

    if (req.query.category != "null") {
      filter.category = req.query.category;
    }

    if (req.query.brand != "null") {
      filter.brand = req.query.brand;
    }

    if (req.query.store != "null") {
      filter.store = req.query.store;
    }

    const products = await Product.find(filter).populate([
      "category",
      "brand",
      "store",
    ]);

    res.status(200).json({
      acknowledgement: true,
      message: "Ok",
      description: "Filtered products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      acknowledgement: false,
      message: "Internal Server Error",
      description: "Failed to fetch filtered products",
      error: error.message,
    });
  }
};

/* update product information */
exports.updateProduct = async (req, res) => {
  const { 
    features, variations, socialLinks, season, productStatus, isHidden,
    enableColors, enableCustomSpecs, enableSocialLinks, enableStore,
    colorImageNames, // 🆕
    stock, // 🆕 Extract stock separately
    ...otherInformation 
  } = req.body;
  const { thumbnail, gallery, colorImages } = req.files || {};
  
  console.log('=== UPDATE PRODUCT START ===');
  console.log('Request body:', req.body);
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Product not found",
    });
  }

  const updateData = { ...otherInformation };

  // 🆕 Handle stock as increment/decrement instead of replacement
  if (stock !== undefined) {
    const stockChange = Number(stock);
    const newStock = (product.stock || 0) + stockChange;
    
    if (newStock < 0) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: `Cannot reduce stock by ${Math.abs(stockChange)}. Current stock is ${product.stock}`,
      });
    }
    
    updateData.stock = newStock;
    console.log(`📦 Stock update: ${product.stock} + (${stockChange}) = ${newStock}`);
  }

  // Handle thumbnail update
  if (!req.body.thumbnail && req.files && req.files.thumbnail?.length > 0) {
    console.log('Updating thumbnail...');
    remove(product.thumbnail.public_id);

    updateData.thumbnail = {
      url: req.files.thumbnail[0].path,
      public_id: req.files.thumbnail[0].filename,
    };
  }

  // Handle gallery update
  if (
    !req.body.gallery?.length > 0 &&
    req.files &&
    req.files.gallery?.length > 0
  ) {
    console.log('Updating gallery...');
    for (let i = 0; i < product.gallery.length; i++) {
      await remove(product.gallery[i].public_id);
    }

    updateData.gallery = req.files.gallery.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
  }

  // Handle JSON parsing safely
  updateData.features = JSON.parse(features || "[]");
  
  // Parse variations and extract colors
  const parsedVariations = JSON.parse(variations || "{}");
  updateData.variations = parsedVariations;
  
  // IMPORTANT: Extract colors from variations and set as separate field
  if (parsedVariations.colors && Array.isArray(parsedVariations.colors)) {
    updateData.colors = parsedVariations.colors;
  } else {
    updateData.colors = [];
  }
  
  updateData.socialLinks = socialLinks ? JSON.parse(socialLinks) : [];
  
  // Handle new fields
  updateData.season = season ? JSON.parse(season) : ["all-season"]; // Parse as array
  updateData.productStatus = productStatus ? JSON.parse(productStatus) : ["regular"]; // Parse as array
  updateData.isHidden = isHidden === 'true'; // Convert string to boolean

  // Save toggle states
  updateData.enableColors = enableColors === 'true';
  updateData.enableCustomSpecs = enableCustomSpecs === 'true';
  updateData.enableSocialLinks = enableSocialLinks === 'true';
  updateData.enableStore = enableStore === 'true';

  console.log('Saving toggle states:', {
    enableColors: updateData.enableColors,
    enableCustomSpecs: updateData.enableCustomSpecs,
    enableSocialLinks: updateData.enableSocialLinks,
    enableStore: updateData.enableStore,
  });

  console.log('Final updateData being sent to MongoDB:', JSON.stringify(updateData, null, 2));

  // 🆕 Handle color images
  if (updateData.variations.colors && Array.isArray(updateData.variations.colors)) {
    const colorNamesArray = Array.isArray(colorImageNames) ? colorImageNames : (colorImageNames ? [colorImageNames] : []);
    const colorImagesArray = colorImages || [];

    console.log('🎨 Processing color images for update:', {
      colorNames: colorNamesArray,
      imagesCount: colorImagesArray.length
    });

    // First, collect all old images that need to be deleted
    const imagesToDelete = [];
    
    updateData.variations.colors = updateData.variations.colors.map(color => {
      const imageIndex = colorNamesArray.findIndex(name => name === color.name);
      
      if (imageIndex !== -1 && colorImagesArray[imageIndex]) {
        const imageFile = colorImagesArray[imageIndex];
        
        // Check if the OLD product has an image for this color that needs deletion
        const oldColor = product.variations.colors?.find(c => c.name === color.name);
        if (oldColor?.image?.public_id) {
          imagesToDelete.push(oldColor.image.public_id);
        }
        
        return {
          ...color,
          image: {
            url: imageFile.path,
            public_id: imageFile.filename,
          }
        };
      }
      
      // Keep existing image from old product if no new image uploaded
      const oldColor = product.variations.colors?.find(c => c.name === color.name);
      if (oldColor?.image?.url) {
        return {
          ...color,
          image: oldColor.image
        };
      }
      
      return color;
    });

    // Delete old images after mapping
    for (const publicId of imagesToDelete) {
      console.log('🗑️ Deleting old color image:', publicId);
      await remove(publicId);
    }

    updateData.colors = updateData.variations.colors;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { runValidators: true, new: true }
  );

  console.log('Product after update:', JSON.stringify(updatedProduct, null, 2));

  // Update store if provided
  if (req.body.store) {
    console.log('Updating store with product...');
    await Store.findByIdAndUpdate(req.body.store, {
      $push: { products: updatedProduct._id },
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Product updated successfully",
    data: updatedProduct,
  });
  
  console.log('=== UPDATE PRODUCT COMPLETE ===');
};

/* delete product */
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  // delete product thumbnail & gallery
  if (product.thumbnail) {
    await remove(product.thumbnail.public_id);
  }

  if (product.gallery && product.gallery.length > 0) {
    for (let i = 0; i < product.gallery.length; i++) {
      await remove(product.gallery[i].public_id);
    }
  }

  // also delete from category, brand & store
  await Category.findByIdAndUpdate(product.category, {
    $pull: { products: product._id },
  });
  await Brand.findByIdAndUpdate(product.brand, {
    $pull: { products: product._id },
  });
  await Store.findByIdAndUpdate(product.store, {
    $pull: { products: product._id },
  });

  // delete this product from users products array
  await User.updateMany(
    { products: product._id },
    { $pull: { products: product._id } }
  );

  // delete reviews that belong to this product also remove those reviews from users reviews array
  await Review.deleteMany({ product: product._id });
  await User.updateMany(
    { reviews: { $in: product.reviews } },
    { $pull: { reviews: { $in: product.reviews } } }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Product deleted successfully",
  });
};
