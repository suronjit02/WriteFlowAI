import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Award, Compass, Shield, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  const values = [
    {
      icon: Compass,
      title: "Agentic Autonomy",
      description: "We believe AI shouldn't just autocomplete; it should collaborate. Our agents help guide structural outline, tone adjustment, and research workflow."
    },
    {
      icon: Shield,
      title: "Content Safety",
      description: "Your data is yours. We implement rigorous security measures ensuring drafts, user metadata, and reviews are encrypted and private."
    },
    {
      icon: Award,
      title: "Professional Excellence",
      description: "We tune prompts and templates specifically for high conversion rates, professional style guidelines, and engagement metrics."
    }
  ]

  const team = [
    {
      name: "Marcus Vance",
      role: "CEO & Co-Founder",
      bio: "Former Content Director with 10+ years scaling SaaS marketing systems.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Sarah Chen",
      role: "CTO & Co-Founder",
      bio: "AI Researcher specializing in generative NLP, agent architectures, and LLM fine-tuning.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Elena Rostova",
      role: "Head of Product Design",
      bio: "Passionate about creating fluid interfaces that balance human ingenuity with AI power.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Devon Miller",
      role: "Lead Full-Stack Engineer",
      bio: "Next.js enthusiast focused on building high-performance systems and real-time workspaces.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Mission Statement Hero */}
        <section className="relative overflow-hidden bg-card border-b py-20 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Empowering Human Creativity
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our mission is to build the ultimate collaborative content cockpit. We want to remove the dread of the blank page, helping professional writers and content marketing teams ship flawless work 10x faster.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Core Values</h2>
            <p className="text-muted-foreground">The tenets driving how we build products and interfaces.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((v, idx) => {
              const Icon = v.icon
              return (
                <Card key={idx} className="card-hover bg-card text-card-foreground h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/20 border-t border-b border-border px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Meet the Innovators</h2>
              <p className="text-muted-foreground">The designers, engineers, and strategists behind WriteFlow AI.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((t, idx) => (
                <div key={idx} className="bg-card border border-border p-6 rounded-xl text-center space-y-4 shadow-sm hover:shadow-md transition">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-indigo-500"
                  />
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-lg">{t.name}</h3>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{t.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
