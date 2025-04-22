"use client"

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-[#0A6EFF]/10 bg-white px-3 py-2 text-sm text-[#243352] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#243352]/50 focus:border-[#0A6EFF] focus:outline-none focus:ring-1 focus:ring-[#0A6EFF] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };