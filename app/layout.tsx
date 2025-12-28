import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://d2c-marketplace-demo.vercel.app'), // Placeholder URL for resolving assets
  title: 'D2Cstore | Discovery',
  description: 'The world\'s most trusted universal marketplace for verified Direct-to-Consumer products. Discovery curated favorites directly from brands.',
  openGraph: {
    images: [
      {
        url: '/og-image.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: '/og-image.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
