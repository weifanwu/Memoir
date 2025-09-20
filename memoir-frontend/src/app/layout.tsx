'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import Navbar from '../components/Navbar';
import PwaInit from '@/components/PwaInit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ServiceProvider>
          {/* The AuthProvider should be inside ServiceProvider to ensure auth context can access service URLs */}
          <AuthProvider>
            <PwaInit />
            <Navbar />
            {children}
          </AuthProvider>
        </ServiceProvider>
      </body>
    </html>
  );
}