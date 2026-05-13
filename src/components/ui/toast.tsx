"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "default" | "destructive"
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", open = true, onOpenChange, ...props }, ref) => {
    const variantClasses = {
      default: "bg-brand-gold text-brand-black",
      destructive: "bg-brand-danger text-white",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-md p-4 shadow-lg transition-all",
          variantClasses[variant],
          !open && "hidden",
          className
        )}
        {...props}
      >
        {props.children}
        {onOpenChange && (
          <button
            onClick={() => onOpenChange(false)}
            className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold", className)}
      {...props}
    />
  )
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
)
ToastDescription.displayName = "ToastDescription"

export { Toast, ToastTitle, ToastDescription }
