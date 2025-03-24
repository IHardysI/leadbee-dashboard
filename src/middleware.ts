import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)"]);

const isAdminRoute = createRouteMatcher([
  "/users(.*)",
  "/categories(.*)",
  "/groups(.*)",
  "/auto-groups(.*)",
  "/leads(.*)"
]);

// Маршруты, доступные для менеджеров
const isManagerAllowedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/clients(.*)",
  "/chats(.*)",
  "/user-profile(.*)"  // Разрешаем доступ к профилю пользователя
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const sessionClaims = (await auth()).sessionClaims;
  const userRole = sessionClaims?.metadata?.role;

  // Блокируем доступ не-админам к маршрутам для администраторов
  if (isAdminRoute(req) && userRole !== "admin") {
    const url = new URL("/dashboard", req.url);
    return NextResponse.redirect(url);
  }

  // Блокируем менеджеров от неразрешенных маршрутов
  if (
    userRole === "manager" && 
    !isManagerAllowedRoute(req) && 
    !isPublicRoute(req)
  ) {
    const url = new URL("/dashboard", req.url);
    return NextResponse.redirect(url);
  }

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }
})

export const config = { 
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};