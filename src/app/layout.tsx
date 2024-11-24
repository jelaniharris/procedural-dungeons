import '@/app/global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TrpcProvider from './_trpc/TrpcProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tower of Greed',
  generator: 'Next.js',
  metadataBase: new URL('https://tower-of-greed.vercel.app'),
  applicationName: 'Next.js',
  keywords: [
    'dungeon',
    'crawler',
    'game',
    'turn-based',
    'browser',
    'nextjs',
    'threejs',
    'react',
    'typescript',
    'javascript',
  ],
  creator: 'Jelani Harris',
  description:
    'A turn-based dungeon crawler you can play in your browser. Created by Jelani Harris.',
  category: 'Games',
  manifest: '/images/favicon/site.webmanifest',
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
        url: 'https://tower-of-greed.vercel.app/images/logo/logo.png',
        width: 1200,
        height: 630,
        alt: 'Tower of Greed',
      },
    ],
  },
  robots: 'index, follow',
};
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
      <GoogleAnalytics gaId="G-Q65C3YRDQN" />
    </html>
  );
};

export default RootLayout;
