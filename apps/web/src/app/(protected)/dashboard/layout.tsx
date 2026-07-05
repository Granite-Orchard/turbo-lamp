import { Header } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/dashboard/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getProfileAction, logoutAction } from "@/lib/actions/auth";
import { ProfileProvider } from "@/lib/providers/profile-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface ProtectedLayoutProps {
  children: ReactNode;
}

async function validateSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      redirect("/login");
    }

    const profile = await getProfileAction();
    return profile;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.log("get profile action failed", err);
    redirect("/login");
  }
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const profile = await validateSession();

  return (
    <ProfileProvider profile={profile}>
      <SidebarProvider>
        <AppSidebar actions={{ logoutAction }} />
        <SidebarTrigger />
        <SidebarInset className="p-6 space-y-6">
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProfileProvider>
  );
}
