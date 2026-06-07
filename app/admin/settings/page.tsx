"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { Settings, Save, Sparkles, Wand2, MessageSquare, Globe, AlertTriangle } from "lucide-react"

interface SiteSettings {
  id: string
  site_name: string
  maintenance_mode: boolean
  agent_draft_enabled: boolean
  agent_rewrite_enabled: boolean
  agent_chat_enabled: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    site_name: "",
    maintenance_mode: false,
    agent_draft_enabled: true,
    agent_rewrite_enabled: true,
    agent_chat_enabled: true,
  })

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setSettings(data)
          setForm({
            site_name: data.site_name ?? "WriteFlow AI",
            maintenance_mode: data.maintenance_mode ?? false,
            agent_draft_enabled: data.agent_draft_enabled ?? true,
            agent_rewrite_enabled: data.agent_rewrite_enabled ?? true,
            agent_chat_enabled: data.agent_chat_enabled ?? true,
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.site_name.trim()) {
      toast.error("Site name cannot be empty")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Save failed")
      }
      const updated = await res.json()
      setSettings(updated)
      toast.success("Settings saved successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform-wide settings and AI agents.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* General Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            General Settings
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={form.site_name}
              onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))}
              placeholder="WriteFlow AI"
              className="bg-background max-w-sm"
            />
            <p className="text-xs text-muted-foreground">This name appears in the browser tab and throughout the platform.</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${form.maintenance_mode ? "text-red-500" : "text-muted-foreground"}`} />
                <Label htmlFor="maintenance-mode" className={`font-semibold ${form.maintenance_mode ? "text-red-500" : "text-foreground"}`}>
                  Maintenance Mode
                </Label>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                When enabled, users will see a maintenance page and cannot access the platform. Admins are unaffected.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={form.maintenance_mode}
              onCheckedChange={(v) => setForm((f) => ({ ...f, maintenance_mode: v }))}
              className={form.maintenance_mode ? "data-[state=checked]:bg-red-500" : ""}
            />
          </div>
          {form.maintenance_mode && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-400">
              ⚠️ Maintenance mode is enabled. Regular users cannot access the platform until you turn this off.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Agent Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            AI Agent Settings
          </CardTitle>
          <CardDescription>Enable or disable individual AI agents for all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            {
              key: "agent_draft_enabled" as const,
              icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
              label: "Draft Agent",
              desc: "Generates full content drafts from topic, tone, and audience inputs using Gemini AI.",
            },
            {
              key: "agent_rewrite_enabled" as const,
              icon: <Wand2 className="h-5 w-5 text-purple-500" />,
              label: "Rewrite Agent",
              desc: "Rewrites existing content in a different tone or style using Gemini AI.",
            },
            {
              key: "agent_chat_enabled" as const,
              icon: <MessageSquare className="h-5 w-5 text-emerald-500" />,
              label: "Chat Assistant",
              desc: "In-editor AI chat assistant that helps users improve and refine their content.",
            },
          ].map((agent, i) => (
            <React.Fragment key={agent.key}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {agent.icon}
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={agent.key} className={`font-semibold ${!form[agent.key] ? "text-muted-foreground" : "text-foreground"}`}>
                      {agent.label}
                      {!form[agent.key] && (
                        <span className="ml-2 text-xs font-normal text-red-500 dark:text-red-400">(disabled)</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">{agent.desc}</p>
                  </div>
                </div>
                <Switch
                  id={agent.key}
                  checked={form[agent.key]}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, [agent.key]: v }))}
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {/* Save button (bottom) */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
