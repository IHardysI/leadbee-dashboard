"use client";

import { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "~/images/logo.jpg";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <div className="flex items-center gap-5">
          <Image
            src={Logo}
            alt="logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <span>LeadBee Админка</span>
        </div>
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || item.isActive;
          return (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`transition-all duration-200 ${
                    isActive ? "bg-cYellow/10 hover:bg-cYellow/70" : ""
                  }`}
                >
                  {item.icon && <item.icon className="mr-2" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
