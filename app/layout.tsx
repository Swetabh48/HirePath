import type { Metadata } from "next";
import { Mona_Sans} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "HirePath",
  description: "An AI-powered tool for preparation of mock interview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monaSans.className} antialiased pattern`}
      >
        {children}

        <Toaster/>
      </body>
    </html>
  );
}
