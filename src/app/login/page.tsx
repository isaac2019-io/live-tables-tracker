import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(245,96,32,0.32),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(29,78,216,0.35),transparent_24%),linear-gradient(135deg,#05060a_0%,#101524_46%,#05060a_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-orange-500 text-lg font-black text-black">
            LT
          </div>
          <h1 className="text-3xl font-black text-white">管理员登录</h1>
          <p className="mt-2 text-sm text-slate-400">
            仅录入、历史与用户管理需要登录
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-bold text-orange-300 hover:text-orange-200"
          >
            ← 返回直接观看
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-slate-400">加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
