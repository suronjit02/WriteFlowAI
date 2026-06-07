"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations
    if (!form.name.trim()) return toast.error("Please enter your name")
    if (!form.email.trim()) return toast.error("Please enter your email")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) return toast.error("Please enter a valid email address")
    if (!form.subject.trim()) return toast.error("Please enter a subject")
    if (!form.message.trim() || form.message.trim().length < 10) {
      return toast.error("Message must be at least 10 characters long")
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      toast.success("Message sent successfully!")
      setForm({ name: "", email: "", subject: "", message: "" })
    }, 1200)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Contact Our Team</h1>
            <p className="text-lg text-muted-foreground">
              Have questions about pricing, features, API access, or enterprise contracts? We're here to help.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Contact details */}
            <div className="space-y-6 md:col-span-1">
              <div className="bg-card border border-border p-6 rounded-xl space-y-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">Get In Touch</h2>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500 mt-1">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Email Support</p>
                    <a href="mailto:support@writeflowai.com" className="text-sm text-indigo-500 hover:underline">
                      support@writeflowai.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500 mt-1">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Call Us</p>
                    <p className="text-sm text-muted-foreground">+1 (800) 555-FLOW</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500 mt-1">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Office HQ</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      100 Pine Street, Suite 1200<br />San Francisco, CA 94111
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we will get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                      <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground">Thank You!</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Your message has been delivered. Our support representative will contact you soon.
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setSuccess(false)} className="cursor-pointer">
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help you?"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea
                          id="message"
                          rows={6}
                          placeholder="Type your message details here..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <span>Sending Message...</span>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
