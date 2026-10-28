import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/componenets/navbar";


export const metadata: Metadata = {
  title: "JobBridge",
  description: "Find jobs and connect with employers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 bg-white 
                px-6 py-6 text-center text-sm text-gray-500">
            © 2026 JobBridge. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}