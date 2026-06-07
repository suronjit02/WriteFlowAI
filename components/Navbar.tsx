"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import { PenTool, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function Navbar() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const navLinks = isSignedIn
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/documents", label: "My Documents" },
        { href: "/explore", label: "Explore Templates" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/explore", label: "Explore" },
        { href: "/blog", label: "Blog" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <PenTool className="h-6 w-6 text-indigo-500 transition-transform group-hover:rotate-12 group-hover:text-purple-600" />
          <span className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            WriteFlow AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                isActive(link.href) ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation (Hamburger) */}
        <div className="flex items-center space-x-3 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              aria-label="Toggle Menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="flex items-center space-x-2">
                  <PenTool className="h-6 w-6 text-indigo-500" />
                  <span className="font-bold text-foreground">WriteFlow AI</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-indigo-500 py-2 border-b border-muted/50 ${
                      isActive(link.href) ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col space-y-3">
                  {isSignedIn ? (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">My Profile</span>
                      <UserButton />
                    </div>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full cursor-pointer">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
