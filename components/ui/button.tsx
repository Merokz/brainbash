import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import "@/app/globals.css"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-bounce",
  {
    variants: {
      variant: {
        default: "text-white bg-[linear-gradient(to_right,_#172D53,_#AE0600)] bg-[length:200%_200%] bg-left hover:bg-right hover:animate-gradient-x",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      loading: {
        true: "text-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className, loading }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <Loader2Icon
            className={cn(
              "absolute animate-spin",
              size === "lg"
                ? "size-6"
                : size === "sm"
                ? "size-3.5"
                : "size-4",
              "loading"
            )}
          />
        )}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
