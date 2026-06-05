import type { ReactNode } from "react";

export function PageShell({
  title,
  description,
  children,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-300/10 px-4 py-2 text-sm font-semibold text-orange-200">
              <span className="size-2 animate-pulse rounded-full bg-orange-400" />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 transition hover:border-orange-300/30 hover:bg-white/[0.08] sm:p-6 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-orange-300">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:border-orange-300/40">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-orange-300 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const variants = {
    primary:
      "bg-orange-500 text-black shadow-[0_0_35px_rgba(249,115,22,0.35)] hover:bg-orange-300 disabled:bg-orange-500/40 disabled:text-black/60",
    secondary:
      "border border-white/15 bg-white/5 font-bold text-white hover:border-orange-300/60 hover:bg-white/10 disabled:opacity-50",
    danger:
      "border border-rose-400/30 bg-rose-500/10 font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-50",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-black transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-300 ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-orange-300">
      {children}
    </label>
  );
}