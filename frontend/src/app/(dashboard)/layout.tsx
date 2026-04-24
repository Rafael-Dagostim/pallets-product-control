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
        <main className="flex-1 w-full px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-8 md:ml-72 md:w-[calc(100%-18rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
