import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function CopyrightPage() {
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

        <h1 className="text-2xl font-semibold tracking-tight mb-1">Copyright Policy</h1>
        <p className="text-xs text-muted-foreground mb-2">Last updated: June 2026</p>
        <p className="text-xs text-muted-foreground mb-2">Contact: clarviodesigners@gmail.com</p>
        <p className="text-xs text-muted-foreground mb-6">Website: buildboard.pages.dev</p>

        <div className="bg-muted/30 border border-border/50 rounded-md p-4 mb-8">
          <p className="text-xs text-muted-foreground">
            <strong>Notice:</strong> By using Buildboard in any way, you agree to this Copyright Policy. Use of this website constitutes your acceptance of all policies.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Our Commitment to Copyright</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard respects the intellectual property rights of creators. We expect all users to do the same. Posting content that you do not own or do not have permission to share is a violation of our Community Guidelines and these Terms, and may expose you to legal liability.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Content You May Post</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You may post content on Buildboard that:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>You created yourself</li>
              <li>You own the copyright to</li>
              <li>You have explicit permission from the copyright holder to share</li>
              <li>Is in the public domain</li>
              <li>Is shared under a Creative Commons or other open license that permits sharing, provided you include proper attribution</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              If you are sharing someone else's work as inspiration or reference, always credit the original creator clearly in your post.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Content You May Not Post</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You may not post:</p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Music, videos, images, code, writing, or any other content that belongs to someone else without their permission</li>
              <li>Content from commercial sources such as films, TV shows, music albums, or video games unless you have explicit rights to share it</li>
              <li>Works that are protected by copyright and are not your own, even if you found them freely available online — "freely available" does not mean "free to repost"</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. How to Submit a Copyright Infringement Notice (DMCA)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe that content posted on Buildboard infringes your copyright, you may submit a copyright infringement notice to us. To be valid, your notice must include all of the following:
            </p>
            <ol className="text-sm text-muted-foreground leading-relaxed list-decimal pl-6 mt-3 space-y-2">
              <li><strong>Your full legal name and contact information</strong> — including your email address and, if applicable, your mailing address and phone number</li>
              <li><strong>A description of the copyrighted work</strong> you claim has been infringed — be specific about what the original work is and where it can be found</li>
              <li><strong>A description of the infringing content on Buildboard</strong> — include the URL or specific location of the content you believe infringes your copyright</li>
              <li><strong>A statement that you have a good faith belief</strong> that the use of the material is not authorized by the copyright owner, its agent, or the law</li>
              <li><strong>A statement that the information in your notice is accurate</strong> and, under penalty of perjury, that you are the copyright owner or authorized to act on behalf of the copyright owner</li>
              <li><strong>Your electronic or physical signature</strong></li>
            </ol>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              Send your notice to:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Email:</strong> clarviodesigners@gmail.com<br />
              <strong>Subject line:</strong> DMCA Copyright Infringement Notice
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Incomplete notices will not be processed. We are not responsible for any legal consequences arising from submitting a false or misleading copyright notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. What Happens After We Receive a Valid Notice</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Upon receiving a valid and complete copyright infringement notice, we will:</p>
            <ol className="text-sm text-muted-foreground leading-relaxed list-decimal pl-6 mt-3">
              <li>Review the notice to confirm it meets the requirements above</li>
              <li>Remove or disable access to the allegedly infringing content promptly</li>
              <li>Notify the user who posted the content that it has been removed and why</li>
              <li>Provide the user with an opportunity to submit a counter-notice if they believe the removal was in error</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Counter-Notice</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If your content was removed as a result of a copyright infringement notice and you believe it was removed in error — for example, because you own the content, have permission to share it, or believe it qualifies as fair use — you may submit a counter-notice.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">Your counter-notice must include:</p>
            <ol className="text-sm text-muted-foreground leading-relaxed list-decimal pl-6 mt-2">
              <li>Your full legal name and contact information</li>
              <li>Identification of the content that was removed and where it appeared on Buildboard before removal</li>
              <li>A statement under penalty of perjury that you have a good faith belief that the content was removed as a result of mistake or misidentification</li>
              <li>A statement that you consent to the jurisdiction of the courts of India</li>
              <li>Your electronic or physical signature</li>
            </ol>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              Send your counter-notice to:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Email:</strong> clarviodesigners@gmail.com<br />
              <strong>Subject line:</strong> DMCA Counter-Notice
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Upon receiving a valid counter-notice, we will notify the original complainant. If the complainant does not notify us within 10 business days that they have filed a legal action, we may restore the removed content at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Repeat Infringers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard has a strict repeat infringer policy. Users who receive multiple valid copyright infringement notices will have their accounts permanently terminated. We reserve the right to terminate accounts of repeat infringers at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. No Legal Advice</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nothing in this Copyright Policy constitutes legal advice. If you have questions about copyright law and how it applies to your specific situation, we recommend consulting a qualified legal professional.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For all copyright-related matters, contact us at:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Email:</strong> clarviodesigners@gmail.com<br />
              <strong>Subject line:</strong> DMCA Copyright Infringement Notice (for takedown requests) or DMCA Counter-Notice (for appeals)
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
