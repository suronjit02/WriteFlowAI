"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Sparkles, History, Plus, Clock, ArrowRight, TrendingUp, Zap } from "lucide-react"
import { format } from "date-fns"

interface Document {
  id: string
  title: string
  type: string
  status: string
  word_count: number
  created_at: string
  updated_at: string
}

interface Stats {
  totalDocuments: number
  aiCallsTotal: number
  wordsGenerated: number
  draftCount: number
}

const statusColors: Record<string, string> = {
  draft: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  published: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  archived: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
}

export default function DashboardPage() {
  const { user } = useUser()
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, logsRes] = await Promise.all([
          fetch("/api/documents?limit=5&sort=newest"),
          fetch("/api/ai-logs?limit=100"),
        ])
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          const docs: Document[] = docsData.documents || []
          setDocuments(docs)
          setStats({
            totalDocuments: docsData.count || docs.length,
            aiCallsTotal: logsRes.ok ? (await logsRes.json()).count || 0 : 0,
            wordsGenerated: docs.reduce((acc, d) => acc + (d.word_count || 0), 0),
            draftCount: docs.filter((d) => d.status === "draft").length,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      label: "Total Documents",
      value: stats?.totalDocuments ?? 0,
      icon: <FileText className="h-5 w-5 text-indigo-500" />,
      bg: "from-indigo-500/10 to-indigo-500/5",
      change: "All time",
    },
    {
      label: "AI Calls Made",
      value: stats?.aiCallsTotal ?? 0,
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      bg: "from-purple-500/10 to-purple-500/5",
      change: "Lifetime total",
    },
    {
      label: "Words Generated",
      value: (stats?.wordsGenerated ?? 0).toLocaleString(),
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      bg: "from-emerald-500/10 to-emerald-500/5",
      change: "Across all docs",
    },
    {
      label: "Drafts in Progress",
      value: stats?.draftCount ?? 0,
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      bg: "from-amber-500/10 to-amber-500/5",
      change: "Unpublished",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Welcome back, {user?.firstName || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your content today.
          </p>
        </div>
        <Link href="/explore">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hidden sm:flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : statCards.map((card) => (
              <Card key={card.label} className="card-hover bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                      {card.icon}
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {card.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-foreground">{card.value}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Documents */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-foreground">Recent Documents</CardTitle>
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-foreground">No documents yet</h3>
              <p className="text-sm text-muted-foreground">Start writing by picking a template from our library.</p>
              <Link href="/explore">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 py-3.5 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">{doc.type}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground">{doc.word_count} words</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[doc.status] || ""} border-none text-[10px] font-semibold capitalize`}>
                      {doc.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(doc.updated_at || doc.created_at), "MMM d")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Browse Templates",
            desc: "Pick from 12+ AI writing templates",
            icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
            href: "/explore",
            color: "border-indigo-200 dark:border-indigo-800",
          },
          {
            title: "View AI History",
            desc: "See all your AI generation logs",
            icon: <History className="h-6 w-6 text-purple-500" />,
            href: "/dashboard/ai-history",
            color: "border-purple-200 dark:border-purple-800",
          },
          {
            title: "My Documents",
            desc: "Manage your drafts and published content",
            icon: <FileText className="h-6 w-6 text-emerald-500" />,
            href: "/dashboard/documents",
            color: "border-emerald-200 dark:border-emerald-800",
          },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className={`card-hover bg-card cursor-pointer border ${action.color}`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
