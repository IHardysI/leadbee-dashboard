"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const translationMap: { [key: string]: string } = {
    dashboard: "Дашборд",
    categories: "Категории",
    clients: "Клиенты",
    leads: "Лиды",
    chats: "Чаты",
    groups: "Группы",
    users: "Пользователи",
    "user-profile": "Профиль",
    "sign-in": "Вход",
    "email-verified": "Подтверждение почты",
  };

  const breadcrumbs = segments.map((segment, index) => {
    const lowerSegment = segment.toLowerCase();
    const translatedLabel = translationMap[lowerSegment];
    const defaultLabel =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const label = translatedLabel || defaultLabel;
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { label, href };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index < breadcrumbs.length - 1 ? (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
