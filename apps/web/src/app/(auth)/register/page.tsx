import { getProfileAction, registerAction } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import RegisterClient from "./register-client";
export default async function page() {
  const profile = await getProfileAction().catch(() => null);
  if (profile) {
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
