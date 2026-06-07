"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ExploreLoading from "./loading";

interface Template {
  id: string;
  title: string;
  description: string;
  category: "blog" | "social" | "email" | "ad";
  rating: number;
  usage_count: number;
  tone: string;
}

export default function ExplorePage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [rating, setRating] = React.useState("all");
  const [sort, setSort] = React.useState("popular");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/templates?search=${encodeURIComponent(
          debouncedSearch,
        )}&category=${category}&rating=${rating}&sort=${sort}&page=${page}&limit=12`,
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, rating, sort, page]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categoryLabels: Record<string, string> = {
    all: "All Categories",
    blog: "Blog Posts",
    social: "Social Media",
    email: "Email Newsletters",
    ad: "Ad Copy",
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Choose a Template
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Get started instantly with our professionally designed prompts tuned
            for conversion, SEO, and engagement.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-5 rounded-xl border border-border shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Search templates (e.g. blog, Facebook ad)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Filtering dropdowns */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Category selection */}
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="blog">Blog Posts</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="email">Email Copy</SelectItem>
                <SelectItem value="ad">Ad Copy</SelectItem>
              </SelectContent>
            </Select>

            {/* Rating selection */}
            <Select
              value={rating}
              onValueChange={(val) => {
                setRating(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[130px] bg-background">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4">4.0 ★ and up</SelectItem>
                <SelectItem value="3">3.0 ★ and up</SelectItem>
              </SelectContent>
            </Select>

            {/* Sorting selection */}
            <Select
              value={sort}
              onValueChange={(val) => {
                setSort(val || "popular");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest Added</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <ExploreLoading />
        ) : templates.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border space-y-4 shadow-sm">
            <div className="mx-auto bg-muted h-12 w-12 rounded-full flex items-center justify-center text-muted-foreground">
              <Filter className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                No templates found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn't find any templates matching your search criteria.
                Try clearing some filters.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setRating("all");
                setSort("popular");
                setPage(1);
              }}
              className="cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {templates.map((tmpl) => (
                <Card
                  key={tmpl.id}
                  className="card-hover flex flex-col h-full bg-card border-border overflow-hidden"
                >
                  {/* Thumbnail area */}
                  <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center p-6 border-b border-border/50 relative">
                    <Sparkles className="h-8 w-8 text-indigo-500/80 animate-pulse" />
                    <span className="absolute top-3 left-3">
                      <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-none capitalize font-semibold">
                        {tmpl.category}
                      </Badge>
                    </span>
                  </div>

                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                        {tmpl.rating?.toFixed(1) || "New"}
                      </span>
                      <span>
                        {(tmpl.usage_count || 0).toLocaleString()} uses
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-1 text-foreground">
                      {tmpl.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 pb-4 flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 border-t border-muted/50 flex justify-between items-center mt-auto">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                      Tone: {tmpl.tone}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explore/${tmpl.id}`}>
                        <Button
                          size="xs"
                          variant="outline"
                          className="cursor-pointer text-xs font-semibold"
                        >
                          Details
                        </Button>
                      </Link>
                      <Link href={`/editor/${tmpl.id}`}>
                        <Button
                          size="xs"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-xs font-semibold"
                        >
                          Use Template
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-6 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
