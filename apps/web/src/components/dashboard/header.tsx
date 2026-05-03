"use client";

import { useProfile } from "../../lib/providers/profile-provider";

export function Header() {
  const profile = useProfile();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Welcome back, {profile.user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
