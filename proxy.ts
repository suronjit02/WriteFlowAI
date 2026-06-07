/**
 * Next.js 16 renamed middleware.ts to proxy.ts.
 * Both files are supported during the transition period.
 * This file exports the same middleware logic as middleware.ts
 * using the new "proxy" named export convention.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/explore(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/blog(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api/templates(.*)',
  '/api/reviews(.*)',
  '/api/webhooks(.*)',
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
