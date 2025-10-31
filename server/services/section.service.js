/**
 * Title: Section Service for Dynamic Homepage Management
 * Author: China Gate Team
 * Date: January 2025
 */

const Section = require("../models/section.model");
const Product = require("../models/product.model"); // ADD THIS

/* add new section */
exports.addSection = async (req, res) => {
  const { 
    name, displayName, description, filterKey, icon, color, seasons,
    sectionCategory, adText, adTextColor, adOverlayColor, adButtonText, 
    adButtonLink, adButtonLinkType, adButtonProductId,
    adButtonBackgroundColor, adButtonTextColor, // 🆕 Add these
    bannerOverlayColor, bannerTextColor
  } = req.body;

  console.log('🆕 Creating section with category:', sectionCategory); // Debug

  const section = new Section({
    name,
    displayName,
    description: description || "",
    type: "custom",
    filterKey: filterKey || name.toLowerCase().replace(/\s+/g, "-"),
    icon: icon || "🔥",
    color: color || "#3B82F6",
    seasons: seasons ? JSON.parse(seasons) : [],
    order: await Section.countDocuments(),
    
    // 🆕 Advertisement fields
    sectionCategory: sectionCategory || "product",
    adText: adText || "",
    adTextColor: adTextColor || "#FFFFFF",
    adOverlayColor: adOverlayColor || "rgba(0, 0, 0, 0.5)",
    adButtonText: adButtonText || "Shop Now",
    adButtonLink: adButtonLink || "/collections/all",
    adButtonLinkType: adButtonLinkType || "page",
    adButtonProductId: adButtonProductId || "",
    adButtonBackgroundColor: adButtonBackgroundColor || "#FFFFFF", // 🆕
    adButtonTextColor: adButtonTextColor || "#000000", // 🆕
    
    // Banner fields
    bannerOverlayColor: bannerOverlayColor || "rgba(0, 0, 0, 0.5)",
    bannerTextColor: bannerTextColor || "#FFFFFF",
  });

  // Handle banner image upload
  if (req.files && req.files.bannerImage) {
    section.bannerImage = {
      url: req.files.bannerImage[0].path,
      public_id: req.files.bannerImage[0].filename,
    };
  }

  // 🆕 Handle ad image upload
  if (req.files && req.files.adImage) {
    section.adImage = {
      url: req.files.adImage[0].path,
      public_id: req.files.adImage[0].filename,
    };
  }

  await section.save();

  console.log('✅ Section saved with category:', section.sectionCategory); // Debug

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "Section created successfully",
    data: section,
  });
};

/* get all sections */
exports.getSections = async (res) => {
  const sections = await Section.find().sort({ order: 1 });

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Sections fetched successfully",
    data: sections,
  });
};

/* get a section */
exports.getSection = async (req, res) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Section not found",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Section fetched successfully",
    data: section,
  });
};

/* update section */
exports.updateSection = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  console.log('📝 Update section request:', {
    id,
    bodyKeys: Object.keys(req.body),
    files: req.files ? Object.keys(req.files) : 'none'
  });

  // Parse isActive to boolean if it exists
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
  }

  // Parse seasons if it exists
  if (updateData.seasons && typeof updateData.seasons === 'string') {
    updateData.seasons = JSON.parse(updateData.seasons);
  }

  // 🔥 STEP 1: Get the old section BEFORE updating
  const oldSection = await Section.findById(id);
  
  if (!oldSection) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Section not found",
    });
  }

  console.log('Old section filterKey:', oldSection.filterKey);
  console.log('New filterKey:', updateData.filterKey);
  console.log('IsActive update:', updateData.isActive);

  // 🖼️ Handle banner image upload (for product sections)
  if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
    console.log('🖼️ Updating bannerImage...');
    console.log('📁 File details:', {
      path: req.files.bannerImage[0].path,
      filename: req.files.bannerImage[0].filename,
      size: req.files.bannerImage[0].size
    });
    updateData.bannerImage = {
      url: req.files.bannerImage[0].path,
      public_id: req.files.bannerImage[0].filename,
    };
  }

  // 🖼️ Handle ad image upload (for advertisement sections)
  if (req.files && req.files.adImage && req.files.adImage[0]) {
    console.log('🖼️ Updating adImage...');
    console.log('📁 File details:', {
      path: req.files.adImage[0].path,
      filename: req.files.adImage[0].filename,
      size: req.files.adImage[0].size
    });
    updateData.adImage = {
      url: req.files.adImage[0].path,
      public_id: req.files.adImage[0].filename,
    };
  }

  // 🔥 STEP 2: Update the section
  const section = await Section.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  console.log('✅ Section updated successfully!');
  console.log('📊 Section details:', {
    id: section._id,
    filterKey: section.filterKey,
    hasAdImage: !!section.adImage?.url,
    adImageUrl: section.adImage?.url || 'none',
    hasBannerImage: !!section.bannerImage?.url,
    bannerImageUrl: section.bannerImage?.url || 'none',
  });

  // 🔥 STEP 3: If filterKey changed, update all related products
  if (updateData.filterKey && updateData.filterKey !== oldSection.filterKey) {
    console.log(`\n🔄 FilterKey is changing!`);
    console.log(`   Old: "${oldSection.filterKey}"`);
    console.log(`   New: "${updateData.filterKey}"`);
    
    try {
      // Find all products that have the old filterKey
      const productsToUpdate = await Product.find({
        productStatus: { $in: [oldSection.filterKey] }
      });
      
      console.log(`\n📦 Found ${productsToUpdate.length} products to update`);
      
      if (productsToUpdate.length > 0) {
        // Update each product
        for (const product of productsToUpdate) {
          console.log(`   - Updating product: ${product.title}`);
          console.log(`     Old productStatus:`, product.productStatus);
          
          // Replace old filterKey with new one in the array
          const updatedStatus = product.productStatus.map(status => 
            status === oldSection.filterKey ? updateData.filterKey : status
          );
          
          console.log(`     New productStatus:`, updatedStatus);
          
          await Product.findByIdAndUpdate(product._id, {
            productStatus: updatedStatus
          });
        }
        
        console.log(`\n✅ Successfully updated ${productsToUpdate.length} products!`);
      } else {
        console.log(`\n⚠️ No products found with filterKey "${oldSection.filterKey}"`);
      }
    } catch (error) {
      console.error('\n❌ Error updating products:', error);
    }
  } else {
    console.log('\nℹ️ FilterKey unchanged, skipping product updates');
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Section and related products updated successfully",
    data: section,
  });
};

/* delete section */
exports.deleteSection = async (req, res) => {
  const { id } = req.params;

  const section = await Section.findById(id);

  if (!section) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Section not found",
    });
  }

  // Don't allow deleting built-in sections
  if (section.type === "built-in") {
    return res.status(403).json({
      acknowledgement: false,
      message: "Forbidden",
      description: "Cannot delete built-in sections. You can hide them instead.",
    });
  }

  await Section.findByIdAndDelete(id);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Section deleted successfully",
  });
};

/* reorder sections */
exports.reorderSections = async (req, res) => {
  const { sections } = req.body; // Array of { id, order }

  const updatePromises = sections.map(({ id, order }) =>
    Section.findByIdAndUpdate(id, { order })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Sections reordered successfully",
  });
};
