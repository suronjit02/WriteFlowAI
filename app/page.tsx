"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import {
  Sparkles,
  Wand2,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  FileText,
  Zap,
  Globe2,
  Shield,
  Pen,
  BarChart3,
  Mail,
} from "lucide-react";

import Image from "next/image";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  usage_count: number;
  tone: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  blog: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop",
  social: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=200&fit=crop",
  email: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=200&fit=crop",
  ad: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
}

const typingWords = [
  "Blog Posts",
  "Social Media Captions",
  "Email Copy",
  "Ad Content",
];

function TypingEffect() {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [displayed, setDisplayed] = React.useState("");

  React.useEffect(() => {
    const word = typingWords[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex <= word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.substring(0, charIndex));
        setCharIndex((c) => c + 1);
      }, 80);
    } else if (!isDeleting && charIndex > word.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.substring(0, charIndex));
        setCharIndex((c) => c - 1);
      }, 40);
    } else {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % typingWords.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <span className="text-gradient">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-4xl font-extrabold text-gradient">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

export default function LandingPage() {
  const [popularTemplates, setPopularTemplates] = React.useState<Template[]>(
    [],
  );
  const [templatesLoading, setTemplatesLoading] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [newsletterLoading, setNewsletterLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/templates?limit=8&sort=popular")
      .then((r) => r.json())
      .then((d) => setPopularTemplates(d.templates || []))
      .catch(console.error)
      .finally(() => setTemplatesLoading(false));
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setNewsletterLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("You've been subscribed! Welcome to WriteFlow AI.");
    setEmail("");
    setNewsletterLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center min-h-[65vh] overflow-hidden gradient-bg px-4 py-20 sm:py-32">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-8">
          <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-none font-semibold px-4 py-1.5 text-sm rounded-full">
            🚀 Powered by Google Gemini AI
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            Write Better <br className="hidden sm:block" />
            <TypingEffect />
            <br className="hidden sm:block" />
            <span className="text-foreground">with AI</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            WriteFlow AI helps teams plan, generate, review, and publish content{" "}
            <span className="font-semibold text-foreground">10x faster</span>{" "}
            using agentic AI. From blog posts to ad copy — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                Start Writing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-xl border-2 hover:border-indigo-500 transition-all cursor-pointer"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Floating card */}
          <div className="mt-12 mx-auto max-w-md">
            <div className="card-hover bg-card p-5 rounded-2xl border border-border shadow-xl animate-[float_3s_ease-in-out_infinite]">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    AI is generating...
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Professional Blog Post
                  </div>
                </div>
                <Badge className="ml-auto bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-none text-[10px]">
                  Live
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 bg-muted rounded animate-pulse" />
                <div className="h-2.5 bg-muted rounded animate-pulse w-4/5" />
                <div className="h-2.5 bg-muted rounded animate-pulse w-3/5" />
              </div>
              <div className="mt-3 flex gap-2">
                {["SEO", "800 words", "Formal"].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              A complete content creation suite powered by the latest AI models.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-7 w-7 text-indigo-500" />,
                title: "AI Drafting",
                desc: "Generate full-length, SEO-optimized content in seconds. Blogs, emails, ads, social posts — all at the click of a button.",
                color: "from-indigo-500/10 to-indigo-500/5",
              },
              {
                icon: <Wand2 className="h-7 w-7 text-purple-500" />,
                title: "Tone Rewriting",
                desc: "Instantly rewrite any text in a formal, casual, persuasive, or friendly tone. Maintain your voice across all content types.",
                color: "from-purple-500/10 to-purple-500/5",
              },
              {
                icon: <Users className="h-7 w-7 text-emerald-500" />,
                title: "Team Collaboration",
                desc: "Invite teammates, share documents, manage roles, and review content together — all from one unified workspace.",
                color: "from-emerald-500/10 to-emerald-500/5",
              },
              {
                icon: <FileText className="h-7 w-7 text-amber-500" />,
                title: "12 Templates",
                desc: "Start faster with professionally crafted templates for blogs, social media, email newsletters, and advertising copy.",
                color: "from-amber-500/10 to-amber-500/5",
              },
              {
                icon: <BarChart3 className="h-7 w-7 text-pink-500" />,
                title: "Analytics Dashboard",
                desc: "Track your AI usage, document output, and team activity. Data-driven insights to improve your content strategy.",
                color: "from-pink-500/10 to-pink-500/5",
              },
              {
                icon: <Shield className="h-7 w-7 text-cyan-500" />,
                title: "Enterprise Security",
                desc: "Role-based access, Clerk authentication, and Supabase row-level security to keep your content and data safe.",
                color: "from-cyan-500/10 to-cyan-500/5",
              },
            ].map((f) => (
              <Card key={f.title} className="card-hover bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`h-14 w-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 gradient-bg">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From blank page to published content in under 2 minutes.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: <FileText className="h-7 w-7 text-indigo-500" />,
                title: "Pick a Template",
                desc: "Browse 12+ professionally designed templates optimized for conversion and engagement.",
              },
              {
                step: "02",
                icon: <Pen className="h-7 w-7 text-purple-500" />,
                title: "Enter Your Topic",
                desc: "Tell the AI what to write about, your target audience, preferred tone, and word count.",
              },
              {
                step: "03",
                icon: <Sparkles className="h-7 w-7 text-emerald-500" />,
                title: "AI Generates",
                desc: "Gemini AI instantly drafts complete content with title, body, meta description, and tags.",
              },
              {
                step: "04",
                icon: <Zap className="h-7 w-7 text-amber-500" />,
                title: "Edit & Publish",
                desc: "Refine with the inline editor, rewrite sections, then save as draft or publish directly.",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {s.step.slice(-1)}
                </div>
                <h3 className="font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR TEMPLATES ── */}
      <section className="py-20 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                Popular Templates
              </h2>
              <p className="text-muted-foreground mt-1">
                Most-used writing templates by our community
              </p>
            </div>
            <Link href="/explore">
              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {templatesLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 space-y-3"
                >
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {popularTemplates.map((tmpl) => (
                <Card key={tmpl.id} className="card-hover group h-full bg-card overflow-hidden">
                  <div className="relative h-28 w-full overflow-hidden rounded-t-xl border-b border-border/50">
                    <Image
                      src={CATEGORY_IMAGES[tmpl.category] ?? CATEGORY_IMAGES.blog}
                      alt={`${tmpl.category} template`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 text-indigo-700 dark:text-indigo-300 border-none text-[10px] font-semibold capitalize backdrop-blur-sm">
                      {tmpl.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-current mr-0.5" />
                        {tmpl.rating?.toFixed(1)}
                      </span>
                      <span>
                        {(tmpl.usage_count || 0).toLocaleString()} uses
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tmpl.description}
                    </p>
                    <Link href={`/explore/${tmpl.id}`}>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-xs"
                      >
                        Use Template
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/explore">
              <Button variant="outline" className="cursor-pointer">
                View All Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-4 gradient-bg">
        <div className="mx-auto max-w-5xl">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Start free, upgrade when you need more power.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/mo",
                desc: "Perfect for individuals getting started",
                features: [
                  "5 documents",
                  "10,000 words/month",
                  "1 AI agent",
                  "Basic templates",
                  "Email support",
                ],
                cta: "Get Started Free",
                href: "/sign-up",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/mo",
                desc: "For professionals and growing teams",
                features: [
                  "Unlimited documents",
                  "500,000 words/month",
                  "All 4 AI agents",
                  "All 12 templates",
                  "Priority support",
                  "Advanced analytics",
                ],
                cta: "Start Pro Trial",
                href: "/sign-up",
                highlight: true,
              },
              {
                name: "Team",
                price: "$49",
                period: "/mo",
                desc: "For agencies and large content teams",
                features: [
                  "Everything in Pro",
                  "10 team members",
                  "Team collaboration",
                  "Admin dashboard",
                  "Custom templates",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                href: "/contact",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105"
                    : "border-border bg-card shadow-sm hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 border-none font-bold px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                <div>
                  <div
                    className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-indigo-200" : "text-muted-foreground"}`}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-foreground"}`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-muted-foreground"}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-2 ${plan.highlight ? "text-indigo-200" : "text-muted-foreground"}`}
                  >
                    {plan.desc}
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-indigo-100" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-indigo-200" : "text-indigo-500"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`w-full cursor-pointer font-semibold ${
                      plan.highlight
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section className="py-20 px-4 bg-background border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { end: 10000, suffix: "+", label: "Users Worldwide" },
              { end: 500000, suffix: "+", label: "Words Generated" },
              { end: 50, suffix: "+", label: "Templates Available" },
              { end: 99, suffix: ".9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <CountUp end={stat.end} suffix={stat.suffix} />
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 gradient-bg">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Loved by Content Creators
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our community is saying
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah Chen",
                role: "Content Marketing Manager at TechCorp",
                avatar: "SC",
                review:
                  "WriteFlow AI has completely transformed our content pipeline. We went from producing 4 blog posts a week to over 20. The tone rewriting feature alone saves us hours of editing every day.",
                stars: 5,
              },
              {
                name: "Marcus Rodriguez",
                role: "Freelance Copywriter",
                avatar: "MR",
                review:
                  "As a freelancer, time is money. WriteFlow AI lets me take on 3x more clients without sacrificing quality. The AI chat assistant inside the editor is like having a writing partner available 24/7.",
                stars: 5,
              },
              {
                name: "Priya Patel",
                role: "Head of Growth at StartupX",
                avatar: "PP",
                review:
                  "The template library is phenomenal. We use it for everything — LinkedIn articles, Facebook ads, email campaigns. The quality is consistently impressive and on-brand.",
                stars: 5,
              },
            ].map((t) => (
              <Card key={t.name} className="card-hover bg-card h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex text-amber-400">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    "{t.review}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-background">
        <div className="mx-auto max-w-3xl">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about WriteFlow AI
            </p>
          </div>
          <Accordion className="space-y-3">
            {[
              {
                q: "What AI model powers WriteFlow AI?",
                a: "WriteFlow AI is powered by Google's Gemini 1.5 Flash model — one of the most capable and cost-efficient AI models available. It excels at long-form content generation, tone adaptation, and contextual understanding.",
              },
              {
                q: "How many documents can I create on the free plan?",
                a: "The free plan allows you to create up to 5 documents and generate up to 10,000 words per month. You have access to 1 AI agent (the Draft agent). Upgrade to Pro for unlimited documents and all agents.",
              },
              {
                q: "Can I customize the AI-generated content?",
                a: "Absolutely! The AI provides a complete draft, and you can edit every part of it in our rich text editor. You can also use the Rewrite agent to change the tone of any section, or chat with the AI assistant for specific guidance.",
              },
              {
                q: "Is my content and data secure?",
                a: "Yes, security is our top priority. We use Clerk for enterprise-grade authentication, Supabase with row-level security for database access control, and all data is encrypted at rest and in transit.",
              },
              {
                q: "Do you support team collaboration?",
                a: "Yes! The Team plan supports up to 10 team members with role-based permissions. Admins can manage users, templates, and review content across the entire organization.",
              },
              {
                q: "What content types can WriteFlow AI generate?",
                a: "WriteFlow AI supports 4 content categories: Blog Posts (SEO articles, how-to guides, LinkedIn articles), Social Media (Instagram captions, Twitter threads, stories), Email (newsletters, welcome emails, promotional emails), and Ad Copy (Facebook ads, Google ads, product descriptions).",
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-5 bg-card shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-indigo-600 hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 px-4 gradient-bg border-y border-border">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground">
            Get the latest AI writing tips, new template announcements, and
            WriteFlow AI updates delivered to your inbox.
          </p>
          <form
            onSubmit={handleNewsletter}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-background"
              required
            />
            <Button
              type="submit"
              disabled={newsletterLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 px-6 cursor-pointer shrink-0"
            >
              {newsletterLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
