"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6 bg-background">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error occurred while loading this page.
        </p>
      </div>
      <div className="flex space-x-4 justify-center">
        <Button onClick={() => reset()} className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm">
          Try again
        </Button>
        <a href="/">
          <Button variant="outline" className="cursor-pointer">
            Go home
          </Button>
        </a>
      </div>
    </div>
  )
}
