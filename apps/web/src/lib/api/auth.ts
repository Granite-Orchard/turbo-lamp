import { Login, Profile, Register } from "@/lib/types";
import { serverRequest } from "@/lib/api/server";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { cookies } from "next/headers";

export const authApi = {
  logout: async () => {
    const cookieStore = await cookies();
    if (cookieStore.has("session")) cookieStore.delete("session");
    return;
  },
  login: async (data: Login) => {
    const payload = loginSchema.parse(data);
    return await serverRequest<Profile>("/auth/login", "POST", payload);
  },

  register: async (data: Register) => {
    const payload = registerSchema.parse(data);
    return await serverRequest<Profile>("/auth/register", "POST", payload);
  },

  profile: async () => {
    return await serverRequest<Profile>("/users/profile", "GET");
  },
};
