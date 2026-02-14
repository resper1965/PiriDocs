import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PiriChat | Inteligência para Saúde Suplementar",
  description: "Plataforma de IA especializada em direito e regulação do setor de saúde suplementar e seguros saúde. ANS e reguladores.",
  keywords: ["saúde suplementar", "ANS", "seguros saúde", "regulação", "IA", "inteligência artificial"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
