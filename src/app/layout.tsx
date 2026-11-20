import "~/styles/globals.css";

import { type Metadata } from "next";
import { Montserrat } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Academia Tabnít",
  description:
    "Materiales de diseño gráfico y comunicaciones de la Academia Tabnít. Un trazo inspirado por Dios.",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${montserrat.variable}`}>
      <body className="bg-cream text-ink">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
