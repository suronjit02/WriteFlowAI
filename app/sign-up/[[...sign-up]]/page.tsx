import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { PenTool } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <PenTool className="h-8 w-8 text-indigo-500 transition-transform group-hover:rotate-12" />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            WriteFlow AI
          </span>
        </Link>

        {/* Clerk SignUp component — routing="path" is required for catch-all route */}
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
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
  );
}
