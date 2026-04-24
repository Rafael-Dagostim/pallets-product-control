"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  ShoppingCart,
  Building2,
  BarChart3,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PalletLogo } from "@/components/shared/pallet-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/pallets", label: "Paletes", icon: LayoutGrid },
  { href: "/users", label: "Colaboradores", icon: Users },
  { href: "/production", label: "Produção", icon: ClipboardList },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/customers", label: "Clientes", icon: Building2 },
  { href: "/reports", label: "Relatório", icon: BarChart3 },
];

const MOBILE_MAIN = NAV_ITEMS.slice(0, 4);
const MOBILE_MORE = NAV_ITEMS.slice(4);

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Desktop: Side navbar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-secondary z-40 flex-col">
        <Link
          href="/production"
          className="flex items-center gap-3 px-5 py-7 border-b border-white/15 overflow-hidden"
        >
          <PalletLogo className="h-10 w-auto max-w-[100px] shrink-0" variant="icon" />
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-primary text-3xl font-black tracking-wide">
              PALETES
            </span>
            <span className="text-primary/50 text-base tracking-widest font-medium">
              Maracajá
            </span>
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-lg font-medium transition-colors",
                  active
                    ? "border-l-3 border-primary bg-primary/10 text-primary"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-3 py-4 border-t border-white/15">
          <p className="px-3 text-base text-white font-medium truncate">
            {user?.name || "Usuário"}
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 mt-1 w-full rounded-md text-base text-white/60 hover:text-destructive hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      {/* Mobile: Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-18 bg-secondary flex items-center justify-around px-2">
        {MOBILE_MAIN.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2 min-w-0",
                active ? "text-white" : "text-white/50"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              suppressHydrationWarning
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2",
                MOBILE_MORE.some((i) => isActive(i.href))
                  ? "text-white"
                  : "text-white/50"
              )}
            >
              <MoreHorizontal className="w-6 h-6" />
              <span className="text-xs font-medium">Mais</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-card border-border">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {MOBILE_MORE.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2",
                      active
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border text-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setSheetOpen(false);
                  logout();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-destructive text-destructive col-span-2"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
