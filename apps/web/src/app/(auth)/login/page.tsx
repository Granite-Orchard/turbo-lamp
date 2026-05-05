import { cookies } from "next/headers";
import LoginClient from "./login-client";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
export default async function Page() {
  const session = (await cookies()).get("session");
  if (session) {
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
