import { BrandMark } from "@/components/shared/brand-mark";

export function Header() {
  return (
    <div className="md:hidden bg-secondary py-6 px-5 flex items-center justify-center">
      <BrandMark iconClassName="h-12 w-auto" titleClassName="text-2xl" />
    </div>
  );
}
