const System = require("../models/system.model");
const remove = require("../utils/remove.util");

/* get system settings */
exports.getSettings = async (req, res) => {
  let settings = await System.findOne();
  if (!settings) {
    settings = await System.create({ 
      whatsappNumber: "",
      homePageBanner: { 
        image: { url: "", public_id: "" }, 
        overlayColor: "rgba(0, 0, 0, 0.5)", 
        textColor: "#FFFFFF",
        badge: "WELCOME TO OUR STORE",
        title: "🏪 Welcome to China Gate",
        subtitle: "Your One-Stop Shop for Quality Products",
        description: "Discover amazing products curated just for you. Shop with confidence!",
      },
      categoriesPageBanner: { 
        image: { url: "", public_id: "" }, 
        overlayColor: "rgba(0, 0, 0, 0.5)", 
        textColor: "#FFFFFF",
        badge: "SHOP BY CATEGORY",
        title: "📂 Browse Categories",
        subtitle: "Explore Our Product Categories",
        description: "Find exactly what you're looking for by browsing our organized categories",
      },
      brandsPageBanner: { 
        image: { url: "", public_id: "" }, 
        overlayColor: "rgba(0, 0, 0, 0.5)", 
        textColor: "#FFFFFF",
        badge: "SHOP BY BRAND",
        title: "🏷️ Browse Brands",
        subtitle: "Shop Your Favorite Brands",
        description: "Discover products from the world's leading brands",
      },
      allProductsPageBanner: { 
        image: { url: "", public_id: "" }, 
        overlayColor: "rgba(0, 0, 0, 0.5)", 
        textColor: "#FFFFFF",
        badge: "ALL PRODUCTS",
        title: "📦 All Products",
        subtitle: "Complete Collection",
        description: "Browse our entire product catalog",
      },
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "System settings fetched successfully",
    data: settings,
  });
};

/* update system settings */
exports.updateSettings = async (req, res) => {
  const { 
    whatsappNumber,
    // Home page
    homePageOverlayColor, homePageTextColor, homePageBadge, homePageTitle, homePageSubtitle, homePageDescription,
    // Categories page
    categoriesPageOverlayColor, categoriesPageTextColor, categoriesPageBadge, categoriesPageTitle, categoriesPageSubtitle, categoriesPageDescription,
    // Brands page
    brandsPageOverlayColor, brandsPageTextColor, brandsPageBadge, brandsPageTitle, brandsPageSubtitle, brandsPageDescription,
    // All products page
    allProductsPageOverlayColor, allProductsPageTextColor, allProductsPageBadge, allProductsPageTitle, allProductsPageSubtitle, allProductsPageDescription,
  } = req.body;

  console.log('📝 Updating system settings');
  console.log('📁 Files uploaded:', req.files);

  // Get existing settings
  let settings = await System.findOne();
  if (!settings) {
    settings = new System();
  }

  // Update WhatsApp
  settings.whatsappNumber = whatsappNumber || "";

  // Helper function to update banner
  const updateBanner = async (bannerField, imageFieldName, overlayColor, textColor, badge, title, subtitle, description) => {
    if (!settings[bannerField]) {
      settings[bannerField] = { image: { url: "", public_id: "" }, overlayColor: "rgba(0, 0, 0, 0.5)", textColor: "#FFFFFF" };
    }

    // Update colors and text
    if (overlayColor) settings[bannerField].overlayColor = overlayColor;
    if (textColor) settings[bannerField].textColor = textColor;
    if (badge) settings[bannerField].badge = badge;
    if (title) settings[bannerField].title = title;
    if (subtitle) settings[bannerField].subtitle = subtitle;
    if (description) settings[bannerField].description = description;

    // Handle image upload
    if (req.files && req.files[imageFieldName] && req.files[imageFieldName][0]) {
      console.log(`🖼️ Uploading ${imageFieldName}...`);
      
      // Delete old image if exists
      if (settings[bannerField].image?.public_id) {
        await remove(settings[bannerField].image.public_id);
      }

      // Save new image
      const file = req.files[imageFieldName][0];
      settings[bannerField].image = {
        url: file.path,
        public_id: file.filename,
      };
    }
  };

  // Update all banners
  await updateBanner('homePageBanner', 'homePageImage', homePageOverlayColor, homePageTextColor, homePageBadge, homePageTitle, homePageSubtitle, homePageDescription);
  await updateBanner('categoriesPageBanner', 'categoriesPageImage', categoriesPageOverlayColor, categoriesPageTextColor, categoriesPageBadge, categoriesPageTitle, categoriesPageSubtitle, categoriesPageDescription);
  await updateBanner('brandsPageBanner', 'brandsPageImage', brandsPageOverlayColor, brandsPageTextColor, brandsPageBadge, brandsPageTitle, brandsPageSubtitle, brandsPageDescription);
  await updateBanner('allProductsPageBanner', 'allProductsPageImage', allProductsPageOverlayColor, allProductsPageTextColor, allProductsPageBadge, allProductsPageTitle, allProductsPageSubtitle, allProductsPageDescription);

  // Save
  await settings.save();

  console.log('✅ System settings updated');

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "System settings updated successfully",
    data: settings,
  });
};