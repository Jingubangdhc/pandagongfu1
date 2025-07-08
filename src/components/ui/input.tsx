import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    // iOS Safari优化：防止输入时缩放
    const iosOptimizedStyle = {
      fontSize: '16px', // 防止iOS Safari缩放
      ...style
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          // 移动端优化
          "min-h-[44px] md:min-h-[40px]", // 确保触摸目标大小
          className
        )}
        style={iosOptimizedStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
