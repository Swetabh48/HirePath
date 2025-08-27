import type { Metadata } from "next";
import { Mona_Sans} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriTracker - AI-Powered Nutrition & Calorie Tracker",
  description: "Track your nutrition, plan meals, and achieve your fitness goals with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${monaSans.className} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster/>
      </body>
    </html>
  );
}
