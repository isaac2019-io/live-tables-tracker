import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import type { SessionUser } from "@/lib/auth/session";

const links = [
  { href: "/", label: "总览" },
  { href: "/platforms/evo", label: "Evo" },
  { href: "/platforms/pragmatic", label: "Pragmatic" },
  { href: "/platforms/choice", label: "Choice" },
  { href: "/daily", label: "每日汇总" },
];

export function AppNav({ user }: { user: SessionUser | null }) {
  return (
    <header className="relative z-40 px-5 py-6 sm:px-8 lg:px-12">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur sm:rounded-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-orange-500 text-sm font-black text-black">
            LT
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-300">
              Live Tables
            </p>
            <p className="text-xs text-slate-400">Evo · Pragmatic · Choice · UTC+8</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-orange-300"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <>
              <Link
                href="/admin/entry"
                className="rounded-full px-3 py-2 text-sm font-medium text-orange-200 transition hover:bg-orange-500/15 hover:text-orange-300"
              >
                录入
              </Link>
              <Link
                href="/admin/history"
                className="rounded-full px-3 py-2 text-sm font-medium text-orange-200 transition hover:bg-orange-500/15 hover:text-orange-300"
              >
                历史
              </Link>
              <Link
                href="/admin/users"
                className="rounded-full px-3 py-2 text-sm font-medium text-orange-200 transition hover:bg-orange-500/15 hover:text-orange-300"
              >
                用户
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-right text-xs text-slate-400 sm:block">
                <p>{user.email}</p>
                <p className="uppercase tracking-[0.18em] text-slate-500">
                  {user.role}
                </p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-orange-300"
            >
              管理员登录
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
