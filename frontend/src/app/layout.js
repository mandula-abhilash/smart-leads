import { Geist, Geist_Mono } from "next/font/google";
import { BusinessProvider } from "@/contexts/BusinessContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VISDAK - Smart Leads",
  description: "A hexagon-based business lead generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BusinessProvider>{children}</BusinessProvider>
      </body>
    </html>
  );
}
