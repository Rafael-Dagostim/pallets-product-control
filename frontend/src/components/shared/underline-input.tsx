"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface UnderlineInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const UnderlineInput = forwardRef<HTMLInputElement, UnderlineInputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:outline-none transition-colors",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              icon && "pl-10",
              error && "border-destructive",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

UnderlineInput.displayName = "UnderlineInput";

export { UnderlineInput };
