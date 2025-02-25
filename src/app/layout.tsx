import './globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';  
import { ruRU } from '@clerk/localizations'
import { Toaster } from "@/components/ui/toaster";

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
      <html lang="ru">
        <head />
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
