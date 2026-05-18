"use client";

import {
  CalendarClock,
  ChevronUp,
  Clock,
  Home,
  LayoutGrid,
  LogOut,
  Settings,
  User,
  User2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProfile } from "@/lib/providers/profile-provider";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  url: string;
  badge?: number;
};

type Actions = {
  logoutAction: () => Promise<void>;
};

export function AppSidebar({ actions }: { actions: Actions }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useProfile();
  const { setTheme } = useTheme();

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard",
    },
    {
      title: "Meetings",
      icon: Users,
      url: "/dashboard/meetings",
    },
    {
      title: "Meeting Groups",
      icon: LayoutGrid,
      url: "/dashboard/meeting-groups",
    },
  ];

  const scheduleNavItems: NavItem[] = [
    {
      title: "My Availability",
      icon: Clock,
      url: "/dashboard/availability",
    },
    {
      title: "Availability Overrides",
      icon: CalendarClock,
      url: "/dashboard/availability/overrides",
    },
  ];

  const accountNavItems: NavItem[] = [
    {
      title: "My Profile",
      icon: User,
      url: "/dashboard/profile",
    },
    {
      title: "Account Settings",
      icon: Settings,
      url: "/dashboard/settings",
    },
  ];

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ?? "?";

  async function handleLogout() {
    try {
      await actions.logoutAction();
    } catch (err: unknown) {
      console.log("Could not log out", err);
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            M
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">MeetSync</span>
            <span className="text-xs text-muted-foreground">
              Group Scheduling
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="flex items-center justify-between"
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="flex-1"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  {typeof item.badge === "number" && item.badge > 0 && (
                    <SidebarMenuBadge className="bg-secondary ml-auto">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Schedule */}
        <SidebarGroup>
          <SidebarGroupLabel>Schedule</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {scheduleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {user?.name ?? "Unknown"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </div>

                  <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User2 className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
