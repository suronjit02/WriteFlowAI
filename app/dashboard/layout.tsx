"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  Settings,
  PenTool,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarLinks: SidebarLink[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/dashboard/documents",
    label: "My Documents",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    href: "/dashboard/ai-history",
    label: "AI History",
    icon: <History className="h-4 w-4" />,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [dbUser, setDbUser] = React.useState<{ plan?: string } | null>(null);

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  React.useEffect(() => {
    if (isSignedIn) {
      fetch("/api/users/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) setDbUser(d);
        })
        .catch(console.error);
    }
  }, [isSignedIn]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border sticky top-0 h-screen">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-5 py-5 border-b border-border group"
        >
          <PenTool className="h-5 w-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-foreground text-gradient">
            WriteFlow AI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive(link.href)
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={
                  isActive(link.href)
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-foreground"
                }
              >
                {link.icon}
              </span>
              {link.label}
              {isActive(link.href) && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-indigo-200" />
              )}
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Theme</span>
          </div>
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-none text-[10px] capitalize font-semibold mt-0.5">
                {dbUser?.plan || "free"}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-gradient">WriteFlow AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden gap-1 px-3 py-2 bg-card border-b border-border overflow-x-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive(link.href)
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
