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

const data = {
  navMain: [
    {
      title: "Дашборд",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Клиенты",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Категории",
      url: "/categories",
      icon: FolderTree,
    },
    {
      title: "Чаты",
      url: "/chats",
      icon: MessageCircle,
    },
    {
      title: "Группы",
      url: "/groups",
      icon: UsersRound,
    },
    {
      title: "Авто группы",
      url: "/auto-groups",
      icon: SearchCheck,
    },
    {
      title: "Лиды",
      url: "/leads",
      icon: Target,
    },
    {
      title: "Пользователи",
      url: "/users",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
