"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Header />
        <main className="h-[100svh] w-full pb-18 md:pb-0 md:ml-72 md:w-[calc(100%-18rem)] overflow-hidden flex flex-col">
          <div className="mx-auto w-full max-w-6xl h-full px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
