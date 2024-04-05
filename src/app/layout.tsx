import '@/app/global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Provider from './_trpc/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tower of Greed',
  generator: 'Next.js',
  applicationName: 'Next.js',
  keywords: [
    'dungeon',
    'crawler',
    'game',
    'browser',
    'next.js',
    'react',
    'typescript',
    'javascript',
  ],
  creator: 'Jelani Harris',
  description:
    'A dungeon crawler you can play in your browser. Created by Jelani Harris.',
  category: 'Games',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Tower of Greed',
    url: 'https://tower-of-greed.vercel.app/',
    title: 'Tower of Greed',
    alternateLocale: ['en_US'],
    description:
      'A dungeon crawler you can play in your browser. Created by Jelani Harris.',
    images: [
      {
        url: 'https://tower-of-greed.vercel.app/textures/Tower of Greed Logo.png',
        width: 1200,
        height: 630,
        alt: 'Tower of Greed',
      },
    ],
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
      <GoogleAnalytics gaId="G-Q65C3YRDQN" />
    </html>
  );
}
