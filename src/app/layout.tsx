import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/lib/context/UserContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { AuthGate } from '@/components/auth/AuthGate';

export const metadata: Metadata = {
  title: 'Ajaia Docs - Collaborative Document Editor',
  description: 'AI-Native Lightweight Collaborative Document Editor inspired by Google Docs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <UserProvider>
          <AuthGate>
            {children}
          </AuthGate>
          <ToastContainer />
        </UserProvider>
      </body>
    </html>
  );
}

