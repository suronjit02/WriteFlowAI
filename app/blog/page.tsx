import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const posts = [
    {
      title: "Mastering the AI Editorial Pipeline: A Guide for Teams",
      excerpt: "Learn how modern marketing departments are integrating AI drafting agents into standard editing workflows to ship blogs 10x faster.",
      date: "May 28, 2026",
      category: "Workflows",
      readTime: "6 min read",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      title: "How to Write High-Converting Facebook Ads with Prompt Engineering",
      excerpt: "Ad copywriting is a game of margins. Discover the exact structural parameters and tone modifiers that maximize conversion rates on Meta platforms.",
      date: "May 15, 2026",
      category: "Ad Copy",
      readTime: "4 min read",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "The Death of SEO? How AI Overviews Change Content Strategy",
      excerpt: "Search engines are transforming. We explore how generative AI answers are reshaping search behaviors and what templates you should write now.",
      date: "May 02, 2026",
      category: "SEO",
      readTime: "8 min read",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Building an Authentic Brand Voice in an Era of Synthetic Content",
      excerpt: "AI can draft anything, but it takes human brand strategies to make it sound human. How to inject authentic tone guidelines into template configs.",
      date: "Apr 20, 2026",
      category: "Branding",
      readTime: "5 min read",
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      title: "Email Newsletters: How to Avoid the Spam Folder and Lift Open Rates",
      excerpt: "From punchy subject lines to personalized introductory paragraphs, learn the anatomy of newsletters that subscribers look forward to.",
      date: "Apr 08, 2026",
      category: "Email",
      readTime: "7 min read",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Optimizing AI Tokens: Writing Long-Form Content Without the Bloat",
      excerpt: "A guide to estimated word counts, prompt structure, and token efficiency for engineers and copywriters scaling AI generations.",
      date: "Mar 25, 2026",
      category: "Engineering",
      readTime: "5 min read",
      gradient: "from-rose-500 to-red-500"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3 max-w-3xl">
          <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">Our Blog</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Inside the flow: Content Strategy & AI Insights
          </h1>
          <p className="text-lg text-muted-foreground">
            Articles, guides, and strategic discussions on how to scale copywriting, leverage LLMs, and structure agentic editorial pipelines.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <Card key={idx} className="card-hover overflow-hidden flex flex-col h-full bg-card border-border">
              {/* Card Thumbnail */}
              <div className={`h-48 w-full bg-gradient-to-br ${post.gradient} flex items-center justify-center p-6 text-white relative`}>
                <span className="font-extrabold text-2xl opacity-15 tracking-tight uppercase">WriteFlow</span>
                <span className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-indigo-900 border-none">
                    {post.category}
                  </Badge>
                </span>
              </div>
              
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 text-xl font-bold leading-snug hover:text-indigo-500 transition-colors">
                  <Link href={`/blog/${idx}`}>
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="pt-2 border-t border-muted/50 mt-auto">
                  <Link href={`/blog/${idx}`} className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 inline-flex items-center group/link">
                    Read Article
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
