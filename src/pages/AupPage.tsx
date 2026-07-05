import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function AupPage() {
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

        <h1 className="text-2xl font-semibold tracking-tight mb-1">Acceptable Use Policy</h1>
        <p className="text-xs text-muted-foreground mb-2">Last updated: June 2026</p>
        <p className="text-xs text-muted-foreground mb-2">Contact: clarviodesigners@gmail.com</p>
        <p className="text-xs text-muted-foreground mb-6">Website: buildboard.pages.dev</p>

        <div className="bg-muted/30 border border-border/50 rounded-md p-4 mb-8">
          <p className="text-xs text-muted-foreground">
            <strong>Notice:</strong> By using Buildboard in any way — whether or not you create an account — you agree to this Acceptable Use Policy. Use of this website constitutes your acceptance of all policies.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Purpose</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Acceptable Use Policy defines the boundaries of how Buildboard may and may not be used. It exists to protect the platform, its users, and the broader community from harm, abuse, and misuse.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              This policy applies to all users of Buildboard — registered or anonymous — and to all content posted, actions taken, and tools used on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Permitted Uses</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Buildboard may be used for the following purposes:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Sharing genuine works in progress across any creative or technical discipline</li>
              <li>Browsing and discovering what other builders and creators are working on</li>
              <li>Commenting on and asking questions about other users' work</li>
              <li>Using the AI-powered Explain feature to understand posts better</li>
              <li>Creating and managing a personal profile to represent your work publicly</li>
              <li>Reporting content or users that violate our policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Prohibited Uses</h2>

            <h3 className="text-sm font-medium text-foreground mb-2">3.1 Harmful and Malicious Activity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not use Buildboard to:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Upload, distribute, or link to malware, viruses, ransomware, spyware, or any other malicious code</li>
              <li>Conduct phishing attacks or attempt to steal credentials or personal information from other users</li>
              <li>Exploit vulnerabilities in the platform or attempt to compromise the security of Buildboard or its users</li>
              <li>Launch denial of service (DoS) or distributed denial of service (DDoS) attacks against Buildboard or any other service</li>
              <li>Attempt to gain unauthorized access to any part of Buildboard's systems, databases, or infrastructure</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.2 Automated and Bot Activity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not use Buildboard to:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Use automated scripts, bots, crawlers, or scrapers to access, collect, or interact with the platform without explicit written permission from us</li>
              <li>Artificially inflate post views, comment counts, or any other metric through automated means</li>
              <li>Create accounts or post content through automated processes</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.3 Circumventing Platform Rules</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Create multiple accounts to circumvent a ban, suspension, or rate limit applied to a previous account</li>
              <li>Use VPNs, proxies, or other tools specifically to evade enforcement actions taken against you</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of Buildboard</li>
              <li>Attempt to bypass our automated content moderation systems</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.4 Commercial Misuse</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not use Buildboard to:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Post spam, promotional content, or advertisements without sharing genuine work alongside it</li>
              <li>Use the platform primarily as a marketing channel for your products or services without contributing meaningfully to the community</li>
              <li>Collect user data from Buildboard for commercial purposes without explicit written permission</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.5 Impersonation and Fraud</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Impersonate any person, brand, organization, or Buildboard staff member</li>
              <li>Create misleading accounts designed to deceive other users</li>
              <li>Post content designed to fraudulently obtain money, credentials, or personal information from other users</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.6 Illegal Activity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may not use Buildboard for any activity that is illegal under Indian law or the laws of your jurisdiction, including but not limited to:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Distributing or accessing child sexual abuse material (CSAM)</li>
              <li>Facilitating fraud, money laundering, or financial crime</li>
              <li>Violating export control laws or sanctions</li>
              <li>Any other activity prohibited by applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Resource Usage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Place unreasonable load on Buildboard's infrastructure through excessive requests, large file uploads beyond stated limits, or other resource-intensive behavior</li>
              <li>Attempt to exceed the rate limits defined in our Terms of Service through any means</li>
              <li>Use Buildboard's AI features in a way that is designed to exhaust API quotas or degrade the experience for other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Reporting Violations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe someone is using Buildboard in violation of this policy, please report it using the in-platform report button or by contacting us directly at clarviodesigners@gmail.com with the subject line "AUP Violation Report."
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Include as much detail as possible — the username, the content in question, and a description of what you believe is happening.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Consequences of Violations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Violations of this Acceptable Use Policy may result in:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Immediate removal of the content in question</li>
              <li>A formal warning issued to your account</li>
              <li>Temporary suspension of your account</li>
              <li>Permanent termination of your account without notice or refund</li>
              <li>Reporting of your activity to relevant law enforcement authorities where required by law</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              The severity of the consequence will be proportionate to the nature and severity of the violation. We reserve the right to take immediate action without warning for serious violations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. No Liability for Misuse</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard is not responsible for how users choose to use the platform. We are not liable for any harm, loss, or damage resulting from misuse of the platform by any user. By using Buildboard, you agree that you are solely responsible for your own actions and any consequences that arise from them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Acceptable Use Policy as the platform grows and new situations arise. Significant changes will be communicated to registered users by email. Continued use of Buildboard after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions about this policy or to report a violation, contact us at:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Email:</strong> clarviodesigners@gmail.com<br />
              <strong>Website:</strong> buildboard.pages.dev
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
