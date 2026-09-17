import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { ChatbotPlaceholder } from "@/components/ChatbotPlaceholder";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapse - SENA CTMA",
  description: "Plataforma oficial de aprendizaje, notas y anuncios para aprendices del Centro de Tecnología de la Manufactura Avanzada - SENA.",
  keywords: ["SENA", "CTMA", "Aprendices", "Educación", "Synapse"],
  authors: [{ name: "SENA CTMA" }],
  openGraph: {
    title: "Synapse - SENA CTMA",
    description: "Plataforma centralizada para aprendices del SENA CTMA.",
    siteName: "Synapse",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('synapse_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <ChatbotPlaceholder />
        </Providers>
      </body>
    </html>
  );
}
