import Navbar from '../components/Navbar';  // 引入 Navbar 组件
import PwaInit from '@/components/PwaInit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <PwaInit />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
