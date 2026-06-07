"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import {
  Star, CheckCircle2, XCircle, MessageSquare, Sparkles,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  content: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  user: { name: string | null; email: string; avatar: string | null } | null
  template: { title: string } | null
}

interface SummaryResult {
  bullets: string[]
  sentiment: "Positive" | "Neutral" | "Negative"
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  approved: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  rejected: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
}
const sentimentColors: Record<string, string> = {
  Positive: "text-green-600 dark:text-green-400",
  Neutral: "text-amber-600 dark:text-amber-400",
  Negative: "text-red-600 dark:text-red-400",
}

const PAGE_SIZE = 15

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [updating, setUpdating] = React.useState<string | null>(null)

  const [summarising, setSummarising] = React.useState(false)
  const [summary, setSummary] = React.useState<SummaryResult | null>(null)
  const [summaryOpen, setSummaryOpen] = React.useState(false)

  const fetchReviews = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: filter === "all" ? "all" : filter })
      const res = await fetch(`/api/reviews?${params}`)
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : data.reviews || [])
    } catch {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }, [filter])

  React.useEffect(() => {
    setPage(1)
    fetchReviews()
  }, [fetchReviews])

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Update failed")
      }
      toast.success(`Review ${status}`)
      await fetchReviews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setUpdating(null)
    }
  }

  const handleSummarise = async () => {
    const approved = reviews.filter((r) => r.status === "approved")
    if (approved.length === 0) {
      toast.error("No approved reviews to summarise.")
      return
    }
    setSummarising(true)
    try {
      const res = await fetch("/api/agents/summarise-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: approved.map((r) => ({ rating: r.rating, content: r.content })) }),
      })
      if (!res.ok) throw new Error("Summarisation failed")
      const data = await res.json()
      setSummary(data)
      setSummaryOpen(true)
    } catch {
      toast.error("Failed to summarise reviews")
    } finally {
      setSummarising(false)
    }
  }

  // Client-side pagination
  const totalPages = Math.ceil(reviews.length / PAGE_SIZE)
  const paginated = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Reviews</h1>
          <p className="text-muted-foreground mt-1">Moderate and manage user-submitted template reviews.</p>
        </div>
        <Button
          onClick={handleSummarise}
          disabled={summarising}
          className="bg-purple-600 hover:bg-purple-500 text-white cursor-pointer w-fit"
        >
          {summarising ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Summarising...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />AI Summarise Reviews</>
          )}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
              filter === s
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-500"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-75">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {/* Reviews */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">
            {filter === "all" ? "All Reviews" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Reviews`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">No {filter !== "all" ? filter : ""} reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paginated.map((review) => (
                <div key={review.id} className="p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(review.user?.name || review.user?.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {review.user?.name || review.user?.email || "Unknown User"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">on</span>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                          {review.template?.title || "Unknown Template"}
                        </span>
                        <Badge className={`${statusColors[review.status]} border-none text-[10px] capitalize font-semibold`}>
                          {review.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{review.rating}/5</span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>

                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {review.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(review.id, "approved")}
                          disabled={updating === review.id}
                          className="h-8 px-3 text-xs cursor-pointer border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          {updating === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                          Approve
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(review.id, "rejected")}
                          disabled={updating === review.id}
                          className="h-8 px-3 text-xs cursor-pointer border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          {updating === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, reviews.length)} of {reviews.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary Modal */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Review Summary
            </DialogTitle>
          </DialogHeader>
          {summary && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">Overall Sentiment:</span>
                <Badge className={`border-none font-bold text-sm ${
                  summary.sentiment === "Positive"
                    ? "bg-green-100 dark:bg-green-950"
                    : summary.sentiment === "Negative"
                    ? "bg-red-100 dark:bg-red-950"
                    : "bg-amber-100 dark:bg-amber-950"
                } ${sentimentColors[summary.sentiment]}`}>
                  {summary.sentiment === "Positive" ? "😊" : summary.sentiment === "Negative" ? "😞" : "😐"} {summary.sentiment}
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Key Insights:</p>
                <ul className="space-y-2">
                  {summary.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
