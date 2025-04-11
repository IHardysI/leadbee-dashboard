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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import the API config store
import { useApiConfig } from "@/store/apiConfigStore";

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
  
  // Use the API config store instead of local state
  const { projects, currentProject, setCurrentProject } = useApiConfig();
  
  // Handle project change with real domain switching
  const handleProjectChange = (project: typeof projects[0]) => {
    setCurrentProject(project);
    
    // Show message in console for debugging
    console.log(`Switching to project: ${project.name} (${project.domain})`);
    
    // Reload the page to apply new API domain across all components
    window.location.reload();
  };

  // This effect will run on mount to check if we need to fetch a category name
  React.useEffect(() => {
    // Handle categories/[id]/statistics path pattern
    if (segments.length >= 3 && 
        segments[0] === 'categories' && 
        segments[2] === 'statistics') {
      const categoryId = segments[1];
      
      // Create a unique key for this path to avoid duplicate processing
      const pathKey = `${categoryId}-${searchParams.toString()}`;
      
      // Check if we already processed this path
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
  }, [pathname, segments, searchParams]);

  const translationMap: { [key: string]: string } = {
    dashboard: "Дашборд",
    categories: "Категории",
    clients: "Клиенты",
    leads: "Лиды",
    chats: "Чаты",
    groups: "Группы",
    "auto-groups": "Авто группы",
    accounts: "Аккаунты",
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
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="ml-2" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb className="flex-grow">
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
            
            {/* Project Selection Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building className="h-4 w-4" />
                  <span>{currentProject.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                {projects.map((project) => (
                  <DropdownMenuItem 
                    key={project.id}
                    onClick={() => handleProjectChange(project)}
                    className={`cursor-pointer ${currentProject.id === project.id ? 'bg-muted' : ''}`}
                  >
                    <span className="font-medium">{project.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[150px]">
                      {project.domain.replace('python-platforma-', '').replace('.dev.reflectai.pro', '')}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
