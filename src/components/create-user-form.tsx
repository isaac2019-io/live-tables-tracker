"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Input, Label } from "@/components/ui";

export function CreateUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"viewer" | "admin">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "创建失败");
      }

      setEmail("");
      setPassword("");
      setRole("viewer");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="创建账号">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label>邮箱</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <Label>密码（至少 8 位）</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>
        <div>
          <Label>角色</Label>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "viewer" | "admin")
            }
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-300"
          >
            <option value="viewer">viewer（只读）</option>
            <option value="admin">admin（可录入）</option>
          </select>
        </div>
        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "创建中..." : "创建账号"}
        </Button>
      </form>
    </Card>
  );
}
