"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import {
  Star, Sparkles, ChevronRight, Users, FileText, Clock,
  Wand2, ArrowRight, ThumbsUp
} from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Template {
  id: string
  title: string
  description: string
  category: "blog" | "social" | "email" | "ad"
  prompt: string
  sample_output: string
  tone: string
  estimated_words: number
  usage_count: number
  rating: number
  created_at: string
}

interface Review {
  id: string
  rating: number
  content: string
  status: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  blog: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  social: "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
  email: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  ad: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const id = params?.id as string

  const [template, setTemplate] = React.useState<Template | null>(null)
  const [relatedTemplates, setRelatedTemplates] = React.useState<Template[]>([])
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [loading, setLoading] = React.useState(true)

  // Review form state
  const [reviewRating, setReviewRating] = React.useState(5)
  const [reviewContent, setReviewContent] = React.useState("")
  const [submittingReview, setSubmittingReview] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const [tmplRes, reviewsRes] = await Promise.all([
          fetch(`/api/templates/${id}`),
          fetch(`/api/reviews?template_id=${id}`),
        ])
        if (tmplRes.ok) {
          const tmpl = await tmplRes.json()
          setTemplate(tmpl)
          // Fetch related templates with same category
          const relRes = await fetch(`/api/templates?category=${tmpl.category}&limit=4`)
          if (relRes.ok) {
            const relData = await relRes.json()
            setRelatedTemplates((relData.templates || []).filter((t: Template) => t.id !== id).slice(0, 4))
          }
        }
        if (reviewsRes.ok) {
          const revData = await reviewsRes.json()
          // API returns { reviews: [] } or a flat array
          setReviews(Array.isArray(revData) ? revData : (revData.reviews || []))
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load template.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignedIn) {
      toast.error("Please sign in to leave a review.")
      router.push("/sign-in")
      return
    }
    if (!reviewContent.trim()) {
      toast.error("Please write a review before submitting.")
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: id, rating: reviewRating, content: reviewContent }),
      })
      if (res.ok) {
        toast.success("Review submitted! It will appear after moderation.")
        setReviewContent("")
        setReviewRating(5)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to submit review.")
      }
    } catch {
      toast.error("Failed to submit review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Template Not Found</h2>
            <p className="text-muted-foreground">This template may have been removed.</p>
            <Link href="/explore">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">Browse Templates</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/explore" className="hover:text-indigo-500 transition-colors">Explore</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{template.title}</span>
        </nav>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`${categoryColors[template.category] || ""} border-none capitalize font-semibold`}>
              {template.category}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
              <Star className="h-4 w-4 fill-current" />
              {template.rating?.toFixed(1)}
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              {(template.usage_count || 0).toLocaleString()} uses
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{template.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{template.description}</p>

          <div className="flex gap-3 pt-2">
            <Link href={`/editor/${template.id}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer font-semibold px-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="cursor-pointer">
                Browse More
              </Button>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sample">Sample Output</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-indigo-500" />
                      About This Template
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {template.description} This template uses the AI to generate complete, ready-to-publish content
                      tailored to your specific topic, audience, and tone preferences. The AI will produce a title,
                      full body content, meta description, and relevant tags.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Perfect for content marketers, copywriters, and digital agencies who need to produce
                      high-quality {template.category} content consistently without spending hours writing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-bold text-foreground text-lg">AI Prompt Template</h3>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm text-muted-foreground leading-relaxed border border-border">
                      {template.prompt || "Custom AI prompt for this template type."}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Variables like {"{topic}"}, {"{audience}"}, and {"{tone}"} are filled in from the editor settings.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sample" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      Sample AI-Generated Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="bg-muted/50 rounded-xl p-6 border border-border text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {template.sample_output || "Sample output will appear here after the AI generates content using this template. Click 'Use This Template' to try it now."}
                    </div>
                    <div className="mt-4">
                      <Link href={`/editor/${template.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
                          Generate Your Own <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-6">
                {/* Submit Review Form */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground">Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rating">Your Rating</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setReviewRating(r)}
                              className="cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-7 w-7 ${r <= reviewRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review-content">Your Review</Label>
                        <textarea
                          id="review-content"
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="Share your experience with this template..."
                          rows={4}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <ThumbsUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No approved reviews yet. Be the first to review!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="bg-card border-border">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              U
                            </div>
                            <div>
                              <div className="flex text-amber-400">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="bg-card border-border sticky top-20">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Template Details</h3>
                  <Separator />
                  {[
                    { icon: <FileText className="h-4 w-4 text-indigo-500" />, label: "Category", value: template.category },
                    { icon: <Wand2 className="h-4 w-4 text-purple-500" />, label: "Tone", value: template.tone },
                    { icon: <Clock className="h-4 w-4 text-emerald-500" />, label: "Est. Words", value: `~${template.estimated_words}` },
                    { icon: <Users className="h-4 w-4 text-amber-500" />, label: "Times Used", value: (template.usage_count || 0).toLocaleString() },
                    { icon: <Star className="h-4 w-4 text-amber-400" />, label: "Rating", value: `${template.rating?.toFixed(1)} / 5.0` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm py-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {item.icon}
                        {item.label}
                      </div>
                      <span className="font-semibold text-foreground capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <Link href={`/editor/${template.id}`} className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer font-semibold">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Templates */}
        {relatedTemplates.length > 0 && (
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-bold text-foreground">Related Templates</h2>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              {relatedTemplates.map((tmpl) => (
                <Card key={tmpl.id} className="card-hover bg-card h-full">
                  <div className="h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-t-xl flex items-center justify-center border-b border-border/50 relative">
                    <Sparkles className="h-6 w-6 text-indigo-500/70" />
                    <Badge className={`absolute top-2 left-2 ${categoryColors[tmpl.category] || ""} border-none text-[10px] capitalize font-semibold`}>
                      {tmpl.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-current mr-0.5" />
                        {tmpl.rating?.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">{(tmpl.usage_count || 0).toLocaleString()} uses</span>
                    </div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">{tmpl.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
                    <Link href={`/explore/${tmpl.id}`}>
                      <Button size="sm" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-xs">
                        View Template
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
