import "~/styles/globals.css";

import { type Metadata } from "next";
import { Montserrat } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Escuela Bíblica · Tabernáculo de Ilopango",
  description: "Materiales de la escuela bíblica del Tabernáculo de Ilopango",
  icons: [{ rel: "icon", url: "/brand/logo-primary.jpg" }],
};

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${montserrat.variable}`}>
      <body className="bg-cream text-brand-dark">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
