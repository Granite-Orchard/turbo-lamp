"use server";
import { authApi } from "@/lib/api/auth";

export async function logoutAction() {
  return await authApi.logout();
}
