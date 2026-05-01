import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Acrapath Admin",
    template: "%s | Acrapath Admin",
  },
  description: "Acrapath Admin Panel",
  icons: {
    icon: "/static/Icons/Acrapath_Logo_Below_Text.svg",
    shortcut: "/static/Icons/Acrapath_Logo_Below_Text.svg",
    apple: "/static/Icons/Acrapath_Logo_Below_Text.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.className} ${poppins.variable}`}>
      <body
        className={`${poppins.className} ${poppins.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              success: { duration: 3000 },
              error: { duration: 6000 },
              style: { fontFamily: "inherit" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
