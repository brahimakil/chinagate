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
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+961");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: settingsData, isSuccess, refetch } = useGetSystemSettingsQuery();
  const [updateSettings, { isLoading: savingSettings }] = useUpdateSystemSettingsMutation();

  // Load seasons from localStorage only (unchanged)
  useEffect(() => {
    const savedSeasons = localStorage.getItem('homePageSeasons');
    if (savedSeasons) {
      setSelectedSeasons(JSON.parse(savedSeasons));
    } else {
      setSelectedSeasons(['winter']);
    }
  }, []);

  // Load WhatsApp number from DB whenever data changes
  useEffect(() => {
    console.log("🔍 WhatsApp useEffect triggered:");
    console.log("  - isSuccess:", isSuccess);
    console.log("  - settingsData:", settingsData);
    console.log("  - settingsData?.data:", settingsData?.data);
    console.log("  - whatsappNumber from DB:", settingsData?.data?.whatsappNumber);

    if (!isSuccess || !settingsData?.data) {
      console.log("❌ Early return - no success or no data");
      return;
    }

    const dbNumber = (settingsData.data.whatsappNumber || "").trim();
    console.log("📱 Processing DB number:", `"${dbNumber}"`);
    
    if (dbNumber.length > 0) {
      // Extract country code and phone number - FIXED REGEX
      // Look for known country codes first
      let code = "+961"; // default
      let phone = dbNumber;
      
      const countryCodes = ["+961", "+1", "+44", "+971", "+966", "+20"];
      
      for (const countryCode of countryCodes) {
        if (dbNumber.startsWith(countryCode)) {
          code = countryCode;
          phone = dbNumber.substring(countryCode.length).trim();
          break;
        }
      }
      
      console.log("✅ Setting WhatsApp from DB:");
      console.log("  - Country Code:", code);
      console.log("  - Phone:", phone);
      
      setWhatsappCountryCode(code);
      setWhatsappPhone(phone);
    } else {
      console.log("🔄 No number in DB - resetting to defaults");
      setWhatsappCountryCode("+961");
      setWhatsappPhone("");
    }
  }, [isSuccess, settingsData]);

  // Debug state changes
  useEffect(() => {
    console.log("📊 State Update - whatsappCountryCode:", whatsappCountryCode);
  }, [whatsappCountryCode]);

  useEffect(() => {
    console.log("📊 State Update - whatsappPhone:", whatsappPhone);
  }, [whatsappPhone]);

  const handleSeasonToggle = (seasonValue) => {
    setSelectedSeasons(prev => {
      if (prev.includes(seasonValue)) {
        return prev.filter(s => s !== seasonValue);
      } else {
        return [...prev, seasonValue];
      }
    });
  };

  const handleSaveSettings = () => {
    setIsLoading(true);

    // Save seasons to localStorage
    localStorage.setItem('homePageSeasons', JSON.stringify(selectedSeasons));

    // Save WhatsApp number to DB (empty string if no phone)
    const payloadNumber = whatsappPhone.trim() 
      ? `${whatsappCountryCode}${whatsappPhone}` 
      : "";

    console.log("💾 Saving WhatsApp number:");
    console.log("  - Country Code:", whatsappCountryCode);
    console.log("  - Phone:", whatsappPhone);
    console.log("  - Complete payload:", payloadNumber);

    updateSettings({ whatsappNumber: payloadNumber })
      .unwrap()
      .then((response) => {
        console.log("✅ Save successful, response:", response);
        setIsLoading(false);
        toast.success('Settings saved successfully!');
        
        // Force refetch to get fresh data
        console.log("🔄 Forcing refetch...");
        refetch();
      })
      .catch((err) => {
        console.log("❌ Save failed:", err);
        setIsLoading(false);
        toast.error(err?.data?.description || 'Failed to save settings');
      });
  };

  // Calculate complete WhatsApp number for display
  const completeWhatsappNumber = whatsappPhone.trim() 
    ? `${whatsappCountryCode}${whatsappPhone}` 
    : "";

  const seasons = [
    { value: "spring", label: "Spring", icon: "🌸" },
    { value: "summer", label: "Summer", icon: "☀️" },
    { value: "autumn", label: "Autumn", icon: "🍂" },
    { value: "winter", label: "Winter", icon: "❄️" }
  ];

  const countryCodes = [
    { code: "+961", country: "Lebanon", flag: "🇱🇧" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
  ];

  return (
    <div className="space-y-6">
      {/* WhatsApp Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-3 mb-6">
          <BsWhatsapp className="text-3xl text-green-500" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">WhatsApp Configuration</h3>
            <p className="text-sm text-gray-600">Set your business WhatsApp number for product inquiries</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Country Code Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Code
            </label>
            <select
              value={whatsappCountryCode}
              onChange={(e) => setWhatsappCountryCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.country} ({country.code})
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Input - FIXED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (without country code)
            </label>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
              placeholder={whatsappPhone || "e.g., 71234567"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Full Number Preview - FIXED */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Complete WhatsApp Number:</p>
            <p className="text-lg font-semibold text-green-700">
              {completeWhatsappNumber || 'Not set'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This number will be used for "Chat on WhatsApp" button on product pages
            </p>
          </div>

          {/* Clear Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setWhatsappPhone('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Clear WhatsApp Number
            </button>
            {completeWhatsappNumber && (
              <a
                href={`https://wa.me/${completeWhatsappNumber.replace(/\+/g, '')}?text=Hello! I'm testing the WhatsApp integration.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <BsWhatsapp className="text-xl" />
                <span>Test WhatsApp Number</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Seasonal Products Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Seasonal Products</h3>
        <p className="text-sm text-gray-600 mb-6">Select which seasons to feature on your home page</p>
        
        {/* Season Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Spring */}
          <div
            className={`
              flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all
              ${selectedSeasons.includes('spring')
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onClick={() => handleSeasonToggle('spring')}
          >
            <div className="text-4xl mb-3">🌸</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Spring</div>
            
            {selectedSeasons.includes('spring') && (
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                Featured
              </div>
            )}
          </div>

          {/* Summer */}
          <div
            className={`
              flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all
              ${selectedSeasons.includes('summer')
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onClick={() => handleSeasonToggle('summer')}
          >
            <div className="text-4xl mb-3">☀️</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Summer</div>
            
            {selectedSeasons.includes('summer') && (
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </div>
            )}
          </div>

          {/* Autumn */}
          <div
            className={`
              flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all
              ${selectedSeasons.includes('autumn')
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onClick={() => handleSeasonToggle('autumn')}
          >
            <div className="text-4xl mb-3">🍂</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Autumn</div>
            
            {selectedSeasons.includes('autumn') && (
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Featured
              </div>
            )}
          </div>

          {/* Winter */}
          <div
            className={`
              flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all
              ${selectedSeasons.includes('winter')
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onClick={() => handleSeasonToggle('winter')}
          >
            <div className="text-4xl mb-3">❄️</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Winter</div>
            
            {selectedSeasons.includes('winter') && (
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
          <p className="text-sm text-gray-600">
            {selectedSeasons.length > 0 
              ? `Products for ${selectedSeasons.map(s => seasons.find(season => season.value === s)?.label).join(', ')} will be featured at the top of the home page.`
              : 'No seasons selected. All products will display normally without seasonal highlighting.'
            }
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
}

export default Page;