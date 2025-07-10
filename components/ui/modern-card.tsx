import * as React from "react"
import { cn } from "@/lib/utils"

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "elevated" | "outlined"
  hover?: boolean
}

export function ModernCard({ 
  children, 
  className, 
  variant = "default", 
  hover = true,
  ...props 
}: ModernCardProps) {
  const baseClasses = "rounded-xl border bg-card text-card-foreground shadow-sm"
  
  const variantClasses = {
    default: "border-border",
    elevated: "border-border shadow-lg",
    outlined: "border-border/50 bg-transparent"
  }
  
  const hoverClasses = hover ? "transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-emerald-500/10 hover:scale-[1.02]" : ""
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardHeader({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardTitle({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function ModernCardDescription({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function ModernCardContent({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
}

export function ModernCardFooter({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
} 