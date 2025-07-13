"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  progress?: {
    value: number
    max: number
    label: string
  }
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  variant = "default",
  className = ""
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      case "danger":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "danger":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  return (
    <Card className={`${getVariantStyles()} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${getIconColor()}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "secondary"}
              className={`text-xs ${
                trend.isPositive 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">{trend.label}</span>
          </div>
        )}
        
        {progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.label}</span>
              <span>{Math.round((progress.value / progress.max) * 100)}%</span>
            </div>
            <Progress value={(progress.value / progress.max) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 