import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-xl space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 border border-border rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="border border-border rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[250px] w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
