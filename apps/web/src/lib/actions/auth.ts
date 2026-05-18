"use server";

import { authApi } from "@/lib/api/auth";
import {
  Login as LoginData,
  Profile,
  Register as RegisterData,
} from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProfileAction(): Promise<Profile> {
  return await authApi.profile();
}

export async function loginAction(data: LoginData) {
  return await authApi.login(data);
}

export async function logoutAction() {
  await authApi.logout();
  revalidatePath("/login");
  redirect("/login");
}

export async function registerAction(data: RegisterData) {
  return await authApi.register(data);
}
