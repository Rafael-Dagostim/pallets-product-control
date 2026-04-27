"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/form-fields/date-picker-field";
import type { User } from "@/services/users.service";
import type { Pallet } from "@/services/pallets.service";

export interface FilterState {
  from: Date;
  to: Date;
  userId?: string;
  palletId?: string;
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  users: User[];
  pallets: Pallet[];
}

export function ReportFilters({ value, onChange, users, pallets }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          De
        </label>
        <DatePickerField
          value={value.from}
          onChange={(d) => {
            if (!d) return;
            const next: FilterState = { ...value, from: d };
            if (d > value.to) {
              const to = new Date(d);
              to.setDate(to.getDate() + 30);
              next.to = to;
            }
            onChange(next);
          }}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Até
        </label>
        <DatePickerField
          value={value.to}
          onChange={(d) => d && onChange({ ...value, to: d })}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Colaborador
        </label>
        <Select
          value={value.userId ?? "ALL"}
          onValueChange={(v) =>
            onChange({ ...value, userId: v === "ALL" ? undefined : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Palete
        </label>
        <Select
          value={value.palletId ?? "ALL"}
          onValueChange={(v) =>
            onChange({ ...value, palletId: v === "ALL" ? undefined : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {pallets.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} v{p.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
