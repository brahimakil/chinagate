/**
 * Title: Write a program using JavaScript on Footer
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
 * Date: 17, October 2023
 */

"use client";

import React from "react";
import Container from "./Container";
import { IoAccessibilityOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const router = useRouter();
  const year = new Date().getFullYear();

  const sitemaps = [
 
 
   
  ];

  return (
    <footer className="footer-1 bg-gray-100 py-8 sm:py-12 m-6 p-6 rounded-xl">
      <div className="container mx-auto px-4 flex flex-col gap-y-10">
        <div className="flex md:flex-row md:flex-wrap md:justify-between flex-col gap-x-4 gap-y-8">
          {sitemaps?.map((sitemap, index) => (
            <div key={index} className="flex flex-col gap-y-3">
              <h2 className="text-2xl">{sitemap.name}</h2>
              <div className="flex flex-col gap-y-1.5">
                {sitemap?.paths?.map((path, index) => (
                  <Link key={index} href={path?.path} className="text-base">
                    {path?.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <hr />
        <p className="text-center">&copy; {year} China Gate. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
