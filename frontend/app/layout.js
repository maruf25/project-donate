import "./globals.css";
import { Inter } from "next/font/google";
import { AppoloProviderContext } from "@/provider/Appolo";
import { AuthContextProvider } from "@/provider/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s",
  },
  description: {
    template: "%s",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppoloProviderContext>
          <AuthContextProvider>{children}</AuthContextProvider>
        </AppoloProviderContext>
      </body>
    </html>
  );
}
