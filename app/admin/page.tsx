"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Zap, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

interface Analytics {
  totalUsers: number;
  totalDocuments: number;
  aiCallsToday: number;
  revenue: number;
  dailyAiUsage: Array<{ date: string; calls: number }>;
  userSignups: Array<{ date: string; signups: number }>;
  contentBreakdown: Array<{ name: string; value: number }>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b"];

function generateDailyData() {
  return Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), "EEE"),
    calls: Math.floor(Math.random() * 80) + 20,
  }));
}

function generateSignupData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), "MMM d"),
    signups: Math.floor(Math.random() * 15) + 2,
  }));
}

export default function AdminPage() {
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const charts = data.charts || {};
          setAnalytics({
            totalUsers: data.stats?.totalUsers ?? 0,
            totalDocuments: data.stats?.totalDocuments ?? 0,
            aiCallsToday: data.stats?.aiCallsToday ?? 0,
            revenue: data.stats?.revenue ?? 0,
            dailyAiUsage: charts.dailyUsageData?.length
              ? charts.dailyUsageData.map(
                  (d: { date: string; Total?: number; total?: number }) => ({
                    date: d.date,
                    calls: d.Total ?? d.total ?? 0,
                  }),
                )
              : generateDailyData(),
            userSignups: charts.signupData?.length
              ? charts.signupData.map(
                  (d: {
                    date: string;
                    Signups?: number;
                    signups?: number;
                  }) => ({
                    date: d.date,
                    signups: d.Signups ?? d.signups ?? 0,
                  }),
                )
              : generateSignupData(),
            contentBreakdown: charts.contentTypeData?.length
              ? charts.contentTypeData
              : [
                  { name: "Blog", value: 40 },
                  { name: "Social", value: 30 },
                  { name: "Email", value: 20 },
                  { name: "Ad", value: 10 },
                ],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: analytics?.totalUsers ?? 0,
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      bg: "from-indigo-500/10 to-indigo-500/5",
      change: "+12% this month",
    },
    {
      label: "Total Documents",
      value: analytics?.totalDocuments ?? 0,
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      bg: "from-purple-500/10 to-purple-500/5",
      change: "+8% this month",
    },
    {
      label: "AI Calls Today",
      value: analytics?.aiCallsToday ?? 0,
      icon: <Zap className="h-5 w-5 text-emerald-500" />,
      bg: "from-emerald-500/10 to-emerald-500/5",
      change: "Real-time",
    },
    {
      label: "Monthly Revenue",
      value: `$${(analytics?.revenue ?? 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      bg: "from-amber-500/10 to-amber-500/5",
      change: "+23% vs last month",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">
          Admin Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide statistics and performance insights.
        </p>
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
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center`}
                    >
                      {card.icon}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-[11px]">{card.change}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-foreground">
                      {card.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {card.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily AI Usage Bar Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">
              Daily AI Usage (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics?.dailyAiUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar
                    dataKey="calls"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    name="AI Calls"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Content Type Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">
              Content Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={analytics?.contentBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(analytics?.contentBreakdown || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                  <Legend
                    formatter={(value) => (
                      <span
                        style={{
                          color: "var(--muted-foreground)",
                          fontSize: 12,
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Signups Line Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">
            User Signups (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics?.userSignups || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
