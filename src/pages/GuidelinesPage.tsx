import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to feed
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight mb-1">Community Guidelines</h1>
        <p className="text-xs text-muted-foreground mb-2">Last updated: June 2026</p>
        <p className="text-xs text-muted-foreground mb-2">Contact: clarviodesigners@gmail.com</p>
        <p className="text-xs text-muted-foreground mb-6">Website: buildboard.pages.dev</p>

        <div className="bg-muted/30 border border-border/50 rounded-md p-4 mb-8">
          <p className="text-xs text-muted-foreground">
            <strong>Notice:</strong> By using Buildboard in any way, you agree to follow these Community Guidelines. Violations may result in content removal, account suspension, or permanent ban without warning.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">What Buildboard Is For</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard is a live public feed for builders and creators to share what they are working on — code, designs, music, art, writing, games, and anything else being made. It is a place for genuine creative work, real progress, and honest conversation.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              The community works best when everyone shares openly, engages respectfully, and focuses on the work.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">The Golden Rule</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Share what you are genuinely making. Engage with what others are genuinely making. Treat everyone with basic respect.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Everything else in these guidelines flows from this.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">What We Encourage</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Sharing your work in progress — rough, unfinished, and imperfect is completely fine</li>
              <li>Asking honest questions about what others are building</li>
              <li>Giving constructive feedback when someone asks for it</li>
              <li>Celebrating your own progress, no matter how small</li>
              <li>Exploring any creative or technical discipline — there is no wrong type of work to share here</li>
              <li>Being yourself — anonymous or identified, both are welcome</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">What Is Not Allowed</h2>

            <h3 className="text-sm font-medium text-foreground mb-2">1. Hate Speech</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Content that attacks, demeans, dehumanizes, or threatens any person or group based on race, ethnicity, religion, gender, sexual orientation, gender identity, disability, nationality, caste, or any other protected characteristic is strictly prohibited.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              This includes slurs, dehumanizing comparisons, calls for discrimination, and content that portrays any group as inferior.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">2. Harassment and Bullying</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Targeting an individual with repeated negative, hostile, or unwanted attention</li>
              <li>Publicly mocking, humiliating, or shaming another user</li>
              <li>Encouraging others to attack or harass a specific person</li>
              <li>Sending threatening or intimidating messages through comments or any other feature on the platform</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3. Threats and Violence</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Threats of physical harm toward any individual or group, whether credible or not</li>
              <li>Content that glorifies, celebrates, or encourages acts of violence</li>
              <li>Content that instructs others on how to commit violence</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">4. Sexual Content</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Sexually explicit content of any kind is not permitted on Buildboard</li>
              <li>Nudity in a non-artistic context is not permitted</li>
              <li>Sexual content involving anyone under the age of 18 is absolutely prohibited and will result in an immediate permanent ban and report to relevant authorities with no exceptions</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">5. Self-Harm and Suicide</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Content that promotes, glorifies, or provides instructions for self-harm or suicide is not allowed</li>
              <li>If you are struggling, please reach out to a mental health professional or crisis helpline in your country</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6. Spam and Low-Effort Content</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Repeatedly posting the same or similar content</li>
              <li>Posting content with no genuine creative or work-related purpose</li>
              <li>Flooding the feed with irrelevant or off-topic posts</li>
              <li>Using Buildboard to drive traffic to unrelated products or services without any genuine sharing of work</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">7. Impersonation and Deception</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Pretending to be another person, creator, brand, public figure, or Buildboard staff</li>
              <li>Creating fake accounts to evade a ban or circumvent rate limits</li>
              <li>Deliberately misrepresenting your work as something it is not</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">8. Misinformation</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Sharing deliberately false information that could cause real-world harm</li>
              <li>Spreading health misinformation that contradicts established scientific or medical consensus</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">9. Privacy Violations (Doxxing)</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Posting another person's private information without their consent — including their real name, address, phone number, email, workplace, or any other identifying details</li>
              <li>Sharing screenshots of private conversations without consent</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">10. Copyright Infringement</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Posting someone else's work and claiming it as your own</li>
              <li>Uploading copyrighted music, video, images, or code without permission or proper attribution</li>
              <li>See our Copyright Policy for full details on how we handle infringement claims</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">11. Illegal Content</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Any content that is illegal under Indian law or the laws of your jurisdiction</li>
              <li>Content that facilitates or promotes illegal activity of any kind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">How Moderation Works</h2>

            <h3 className="text-sm font-medium text-foreground mb-2">Automated Moderation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every post and comment is automatically checked before it is published using a word filter and OpenAI's Moderation API. Content that violates our guidelines is rejected instantly with a message explaining why.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">Community Reporting</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every post, comment, and user profile has a report button. When you report something, you can choose from the following reasons:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Spam</li>
              <li>Harassment</li>
              <li>Hate speech</li>
              <li>Inappropriate content</li>
              <li>Misinformation</li>
              <li>Copyright infringement</li>
              <li>Other</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              All reports are reviewed manually. Abusing the report system by submitting false or malicious reports is itself a violation of these guidelines.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">What Happens After a Report</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>We review the reported content as soon as possible</li>
              <li>If it violates these guidelines, the content is removed</li>
              <li>Depending on severity, the user may receive a warning, a temporary suspension, or a permanent ban</li>
              <li>We do not notify the reporter of the specific action taken, but we do take every report seriously</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">Appeals</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe your content was removed in error, contact us at clarviodesigners@gmail.com with the subject line "Content Appeal" and a description of the post or comment in question. We will review it and respond within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Consequences</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We apply consequences proportionate to the violation:
            </p>
            <table className="text-sm text-muted-foreground w-full mt-3 border border-border/50">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-2 font-medium">Severity</th>
                  <th className="text-left p-2 font-medium">Examples</th>
                  <th className="text-left p-2 font-medium">Consequence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-2">Minor</td>
                  <td className="p-2">Spam, off-topic posts</td>
                  <td className="p-2">Content removed, warning</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-2">Moderate</td>
                  <td className="p-2">Harassment, misinformation</td>
                  <td className="p-2">Content removed, temporary suspension</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-2">Severe</td>
                  <td className="p-2">Hate speech, threats, doxxing</td>
                  <td className="p-2">Permanent ban</td>
                </tr>
                <tr>
                  <td className="p-2">Critical</td>
                  <td className="p-2">CSAM, credible violence threats</td>
                  <td className="p-2">Immediate permanent ban, report to authorities</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We reserve the right to skip warnings and move directly to permanent bans for severe violations at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">A Note on Anonymous Users</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Anonymous posting is welcome on Buildboard. Anonymity does not exempt anyone from these guidelines. Anonymous users who violate these guidelines will have their content removed and their IP address may be banned.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Changes to These Guidelines</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these guidelines as the community grows. Significant changes will be communicated to registered users by email. Continued use of Buildboard after changes are posted constitutes acceptance of the updated guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about these guidelines or want to report something that the in-platform report system cannot handle, contact us at:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Email:</strong> clarviodesigners@gmail.com
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
