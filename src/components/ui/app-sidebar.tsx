"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  MessageCircle,
  UsersRound,
  Target,
  SearchCheck,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";

// Define all navigation items
const allNavItems = [
  {
    title: "Дашборд",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "manager"], // Both admin and manager can access
  },
  {
    title: "Клиенты",
    url: "/clients",
    icon: Users,
    allowedRoles: ["admin", "manager"], // Both admin and manager can access
  },
  {
    title: "Категории",
    url: "/categories",
    icon: FolderTree,
    allowedRoles: ["admin"], // Only admin can access
  },
  {
    title: "Чаты",
    url: "/chats",
    icon: MessageCircle,
    allowedRoles: ["admin", "manager"], // Both admin and manager can access
  },
  {
    title: "Группы",
    url: "/groups",
    icon: UsersRound,
    allowedRoles: ["admin"], // Only admin can access
  },
  {
    title: "Авто группы",
    url: "/auto-groups",
    icon: SearchCheck,
    allowedRoles: ["admin"], // Only admin can access
  },
  {
    title: "Лиды",
    url: "/leads",
    icon: Target,
    allowedRoles: ["admin"], // Only admin can access
  },
  {
    title: "Пользователи",
    url: "/users",
    icon: Users,
    allowedRoles: ["admin"], // Only admin can access
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string || "manager";

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
