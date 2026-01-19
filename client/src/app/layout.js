import Auth from "./auth";
import Providers from "./providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/components/shared/BottomNav";

export const metadata = {
  metadataBase: new URL("https://chinadealslb.com"),
  title: "China Deals LB - Your Premium Shopping Destination",
  description:
    "Discover amazing deals on quality products at China Deals LB. Shop electronics, fashion, home goods and more with fast shipping to Lebanon.",
  openGraph: {
    title: "China Deals LB - Your Premium Shopping Destination",
    description:
      "Discover amazing deals on quality products at China Deals LB. Shop electronics, fashion, home goods and more with fast shipping to Lebanon.",
    url: "https://chinadealslb.com",
    siteName: "China Deals LB",
    images: "/og.png",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@chinadealslb",
    title: "China Deals LB - Your Premium Shopping Destination",
    description:
      "Discover amazing deals on quality products at China Deals LB. Shop electronics, fashion, home goods and more with fast shipping to Lebanon.",
    image: "/og.png",
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
