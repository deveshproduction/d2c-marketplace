import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechDiscover - Find the Best Electronics from D2C Brands',
  description: 'Discover curated electronics from innovative direct-to-consumer brands. Explore Framework, Nothing, Teenage Engineering, and more.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
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
