import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FRC Telemetry & Scouting Command Center',
  description: 'Full-featured FIRST Robotics Competition (FRC) dashboard with dual-key access control for administrators and members, live match analysis, pit scouting, SQL Server backend connector, picklist builder, and robot telemetry.',
  openGraph: {
    title: 'FRC Telemetry & Scouting Command Center',
    description: 'Full-featured FIRST Robotics Competition (FRC) dashboard with dual-key access control for administrators and members, live match analysis, pit scouting, SQL Server backend connector, picklist builder, and robot telemetry.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FRC Telemetry & Scouting Command Center',
    description: 'Full-featured FIRST Robotics Competition (FRC) dashboard with dual-key access control for administrators and members, live match analysis, pit scouting, SQL Server backend connector, picklist builder, and robot telemetry.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
