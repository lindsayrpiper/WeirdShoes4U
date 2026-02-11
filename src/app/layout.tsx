import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/frontend/components/Navbar';
import CartSlideOut from '@/frontend/components/CartSlideOut';
import { CartProvider } from '@/frontend/context/CartContext';
import { AuthProvider } from '@/frontend/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WeirdShoes4U - Funky Shoes for Developers',
  description: 'Shop weird and wonderful shoes for developers who debug in style',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartSlideOut />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="bg-surface-400 border-t border-sentry-border text-sentry-muted py-8 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2025 WeirdShoes4U. All rights reserved.</p>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
