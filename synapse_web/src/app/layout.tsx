import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/AuthContext';

// display:'swap' evita FOIT (Flash of Invisible Text):
// el texto se muestra de inmediato con la fuente del sistema
// mientras Inter se descarga en segundo plano.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: 'SYNAPSE - Plataforma Académica',
  description: 'Plataforma web inteligente para gestión académica con IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}