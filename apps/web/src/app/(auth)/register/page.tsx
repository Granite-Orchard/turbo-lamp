import { cookies } from "next/headers";
import { registerAction } from "@/lib/actions/auth";
import RegisterClient from "./register-client";
import { redirect } from "next/navigation";
export default async function page() {
  const session = (await cookies()).get("session");
  if (session) {
    return redirect("/dashboard");
  }
  return (
    <RegisterClient
      actions={{
        registerAction,
      }}
    />
  );
}
