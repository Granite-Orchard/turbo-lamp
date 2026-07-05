import { getProfileAction, loginAction } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const profile = await getProfileAction().catch((err: unknown) =>
    console.log(err),
  );
  if (profile) {
    return redirect("/dashboard");
  }
  return (
    <LoginClient
      actions={{
        loginAction,
      }}
    />
  );
}
