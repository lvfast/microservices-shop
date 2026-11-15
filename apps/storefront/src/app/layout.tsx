import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microservices Shop | Storefront",
  description: "Cửa hàng demo với luồng checkout qua các microservice",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
