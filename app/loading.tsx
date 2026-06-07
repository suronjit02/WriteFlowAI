import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading WriteFlow AI...
        </p>
      </div>
    </div>
  );
}
