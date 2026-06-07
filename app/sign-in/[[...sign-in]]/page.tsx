"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { PenTool, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Demo credentials
const DEMO_ACCOUNTS = [
  {
    label: "Login as User",
    email: "user@writeflow.com",
    password: "WriteFlow@2024",
    icon: <User className="h-4 w-4" />,
    className:
      "flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold cursor-pointer transition-colors",
  },
  {
    label: "Login as Admin",
    email: "admin@writeflow.com",
    password: "WriteFlow@2024",
    icon: <ShieldCheck className="h-4 w-4" />,
    className:
      "flex-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold cursor-pointer transition-colors",
  },
]

/**
 * Fills a React-controlled <input> and fires the synthetic change event
 * so React state updates correctly (required for Clerk's controlled inputs).
 */
function fillInput(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value)
  } else {
    // Fallback: direct assignment
    input.value = value
  }
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

/**
 * Tries to find Clerk's identifier + password inputs and fill them.
 * Retries up to `maxAttempts` times with `intervalMs` delay between
 * attempts, since Clerk hydrates its components asynchronously.
 */
function fillClerkForm(
  email: string,
  password: string,
  attempt = 0,
  maxAttempts = 20,
  intervalMs = 150
) {
  // Clerk renders: identifier field, then password field (on next step)
  // Selectors ordered from most-specific to fallback
  const identifierInput =
    (document.getElementById("identifier-field") as HTMLInputElement | null) ??
    (document.querySelector(
      'input[name="identifier"]'
    ) as HTMLInputElement | null) ??
    (document.querySelector(
      'input[autocomplete="email username"]'
    ) as HTMLInputElement | null) ??
    (document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement | null) ??
    // Clerk v7 uses data-localization-key on the label; grab the sibling input
    (document.querySelector(
      'input[name="emailAddress"]'
    ) as HTMLInputElement | null)

  if (!identifierInput) {
    // Clerk hasn't rendered yet — retry
    if (attempt < maxAttempts) {
      setTimeout(
        () => fillClerkForm(email, password, attempt + 1, maxAttempts, intervalMs),
        intervalMs
      )
    }
    return
  }

  // Fill identifier and focus so Clerk registers it
  identifierInput.focus()
  fillInput(identifierInput, email)
  identifierInput.blur()

  // Store password so it can be filled once Clerk shows the password field.
  // Clerk's sign-in flow shows identifier first, then password on next step.
  // We watch for the password field to appear and fill it.
  let passwordFilled = false
  const fillPassword = (pw: string, tries = 0) => {
    if (passwordFilled) return
    const passwordInput =
      (document.getElementById("password-field") as HTMLInputElement | null) ??
      (document.querySelector(
        'input[name="password"]'
      ) as HTMLInputElement | null) ??
      (document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement | null)

    if (passwordInput) {
      passwordFilled = true
      passwordInput.focus()
      fillInput(passwordInput, pw)
      passwordInput.blur()
    } else if (tries < 30) {
      setTimeout(() => fillPassword(pw, tries + 1), 150)
    }
  }

  // If Clerk shows both fields at once (combined flow), fill immediately.
  // If it's a two-step flow, the password retry loop will catch it.
  fillPassword(password)
}

export default function SignInPage() {
  const handleDemoLogin = (email: string, password: string) => {
    fillClerkForm(email, password)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-5 flex flex-col items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <PenTool className="h-8 w-8 text-indigo-500 transition-transform group-hover:rotate-12" />
          <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            WriteFlow AI
          </span>
        </Link>

        {/* Demo Login Buttons */}
        <div className="w-full max-w-[400px] space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider">
            Quick Demo Access
          </p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.label}
                type="button"
                size="sm"
                onClick={() => handleDemoLogin(account.email, account.password)}
                className={account.className}
              >
                {account.icon}
                <span className="ml-1.5">{account.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Clicks auto-fill the form below. Password:{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">WriteFlow@2024</code>
          </p>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-md border border-border bg-card rounded-2xl",
            },
          }}
        />

      </div>
    </div>
  )
}
