"use client";

import React, { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

// Separate component that uses useSearchParams()
function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split("/").filter(Boolean);
  
  // Store custom breadcrumb labels for dynamic routes
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState<{[key: string]: string}>({});
  
  // Use a ref to track processed paths to prevent infinite loops
  const processedPathsRef = React.useRef<Set<string>>(new Set());
  
  // This effect will run on mount to check if we need to fetch a category name
  React.useEffect(() => {
    // Handle categories/[id]/statistics path pattern
    if (segments.length >= 3 && 
        segments[0] === 'categories' && 
        segments[2] === 'statistics') {
      const categoryId = segments[1];
      
      // Create a unique key for this pathname + search params combination
      const searchParamsString = searchParams.toString();
      const pathKey = `${pathname}?${searchParamsString}`;
      
      // Skip if we've already processed this exact path
      if (processedPathsRef.current.has(pathKey)) {
        return;
      }
      
      // Mark this path as processed
      processedPathsRef.current.add(pathKey);
      
      // First check if we have a name in the search params
      const categoryNameParam = searchParams.get('name');
      if (categoryNameParam) {
        const decodedName = decodeURIComponent(categoryNameParam).replace(/-/g, ' ');
        // Use functional update to access the latest state inside the effect
        setCustomBreadcrumbs(prev => {
          // Skip update if value hasn't changed
          if (prev[categoryId] === decodedName) return prev;
          return {
            ...prev,
            [categoryId]: decodedName
          };
        });
        return;
      }
      
      // If no name in search params, show generic "Категория"
      setCustomBreadcrumbs(prev => {
        // Skip update if value hasn't changed
        if (prev[categoryId] === "Категория") return prev;
        return {
          ...prev,
          [categoryId]: "Категория"
        };
      });
    }
  }, [pathname, segments, searchParams]); // removed customBreadcrumbs from dependencies

  const translationMap: { [key: string]: string } = {
    dashboard: "Дашборд",
    categories: "Категории",
    clients: "Клиенты",
    leads: "Лиды",
    chats: "Чаты",
    groups: "Группы",
    "auto-groups": "Авто группы",
    users: "Пользователи",
    "user-profile": "Профиль",
    "sign-in": "Вход",
    "email-verified": "Подтверждение почты",
    statistics: "Статистика",
  };

  // Process breadcrumbs - special handling for statistics pages
  let processedSegments = [...segments]; 
  let processedHrefs: string[] = [];
  
  // Check if we're on a statistics page
  const isStatisticsPage = segments.length >= 3 && 
      segments[0] === 'categories' && 
      segments[2] === 'statistics';
      
  if (isStatisticsPage) {
    const categoryId = segments[1];
    // For statistics page, we want to show only two breadcrumbs:
    // Categories > [Category Name]
    processedSegments = [segments[0], segments[1]];
    
    // Set appropriate URLs
    processedHrefs = [
      `/${segments[0]}`, // First breadcrumb points to categories list
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '') // Second breadcrumb points to current page with query params
    ];
  } else {
    // For other pages, just build the normal hrefs
    processedSegments.forEach((_, index) => {
      processedHrefs.push("/" + processedSegments.slice(0, index + 1).join("/"));
    });
  }
  
  const breadcrumbs = processedSegments.map((segment, index) => {
    // Use pre-calculated href
    const href = processedHrefs[index];
    
    // Check if we have a custom name for this segment (like a category ID)
    if (customBreadcrumbs[segment]) {
      return {
        label: customBreadcrumbs[segment],
        href
      };
    }
    
    const lowerSegment = segment.toLowerCase();
    const translatedLabel = translationMap[lowerSegment];
    const defaultLabel =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const label = translatedLabel || defaultLabel;
    return { label, href };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex min-h-16 py-2 shrink-0 items-center gap-2 transition-all border-b">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="w-full">
              <BreadcrumbList className="flex-wrap">
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
                        <BreadcrumbPage className="break-all overflow-visible max-w-none">
                          {crumb.label}
                        </BreadcrumbPage>
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
