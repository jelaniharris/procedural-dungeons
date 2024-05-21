import '@/app/global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Provider from './_trpc/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tower of Greed',
  description:
    'A dungeon crawler you can play in browser. Created by Jelani Harris.',
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
