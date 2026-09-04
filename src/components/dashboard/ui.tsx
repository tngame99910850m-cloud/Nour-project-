import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex gap-2">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "brand" | "green" | "amber" | "blue" | "red";
}) {
  const colors: Record<string, string> = {
    brand: "bg-brand/10 text-brand",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon ? (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", colors[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <p className="font-serif text-xl">{title}</p>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", className)}>{children}</span>;
}

export function LinkButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "outline" | "dark" }) {
  const cls = variant === "outline" ? "btn-outline" : variant === "dark" ? "btn-dark" : "btn-primary";
  return (
    <Link href={href} className={`${cls} btn-md`}>
      {children}
    </Link>
  );
}
