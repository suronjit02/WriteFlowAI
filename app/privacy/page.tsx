import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-background">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 07, 2026</p>

        <div className="space-y-6 text-foreground/80 leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
              Welcome to WriteFlow AI. We value your privacy and are committed to protecting your personal data. This privacy policy describes how we collect, process, secure, and share information when you use our web application, API integrations, and billing services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your Clerk account identifiers (names, emails, profile avatars), subscription levels, reviews submitted for templates, billing variables, and document drafts. We also collect metadata of AI operations (agent type, prompt snippets, and token estimates) stored in our database.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
            <p>
              We use your data to authenticate your dashboard profile, load and save document history, provide localized template suggestions, optimize prompt deliveries to the Google Gemini API, process review approvals, and supply monthly dashboard charts. We do not sell your personal data or document history to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. AI Processing & Third-Party APIs</h2>
            <p>
              Our application routes prompts, selected rewrite texts, and chat histories to Google Gemini APIs. The transmission is secure and governed by Google’s security policies. Your generated drafts remain your property and are not used by us or Google to train publicly shared underlying language models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Data Retention</h2>
            <p>
              We retain document history, user profiles, and review entries as long as your Clerk account is active. If you initiate account deletion via Clerk or request it through our support lines, we will purge all database records associated with your UUID within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please send an email inquiry to support@writeflowai.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
