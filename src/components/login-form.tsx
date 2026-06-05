"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Card, Input, Label } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "登录失败");
      }

      const next =
        searchParams.get("next") ||
        (data.user.role === "admin" ? "/admin/entry" : "/");
      router.push(next);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="登录">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label>邮箱</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label>密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "登录中..." : "登录"}
        </Button>
      </form>
    </Card>
  );
}
