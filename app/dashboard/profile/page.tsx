"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { User, Mail, Calendar, Shield, FileText, Sparkles, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface DbUser {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  role: string
  plan: string
  created_at: string
}

const planColors: Record<string, string> = {
  free: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
  pro: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  team: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser()
  const [dbUser, setDbUser] = React.useState<DbUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [name, setName] = React.useState("")
  const [bio, setBio] = React.useState("")

  const [docCount, setDocCount] = React.useState(0)
  const [aiCallCount, setAiCallCount] = React.useState(0)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, docsRes, logsRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/documents?limit=1"),
          fetch("/api/ai-logs?limit=1"),
        ])
        if (userRes.ok) {
          const data = await userRes.json()
          setDbUser(data)
          setName(data.name || "")
          setBio(data.bio || "")
        }
        if (docsRes.ok) {
          const d = await docsRes.json()
          setDocCount(d.count || 0)
        }
        if (logsRes.ok) {
          const d = await logsRes.json()
          setAiCallCount(d.count || 0)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    if (!dbUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${dbUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      })
      if (res.ok) {
        const updated = await res.json()
        setDbUser(updated)
        toast.success("Profile updated successfully!")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update profile.")
      }
    } catch {
      toast.error("Error saving profile.")
    } finally {
      setSaving(false)
    }
  }

  const initials = (name || clerkUser?.firstName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and account settings.</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          {/* Avatar + Info */}
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-border shadow">
              <AvatarImage src={dbUser?.avatar || clerkUser?.imageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{dbUser?.name || clerkUser?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{dbUser?.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${planColors[dbUser?.plan || "free"]} border-none text-xs font-semibold capitalize`}>
                  {dbUser?.plan || "free"} Plan
                </Badge>
                {dbUser?.role === "admin" && (
                  <Badge className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border-none text-xs font-semibold">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                <User className="h-4 w-4 inline mr-1.5 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="font-medium">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Read-only Fields */}
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <p className="text-sm text-foreground font-medium">{dbUser?.email}</p>
              <p className="text-[11px] text-muted-foreground">Managed by Clerk authentication</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Account Plan
              </Label>
              <p className="text-sm text-foreground font-medium capitalize">{dbUser?.plan || "Free"}</p>
              <p className="text-[11px] text-muted-foreground">Upgrade for more features</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Member Since
              </Label>
              <p className="text-sm text-foreground font-medium">
                {dbUser?.created_at
                  ? format(new Date(dbUser.created_at), "MMMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-5 text-center space-y-1 border border-border">
              <div className="h-10 w-10 mx-auto rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-foreground mt-2">{docCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Documents Created</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-5 text-center space-y-1 border border-border">
              <div className="h-10 w-10 mx-auto rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-extrabold text-foreground mt-2">{aiCallCount}</div>
              <div className="text-xs text-muted-foreground font-medium">AI Calls Made</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
