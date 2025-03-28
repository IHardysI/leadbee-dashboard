import './globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';  
import { ruRU } from '@clerk/localizations'
import { Toaster } from "@/components/ui/toaster";
import logo from "/public/images/logo.jpg";

export const metadata = {
  title: 'LeadBee Dashboard',
  description: 'LeadBee адмінка',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ruRU}>
      <html lang="ru" suppressHydrationWarning>
        <head>
          <title>LeadBee Dashboard</title>
          <link rel="icon" href={logo.src} />
        </head>
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
