"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  PenTool,
  BarChart3,
  Users,
  FileText,
  Star,
  Settings,
  ChevronRight,
  Shield,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarLinks: SidebarLink[] = [
  {
    href: "/admin",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  {
    href: "/admin/templates",
    label: "Templates",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: <Star className="h-4 w-4" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || d.role !== "admin") {
          setIsAdmin(false);
          router.push("/dashboard");
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(false);
        router.push("/dashboard");
      })
      .finally(() => setChecking(false));
  }, [isLoaded, isSignedIn, router]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  if (!isLoaded || checking || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

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
          <div>
            <span className="font-bold text-foreground text-gradient">
              WriteFlow AI
            </span>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-red-500" />
              <span className="text-[10px] text-red-500 font-semibold">
                Admin Panel
              </span>
            </div>
          </div>
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

        {/* User section */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Theme</span>
          </div>
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Admin</p>
              <Badge className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border-none text-[10px] font-semibold mt-0.5">
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-gradient">WriteFlow AI</span>
            <Badge className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border-none text-[10px]">
              Admin
            </Badge>
          </div>
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
