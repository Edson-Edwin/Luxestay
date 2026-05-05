import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LuxeStay | Premium Rental Platform',
  description: 'Curated premium stays for the discerning traveler.',
  icons: {
    icon: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/villa/default/24px.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
