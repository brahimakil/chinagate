/**
 * Title: Write a program using JavaScript on Niche
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
 * Date: 14, November 2023
 */

import React from "react";

const Niche = () => {
  return (
    <section className="border p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-primary flex flex-col gap-y-2 sm:gap-y-3 md:gap-y-4 bg-white">
      <div className="rounded h-[30px] w-[30px] sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px] bg-gray-200 border animate-pulse" />
      <div className="flex flex-col gap-y-1.5 sm:gap-y-2">
        <div className="border rounded h-5 sm:h-6 md:h-8 bg-gray-200 animate-pulse" />
        <div className="border rounded h-3 sm:h-4 md:h-5 bg-gray-200 animate-pulse" />
        <div className="flex flex-row gap-x-1 sm:gap-x-2">
          <div className="border rounded h-2 sm:h-3 flex-1 bg-gray-200 animate-pulse" />
          <div className="border rounded h-2 sm:h-3 flex-1 bg-gray-200 animate-pulse" />
          <div className="border rounded h-2 sm:h-3 flex-1 bg-gray-200 animate-pulse" />
          <div className="border rounded h-2 sm:h-3 flex-1 bg-gray-200 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Niche;