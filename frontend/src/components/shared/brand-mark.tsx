import { cn } from "@/lib/utils";
import { PalletLogo } from "@/components/shared/pallet-logo";

interface BrandMarkProps {
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function BrandMark({
  className,
  iconClassName,
  titleClassName,
  subtitleClassName,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <PalletLogo
        variant="icon"
        className={cn("h-10 w-auto max-w-[100px] shrink-0", iconClassName)}
      />
      <div className="flex flex-col leading-none min-w-0 font-display">
        <span
          className={cn(
            "text-primary text-2xl font-bold tracking-[0.15em]",
            titleClassName,
          )}
        >
          PALETES
        </span>
        <span
          className={cn(
            "text-primary/60 text-sm font-medium tracking-[0.3em] uppercase mt-0.5",
            subtitleClassName,
          )}
        >
          Maracajá
        </span>
      </div>
    </div>
  );
}
