import Image from "next/image";

interface PalletLogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function PalletLogo({ className, variant = "full" }: PalletLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/pallet-icon.svg"
        alt="Palete"
        width={245}
        height={83}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo-full.svg"
      alt="Paletes Maracajá"
      width={340}
      height={192}
      className={className}
      priority
    />
  );
}
