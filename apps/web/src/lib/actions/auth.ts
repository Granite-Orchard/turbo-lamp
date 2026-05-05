"use server";

import { authApi } from "@/lib/api/auth";
import {
  Login as LoginData,
  Profile,
  Register as RegisterData,
} from "@/lib/types";

export async function getProfileAction(): Promise<Profile> {
  return await authApi.profile();
}

export async function loginAction(data: LoginData) {
  return await authApi.login(data);
}

export async function registerAction(data: RegisterData) {
  return await authApi.register(data);
}
