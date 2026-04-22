import * as React from "react";

import { cn } from "@/lib/utils";

export type CardProps = React.ComponentPropsWithoutRef<"div">;

type CardComponent = ((props: CardProps) => React.JSX.Element) & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

export const Card: CardComponent = ({ className, ...props }) => {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white", className)}
      {...props}
    />
  );
};

function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("space-y-1 border-b border-slate-200 p-4", className)} {...props} />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn("text-base font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("text-sm text-slate-600", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("border-t border-slate-200 p-4", className)} {...props} />;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

