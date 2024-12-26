import { Toaster } from "sonner";
import { Koh_Santepheap } from "next/font/google";
import "./globals.css";

const kohSantapheap = Koh_Santepheap({
  subsets: ["khmer", "latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata = {
  title: "QR Code Scanner",
  description: "Scan QR codes with your camera or from an image",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={kohSantapheap.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
