import type { Metadata, Viewport } from 'next';
import { Exo_2, JetBrains_Mono, Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Signal 626 | UFO Sightings Global Intelligence Platform',
  description:
    'Interactive global map of 150,000+ UFO sightings spanning 626 years (1400-2026).',
  keywords: ['UFO', 'sightings', 'NUFORC', 'map', 'Signal 626', 'UAP'],
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${exo2.variable} ${jetbrainsMono.variable} ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="bg-[#060B14] text-slate-200 antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
