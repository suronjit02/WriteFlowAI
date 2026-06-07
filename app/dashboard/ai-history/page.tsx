"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Sparkles, Wand2, MessageSquare, FileText, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { format } from "date-fns"

interface AiLog {
  id: string
  agent_type: "draft" | "rewrite" | "chat" | "summarise"
  prompt_snippet: string
  tokens_used: number
  created_at: string
}

const agentConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: {
    label: "Draft",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
  rewrite: {
    label: "Rewrite",
    icon: <Wand2 className="h-4 w-4" />,
    color: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  chat: {
    label: "Chat",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  summarise: {
    label: "Summarise",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
}

export default function AiHistoryPage() {
  const [logs, setLogs] = React.useState<AiLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [agentFilter, setAgentFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalTokens, setTotalTokens] = React.useState(0)

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(agentFilter !== "all" ? { agent_type: agentFilter } : {}),
      })
      const res = await fetch(`/api/ai-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotalTokens(data.totalTokens || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, agentFilter])

  React.useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">AI History</h1>
        <p className="text-muted-foreground mt-1">
          A complete log of all your AI agent interactions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(agentConfig).map(([key, cfg]) => (
          <Card key={key} className="bg-card border-border card-hover cursor-pointer" onClick={() => { setAgentFilter(key); setPage(1) }}>
            <CardContent className="p-4">
              <div className={`h-9 w-9 rounded-lg ${cfg.color} flex items-center justify-center mb-3`}>
                {cfg.icon}
              </div>
              <p className="text-sm font-semibold text-foreground">{cfg.label} Agent</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {logs.filter(l => l.agent_type === key).length} calls shown
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter by Agent:</span>
        </div>
        <Select value={agentFilter} onValueChange={(v) => { setAgentFilter(v || 'null'); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="draft">Draft Agent</SelectItem>
            <SelectItem value="rewrite">Rewrite Agent</SelectItem>
            <SelectItem value="chat">Chat Agent</SelectItem>
            <SelectItem value="summarise">Summarise Agent</SelectItem>
          </SelectContent>
        </Select>

        {agentFilter !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setAgentFilter("all")} className="cursor-pointer text-muted-foreground">
            Clear Filter
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-0 border-b border-border">
          <div className="grid grid-cols-[1fr_120px_200px_100px_80px] gap-4 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Prompt Snippet</span>
            <span>Agent</span>
            <span>Date & Time</span>
            <span>Tokens</span>
            <span></span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <History className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-foreground">No AI history yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start using the AI editor to generate content. Your usage logs will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const agent = agentConfig[log.agent_type]
                return (
                  <div
                    key={log.id}
                    className="grid grid-cols-[1fr_120px_200px_100px_80px] gap-4 px-5 py-4 hover:bg-muted/30 transition-colors items-center"
                  >
                    <p className="text-sm text-foreground truncate">
                      {log.prompt_snippet || "—"}
                    </p>
                    <div>
                      <Badge className={`${agent?.color || ""} border-none text-[10px] font-semibold gap-1 flex items-center w-fit`}>
                        {agent?.icon}
                        {agent?.label || log.agent_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      {(log.tokens_used || 0).toLocaleString()}
                    </div>
                    <div />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="cursor-pointer"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
