import { getProfileAction } from "@/lib/actions/auth";
import { updateUserAction } from "@/lib/actions/user";
import ProfileClient from "./profile-client";

export default async function Page() {
  const profile = await getProfileAction();

  return (
    <ProfileClient
      initialData={{ profile }}
      actions={{
        updateProfileAction: updateUserAction,
      }}
    />
  );
}
