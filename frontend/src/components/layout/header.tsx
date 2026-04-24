"use client";

import { PalletLogo } from "@/components/shared/pallet-logo";

export function Header() {
  return (
    <div className="md:hidden bg-secondary py-6 flex items-center justify-center">
      <PalletLogo className="h-16 w-auto" variant="full" />
    </div>
  );
}
