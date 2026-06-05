"use client";

import { Button } from "@/components/ui";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      退出
    </Button>
  );
}
