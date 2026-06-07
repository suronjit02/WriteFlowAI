import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-background">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 07, 2026</p>

        <div className="space-y-6 text-foreground/80 leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing or using WriteFlow AI, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you may not register, access, or utilize our editors, templates, or AI drafting agents.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. User Accounts & Verification</h2>
            <p>
              Account creation requires secure authentication via Clerk. You must provide accurate registration details. You are responsible for maintaining the confidentiality of your session tokens and credentials. We reserve the right to ban user accounts if we detect bot behavior, script attacks, or spam reviews.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Ownership of Content</h2>
            <p>
              WriteFlow AI does not claim intellectual property ownership over the texts, blogs, social descriptions, emails, or ad copy you generate using our tools. You own the content drafts and are fully responsible for checking their accuracy, safety, and compliance with copyrights before publishing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Acceptable AI Usage Policy</h2>
            <p>
              You agree not to use our drafting, rewriting, or chat agents to generate hate speech, malware instructions, illegal campaign materials, or spam. Violations of this acceptable use policy may result in immediate suspension, role revocation, or permanent ban from the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Subscriptions and Payments</h2>
            <p>
              We offer Free, Pro, and Team tiers. The specific word count limits, document allowances, and support SLAs are defined in our pricing tables. Subscriptions auto-renew monthly. You may cancel your subscription at any time within your dashboard profile billing screen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Limitation of Liability</h2>
            <p>
              WriteFlow AI is provided "as is" and "as available". We do not guarantee that the Google Gemini outputs will be error-free, factual, or perfectly optimized for SEO. We are not liable for any direct or indirect damages resulting from the loss of content, API downtime, or database migrations.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
