import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[7px] border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        ghost:
          "border-[0.7px] border-[var(--accent)] text-accent bg-transparent hover:bg-accent/10",
        darkBlue:
          "border-transparent bg-background text-accent hover:bg-background/90",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        xl: "h-14 gap-2 px-8 py-4 text-lg",
        lg: "h-12 gap-2 px-6 py-3 text-base",
        sm: "h-9 gap-1.5 px-4 py-2 text-sm",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "lg",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
