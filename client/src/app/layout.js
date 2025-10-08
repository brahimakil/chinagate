import Auth from "./auth";
import Providers from "./providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/components/shared/BottomNav";

export const metadata = {
  metadataBase: new URL("https://canim-csr.vercel.app"),
  title: "Canim - Shop & eCommerce React Template",
  description:
    "Buy Canim - Shop & eCommerce Next.Js Template by Hasibul Islam. Canim | Shop & eCommerce React Template - a responsive React template. Canim is built with the latest Next.Js 13 App Directory",
  openGraph: {
    title: "Canim - Shop & eCommerce React Template",
    description:
      "Buy Canim - Shop & eCommerce Next.Js Template by Hasibul Islam. Canim | Shop & eCommerce React Template - a responsive React template. Canim is built with the latest Next.Js 13 App Directory",
    url: "https://canim-csr.vercel.app",
    siteName: "Canim Template",
    images:
      "https://github.com/devhasibulislam/canim-ecommerce/blob/master/client/public/og.png?raw=true",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devhasibulislam",
    title: "Canim - Shop & eCommerce React Template",
    description:
      "Buy Canim - Shop & eCommerce Next.Js Template by Hasibul Islam. Canim | Shop & eCommerce React Template - a responsive React template. Canim is built with the latest Next.Js 13 App Directory",
    image:
      "https://github.com/devhasibulislam/canim-ecommerce/blob/master/client/public/og.png?raw=true",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="pb-16 lg:pb-0">
        <Providers>
          <Auth>{children}</Auth>
          <Toaster />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
