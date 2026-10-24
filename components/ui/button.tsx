import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800",
        dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700",
        outline:
          "border border-mist-300 bg-white text-ink-900 hover:border-ink-900 hover:bg-mist-50",
        ghost: "text-ink-700 hover:bg-mist-100 hover:text-ink-900",
        whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
        danger: "bg-white text-red-700 border border-red-200 hover:bg-red-50",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, full, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, full }), className)}
      {...props}
    />
  );
}
