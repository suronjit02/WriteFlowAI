"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { Search, Users, Shield, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface DbUser {
  id: string
  clerk_id: string
  email: string
  name: string | null
  avatar: string | null
  role: "user" | "admin"
  plan: "free" | "pro" | "team"
  status: "active" | "banned"
  created_at: string
}

interface UsersResponse {
  users: DbUser[]
  total: number
  page: number
  pageSize: number
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
  user: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}
const planColors: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  team: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
}
const statusColors: Record<string, string> = {
  active: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  banned: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<DbUser[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [updating, setUpdating] = React.useState<string | null>(null)
  const pageSize = 10

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on search change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(debouncedSearch && { search: debouncedSearch }),
      })
      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const data: UsersResponse = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUpdate = async (userId: string, updates: Partial<Pick<DbUser, "role" | "status">>) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Update failed")
      }
      toast.success("User updated successfully")
      await fetchUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed"
      toast.error(msg)
    } finally {
      setUpdating(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage user roles, plans, and account status.</p>
        </div>
        <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-none text-sm font-semibold px-3 py-1.5 w-fit">
          <Users className="h-4 w-4 mr-1.5" />
          {total.toLocaleString()} Total Users
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">
            {debouncedSearch ? `Search results for "${debouncedSearch}"` : "All Users"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">No users found</p>
              {debouncedSearch && (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{user.name || "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3.5">
                        <Select
                          value={user.role}
                          onValueChange={(val) => handleUpdate(user.id, { role: val as DbUser["role"] })}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="w-24 h-7 text-xs border-none bg-transparent p-0 shadow-none">
                            <Badge className={`${roleColors[user.role]} border-none text-[11px] capitalize font-semibold cursor-pointer`}>
                              {user.role}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <Badge className={`${planColors[user.plan]} border-none text-[11px] capitalize font-semibold`}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${statusColors[user.status]} border-none text-[11px] capitalize font-semibold`}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {user.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdate(user.id, { status: "banned" })}
                            disabled={updating === user.id}
                            className="text-xs h-7 px-2.5 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <ShieldOff className="h-3.5 w-3.5 mr-1" />
                            Ban
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdate(user.id, { status: "active" })}
                            disabled={updating === user.id}
                            className="text-xs h-7 px-2.5 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            Unban
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-foreground px-2">{page} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-8 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
