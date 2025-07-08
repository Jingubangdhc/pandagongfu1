import { cn } from "@/lib/utils"

interface HeadingProps {
  title: string
  description?: string
  className?: string
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  className
}) => {
  return (
    <div className={cn("", className)}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
