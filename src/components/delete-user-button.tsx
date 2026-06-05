"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";

export function DeleteUserButton({
  userId,
  email,
}: {
  userId: number;
  email: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`确认删除账号 ${email}？`)) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "删除失败");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      className="px-3 py-2 text-xs"
      disabled={deleting}
      onClick={handleDelete}
    >
      {deleting ? "删除中..." : "删除"}
    </Button>
  );
}
