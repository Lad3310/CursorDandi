'use client';

import { useState } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import ClientSidebar from './dashboards/ClientSidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <body>
        <div className="flex min-h-screen">
          <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <header className="bg-white p-4 flex items-center">
              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              )}
            </header>
            <main className="flex-1 p-8 overflow-auto bg-gray-100">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
