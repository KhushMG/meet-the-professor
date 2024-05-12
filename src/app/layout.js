import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto_mono = Roboto_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Prof-iler",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto_mono.className}>{children}</body>
    </html>
  );
}
