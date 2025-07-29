'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '../components/Navbar';
import PwaInit from '@/components/PwaInit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AuthProvider>
          <PwaInit />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}