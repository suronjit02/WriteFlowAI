"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"
import {
  FileText, Search, Grid3X3, List, Plus, Pencil, Trash2,
  Clock, LayoutGrid, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react"
import { format } from "date-fns"

interface Document {
  id: string
  title: string
  content: string
  type: string
  status: "draft" | "published" | "archived"
  word_count: number
  created_at: string
  updated_at: string
  template_id?: string
}

const statusColors: Record<string, string> = {
  draft: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  published: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  archived: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
}

const typeIcons: Record<string, string> = {
  blog: "📝",
  social: "📱",
  email: "📧",
  ad: "📢",
}

export default function DocumentsPage() {
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [activeTab, setActiveTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [deleting, setDeleting] = React.useState<string | null>(null)

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchDocuments = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: debouncedSearch,
        ...(activeTab !== "all" ? { status: activeTab } : {}),
      })
      const res = await fetch(`/api/documents?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeTab])

  React.useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Document deleted.")
        fetchDocuments()
      } else {
        toast.error("Failed to delete document.")
      }
    } catch {
      toast.error("Error deleting document.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your drafts, published content, and archives.</p>
        </div>
        <Link href="/explore">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer gap-2 hidden sm:flex">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1) }}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-3 sm:ml-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              className="cursor-pointer"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("table")}
              className="cursor-pointer"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        )
      ) : documents.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {debouncedSearch ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {debouncedSearch
                ? `No documents match "${debouncedSearch}". Try a different search.`
                : "Start writing your first AI-powered document by browsing our template library."}
            </p>
            {!debouncedSearch && (
              <Link href="/explore">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="card-hover bg-card group">
              <CardContent className="p-5 flex flex-col h-full space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{typeIcons[doc.type] || "📄"}</span>
                  <Badge className={`${statusColors[doc.status]} border-none text-[10px] font-semibold capitalize`}>
                    {doc.status}
                  </Badge>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-foreground line-clamp-2 text-sm">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {doc.content?.substring(0, 120) || "No content yet..."}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(doc.updated_at || doc.created_at), "MMM d, yyyy")}
                  </span>
                  <span>{doc.word_count} words</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.template_id && (
                    <Link href={`/editor/${doc.template_id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-xs">
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deleting === doc.id}
                    className="cursor-pointer text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <span className="text-xl shrink-0">{typeIcons[doc.type] || "📄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="capitalize">{doc.type}</span>
                    <span>·</span>
                    <span>{doc.word_count} words</span>
                    <span>·</span>
                    <span>{format(new Date(doc.updated_at || doc.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <Badge className={`${statusColors[doc.status]} border-none text-[10px] font-semibold capitalize shrink-0`}>
                  {doc.status}
                </Badge>
                <div className="flex gap-2 shrink-0">
                  {doc.template_id && (
                    <Link href={`/editor/${doc.template_id}`}>
                      <Button size="sm" variant="outline" className="cursor-pointer h-8 px-3 text-xs">
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deleting === doc.id}
                    className="cursor-pointer h-8 px-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="cursor-pointer">
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="cursor-pointer">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
