"use client";

import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Relatórios</h1>
      <p className="text-muted-foreground text-lg">Em breve</p>
      <p className="text-sm text-muted-foreground mt-2">
        Esta funcionalidade está sendo desenvolvida.
      </p>
    </div>
  );
}
