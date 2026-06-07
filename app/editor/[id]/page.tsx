"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import toast from "react-hot-toast";
import {
  Sparkles,
  Wand2,
  Send,
  Save,
  CheckCircle,
  Loader2,
  MessageSquare,
  ChevronLeft,
  AlignLeft,
  Bold,
  Italic,
  List,
  Type,
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: string;
  tone: string;
  estimated_words: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const templateId = params?.id as string;

  // Template state
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = React.useState(true);

  // Generation form state
  const [topic, setTopic] = React.useState("");
  const [tone, setTone] = React.useState("formal");
  const [audience, setAudience] = React.useState("");
  const [wordCount, setWordCount] = React.useState([600]);
  const [generating, setGenerating] = React.useState(false);

  // Editor state
  const [docTitle, setDocTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [documentId, setDocumentId] = React.useState<string | null>(null);

  // Rewrite state
  const [rewriting, setRewriting] = React.useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI writing assistant. Generate some content first, then I can help you improve it, answer questions, or refine specific sections.",
    },
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [chatLoading, setChatLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auth guard
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch template
  React.useEffect(() => {
    if (!templateId) return;
    fetch(`/api/templates/${templateId}`)
      .then((r) => r.json())
      .then((d) => {
        setTemplate(d);
        if (d.tone) setTone(d.tone);
        if (d.estimated_words) setWordCount([d.estimated_words]);
      })
      .catch(console.error)
      .finally(() => setTemplateLoading(false));
  }, [templateId]);

  const wordCountCalc = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Strips common LLM markdown artifacts from plain-text content
  const cleanContent = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // **bold** → bold
      .replace(/\*(.*?)\*/g, "$1") // *italic* → italic
      .replace(/^#{1,6}\s+/gm, "") // ## Heading → Heading
      .replace(/^[-*+]\s+/gm, "• ") // - item → • item
      .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, "")) // strip backticks
      .trim();
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic before generating.");
      return;
    }
    if (!audience.trim()) {
      toast.error("Please specify your target audience.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/agents/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          audience,
          wordCount: wordCount[0],
          type: template?.category || "blog",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const data = await res.json();

      // Set title from parsed response
      setDocTitle(data.title || `${topic} - ${template?.category || "Draft"}`);

      // Set content, stripping ** markdown bold formatting
      const rawContent: string = data.content || "";
      setContent(cleanContent(rawContent));
      toast.success("Content generated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to generate content.";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRewrite = async () => {
    if (!content.trim()) {
      toast.error("Please generate or write some content first.");
      return;
    }
    setRewriting(true);
    try {
      const res = await fetch("/api/agents/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, tone }),
      });
      if (!res.ok) throw new Error("Rewrite failed");
      const data = await res.json();
      setContent(data.rewrittenText || content);
      toast.success("Content rewritten successfully!");
    } catch {
      toast.error("Failed to rewrite content.");
    } finally {
      setRewriting(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!content.trim()) {
      toast.error("Cannot save empty content.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: docTitle || "Untitled Document",
        content,
        type: template?.category || "blog",
        status,
        word_count: wordCountCalc,
        template_id: templateId,
      };

      let res;
      if (documentId) {
        res = await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      const doc = await res.json();
      if (!documentId) setDocumentId(doc.id);
      toast.success(
        status === "published" ? "Document published!" : "Draft saved!",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save document.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          documentContext: content,
          conversationHistory: chatMessages.slice(-6),
        }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />

      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            {templateLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {template?.category}
                </Badge>
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {template?.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave("draft")}
              disabled={saving || !content}
              className="cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={saving || !content}
              className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-grow mx-auto max-w-[1600px] w-full grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-0 divide-x divide-border">
        {/* LEFT: Generation Controls */}
        <aside className="p-5 bg-background space-y-5 overflow-y-auto">
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              AI Settings
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic *
                </Label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How to improve remote team productivity"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-medium">
                  Target Audience *
                </Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Marketing professionals"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={(v) => setTone(v || "formal")}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "formal",
                      "casual",
                      "friendly",
                      "persuasive",
                      "neutral",
                      "humorous",
                    ].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Word Count</Label>
                  <span className="text-sm font-semibold text-indigo-600">
                    {wordCount[0]} words
                  </span>
                </div>
                <Slider
                  value={wordCount}
                  onValueChange={(value) => setWordCount(value as number[])}
                  min={100}
                  max={2000}
                  step={50}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>2000</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer font-semibold"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {content && (
                <Button
                  onClick={handleRewrite}
                  disabled={rewriting}
                  variant="outline"
                  className="w-full cursor-pointer"
                >
                  {rewriting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Rewrite with{" "}
                      {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {content && (
            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Document Stats
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {wordCountCalc}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Words
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {content.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Characters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER: Editor */}
        <main className="flex flex-col bg-background">
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 px-5 py-2 border-b border-border bg-muted/30">
            {[
              { icon: <Bold className="h-4 w-4" />, label: "Bold" },
              { icon: <Italic className="h-4 w-4" />, label: "Italic" },
              { icon: <List className="h-4 w-4" />, label: "List" },
              { icon: <AlignLeft className="h-4 w-4" />, label: "Align" },
              { icon: <Type className="h-4 w-4" />, label: "Heading" },
            ].map((tool) => (
              <button
                key={tool.label}
                title={tool.label}
                className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {tool.icon}
              </button>
            ))}
          </div>

          <div className="flex-grow p-5 space-y-4 overflow-y-auto">
            {/* Title */}
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title..."
              className="w-full text-3xl font-extrabold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
            />

            {/* Content area */}
            {generating ? (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-indigo-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-semibold">
                    AI is writing your content...
                  </span>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 ${i % 3 === 2 ? "w-3/5" : "w-full"}`}
                  />
                ))}
              </div>
            ) : content ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[calc(100vh-340px)] text-base leading-relaxed text-foreground bg-transparent border-none outline-none resize-none focus:ring-0 placeholder:text-muted-foreground"
                placeholder="Your AI-generated content will appear here..."
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Ready to Write
                </h3>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Fill in your topic and audience on the left panel, then click{" "}
                  <strong>Generate Content</strong> to let Gemini AI create your
                  first draft.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT: Chat Assistant */}
        <aside className="flex flex-col bg-background h-[calc(100vh-8rem)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              AI Writing Assistant
            </h3>
            <Badge className="ml-auto bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-none text-[10px]">
              Online
            </Badge>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div
                      className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-border">
            <form onSubmit={handleChat} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the AI assistant..."
                className="flex-1 bg-background text-sm"
                disabled={chatLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
