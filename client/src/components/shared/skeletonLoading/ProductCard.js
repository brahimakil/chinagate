/**
 * Title: Write a program using JavaScript on ProductCard
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

const ProductCard = () => {
  return (
    <section className="flex flex-col gap-y-2 sm:gap-y-3 md:gap-y-4 p-2 sm:p-3 md:p-4">
      <div className="h-[120px] sm:h-[150px] md:h-[200px] bg-gray-200 animate-pulse rounded" />
      <div className="flex flex-col gap-y-1.5 sm:gap-y-2 md:gap-y-2.5">
        <div className="flex flex-row gap-x-1 sm:gap-x-2">
          <div className="h-3 sm:h-4 w-16 sm:w-24 rounded-primary bg-gray-200 animate-pulse" />
          <div className="h-3 sm:h-4 w-16 sm:w-24 rounded-primary bg-gray-200 animate-pulse" />
        </div>
        <div className="h-4 sm:h-5 md:h-6 rounded bg-gray-200 animate-pulse" />
        <div className="flex flex-row justify-between">
          <div className="h-3 sm:h-4 w-16 sm:w-24 rounded-primary bg-gray-200 animate-pulse" />
          <div className="h-3 sm:h-4 w-12 sm:w-16 rounded-primary bg-gray-200 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
