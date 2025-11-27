import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border shadow-lg hover:shadow-xl",
        glass: "bg-card/80 backdrop-blur-lg border-border/50",
        gradient: "bg-gradient-primary text-primary-foreground border-primary/20",
        accent: "bg-gradient-accent text-accent-foreground border-accent/20",
        success: "bg-success/10 border-success/20 text-success-foreground",
        warning: "bg-warning/10 border-warning/20 text-warning-foreground",
        destructive: "bg-destructive/10 border-destructive/20 text-destructive-foreground",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-glow",
        scale: "hover:scale-105",
        rotate: "hover:rotate-1",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "none",
      interactive: false,
    },
  }
);

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  motionProps?: any;
  loading?: boolean;
  skeleton?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant,
      size,
      hover,
      interactive,
      motionProps,
      loading = false,
      skeleton = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = motionProps ? motion.div : "div";

    if (skeleton) {
      return (
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant, size, hover, interactive, className }),
            "animate-pulse"
          )}
          {...props}
        >
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant, size, hover, interactive, className }),
            "relative overflow-hidden"
          )}
          {...props}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          {children}
        </div>
      );
    }

    if (motionProps) {
      return (
        <Comp
          ref={ref}
          className={cn(cardVariants({ variant, size, hover, interactive, className }))}
          {...motionProps}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover, interactive, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Card sub-components
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  EnhancedCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
