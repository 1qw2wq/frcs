import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vortex Command · Team 5419',
  description:
    'Match scouting, pit ops, and team central for FIRST Robotics — built for the people on the field.',
  openGraph: {
    title: 'Vortex Command · Team 5419',
    description:
      'Match scouting, pit ops, and team central for FIRST Robotics — built for the people on the field.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vortex Command · Team 5419',
    description:
      'Match scouting, pit ops, and team central for FIRST Robotics — built for the people on the field.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fraunces = soft serif display · Outfit = geometric sans · IBM Plex Mono = technical captions */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans text-slate-100 min-h-screen antialiased selection:bg-orange-400/30 selection:text-orange-50"
      >
        {children}
      </body>
    </html>
  );
}
