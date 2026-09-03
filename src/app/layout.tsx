import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { SecurityBanner } from '../components/common/SecurityBanner';

export const metadata: Metadata = {
  title: 'CASETRACE | Secure Digital Case Passport',
  description: 'Multi-Role Secure View & Blockchain-Anchored Evidence Infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <SecurityBanner />
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 bg-slate-950/60 overflow-y-auto max-w-[1600px] mx-auto w-full">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
