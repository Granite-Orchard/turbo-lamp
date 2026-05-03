import { authApi } from "@/lib/api/auth";
import ProfileClient from "./profile-client";

const updateProfileAction = async () => {
  await Promise.resolve();
};

export default async function Page() {
  const profile = await authApi.profile();

  return (
    <ProfileClient
      initialData={{ profile }}
      actions={{
        updateProfileAction,
      }}
    />
  );
}
