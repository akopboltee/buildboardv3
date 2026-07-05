import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-3" />
          Feed
        </Link>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            BuildBoard started because sharing what you're building shouldn't require a following, an audience, or an algorithm's approval.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Every day, thousands of people are making things — writing code at midnight, sketching designs on their lunch break, recording music in their bedroom, building something from nothing. Most of it never gets seen. Not because it isn't worth seeing, but because every existing platform rewards what's already popular.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            BuildBoard is different. There's no algorithm deciding who gets seen. No follower count gatekeeping your reach. No polished final product required. Just a live feed of real people, building real things, in real time.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Post what you're working on today. See what others are making right now. Ask questions. Get curious. That's it.
          </p>

          <div className="border-t border-border/50 pt-6">
            <p className="text-xs text-muted-foreground/60">
              Built by one person who believed the process deserves as much attention as the finished product.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
