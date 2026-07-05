import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function TermsPage() {
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

        <h1 className="text-2xl font-semibold tracking-tight mb-1">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mb-2">Last updated: June 2026</p>
        <p className="text-xs text-muted-foreground mb-6">Contact: clarviodesigners@gmail.com</p>

        <div className="bg-muted/30 border border-border/50 rounded-md p-4 mb-8">
          <p className="text-xs text-muted-foreground">
            <strong>Notice:</strong> By using Buildboard in any way — whether or not you create an account, whether or not you post anything, and whether or not you have read these terms — you agree to be bound by these Terms of Service. If you do not agree, you must stop using Buildboard immediately.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. About Buildboard</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard is a public platform where builders, creators, and curious people share what they are currently working on. Anyone can browse the feed. Users may post text, images, and videos anonymously or with an account. Other users can comment, ask questions, and use AI-powered explanations on any post.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Buildboard is operated as an independent platform based in India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be at least <strong>13 years old</strong> to use Buildboard. By using the platform, you confirm that you are 13 years of age or older.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              If you are between 13 and 18 years old, you confirm that you have obtained consent from a parent or legal guardian to use the platform.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We reserve the right to terminate any account we reasonably believe belongs to a user under the age of 13 without prior notice.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              You must strictly abide by the Community Guidelines, Acceptable Use Policy, DMCA Notice/Copyright Policies of the website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Accounts</h2>
            <h3 className="text-sm font-medium text-foreground mb-2">3.1 Creating an Account</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creating an account is optional. You may browse, post, and comment anonymously without an account. However, an account gives you additional features including a profile page, higher post rate limits, and the ability to manage your content across devices.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.2 Account Responsibility</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you create an account, you are responsible for:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Keeping your password secure and confidential</li>
              <li>All activity that occurs under your account</li>
              <li>Ensuring your account information is accurate</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              You must notify us immediately at clarviodesigners@gmail.com if you suspect unauthorized access to your account.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.3 One Account Per Person</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may not create multiple accounts to circumvent bans, rate limits, or any other restriction we have imposed on a previous account.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">3.4 Account Termination by Us</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or permanently terminate any account at any time, for any reason, with or without notice. Reasons may include but are not limited to violations of these Terms, abusive behavior, or inactivity. We are not liable to you or any third party for any termination of your account.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Any violation of all documents listed on the website may result in account termination/blockage from using BuildBoard.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Anonymous Posting</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users who do not have an account may post and comment anonymously. When an anonymous user first posts, a randomly generated Guest ID is created and stored in their browser's localStorage. This Guest ID is invisible to all users and is used only internally to allow deletion of that user's own content and to enforce rate limits. Clearing your browser data will permanently remove your Guest ID and your ability to delete your anonymous posts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Content — What You Can Post</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard is a platform for sharing what you are building or creating. You may post:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Works in progress — code, designs, music, art, writing, games, or any other creative or technical project</li>
              <li>Updates on what you are currently working on</li>
              <li>Questions or thoughts related to your work</li>
              <li>Appropriate Images and videos related to your project (subject to file type and size limits)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Content — What Is Prohibited</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following content is strictly prohibited on Buildboard. Violations may result in immediate content removal, account suspension, or permanent ban without warning.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.1 Harmful and Illegal Content</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Content that promotes, glorifies, or facilitates violence or harm to any person or group</li>
              <li>Content that is illegal under Indian law or the laws of the user's jurisdiction</li>
              <li>Content that facilitates or promotes illegal activities</li>
              <li>Child sexual abuse material (CSAM) or any sexual content involving minors — this will result in immediate permanent ban and reporting to relevant authorities</li>
              <li>Any inappropriate content that we found to be inappropriate will be removed.</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.2 Hate Speech and Harassment</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Content that attacks, demeans, or threatens individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, nationality, or any other protected characteristic</li>
              <li>Targeted harassment, bullying, or intimidation of any individual</li>
              <li>Threats of any kind, including credible and non-credible threats</li>
              <li>Doxxing — posting private personal information about another person without their consent</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.3 Spam and Manipulation</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Repetitive, irrelevant, or low-effort posts intended to flood the feed</li>
              <li>Coordinated inauthentic behavior or bot activity</li>
              <li>Impersonating another person, creator, brand, or public figure</li>
              <li>Posting content designed to deceive or deliberately mislead users</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.4 Misinformation</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Deliberately false information that could cause real-world harm</li>
              <li>Health misinformation that contradicts established scientific or medical consensus</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.5 Copyright and Intellectual Property</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Content that infringes on the copyright, trademark, or intellectual property rights of any third party</li>
              <li>Posting someone else's work and claiming it as your own</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">6.6 Inappropriate Content</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6">
              <li>Sexually explicit content or nudity</li>
              <li>Graphic violence or gore</li>
              <li>Content that promotes self-harm or suicide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Your Content — Ownership and License</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You retain full ownership of all content you post on Buildboard.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              By posting content on Buildboard, you grant us a non-exclusive, royalty-free, worldwide license to display, store, reproduce, and distribute your content solely for the purpose of operating and providing the Buildboard platform. This license ends when you delete your content or your account.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We will never sell your content to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Content Moderation</h2>
            <h3 className="text-sm font-medium text-foreground mb-2">8.1 Automated Moderation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All posts and comments are automatically checked before being published using:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>A word filter that blocks known profanity and slurs</li>
              <li>OpenAI's Moderation API, which analyzes both text and images for toxicity, harassment, hate speech, sexual content, violence, and self-harm</li>
            </ul>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">8.2 User Reporting</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Any user may report a post, comment, or account using the report button. Reports are reviewed manually. We reserve the right to take any action we deem appropriate including removing content, issuing warnings, or banning accounts.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">8.3 Our Discretion</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to remove any content at any time for any reason, including content that does not violate these Terms but that we determine is not in the spirit of the Buildboard community. We are not obligated to provide reasons for content removal.
            </p>

            <h3 className="text-sm font-medium text-foreground mb-2 mt-4">8.4 No Liability for User Content</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard does not endorse, verify, or take responsibility for any content posted by users. You use Buildboard and interact with user-generated content entirely at your own risk. We are not liable for any content that users post, and we are not liable for any harm resulting from your reliance on or interaction with user-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Rate Limits</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To ensure fair access and prevent abuse, the following rate limits apply:
            </p>
            <table className="text-sm text-muted-foreground w-full mt-3 border border-border/50">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-2 font-medium">Action</th>
                  <th className="text-left p-2 font-medium">Anonymous Users</th>
                  <th className="text-left p-2 font-medium">Registered Users</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-2">Posts per hour</td>
                  <td className="p-2">4</td>
                  <td className="p-2">12</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-2">Comments per hour</td>
                  <td className="p-2">20</td>
                  <td className="p-2">20</td>
                </tr>
                <tr>
                  <td className="p-2">AI Explain uses per hour</td>
                  <td className="p-2">10</td>
                  <td className="p-2">10</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Attempting to circumvent rate limits through multiple accounts, VPNs, or other methods is a violation of these Terms and may result in a ban.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. AI-Powered Features</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard offers an "Explain This" feature powered by Groq's Llama API. This feature generates plain-language explanations of posts.
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>AI-generated explanations are provided for informational and entertainment purposes only</li>
              <li>They do not constitute professional advice of any kind</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated explanations</li>
              <li>You should not rely on AI-generated explanations for any important decision</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Blocking and Reporting</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users may block other users at any time. Blocking a user means:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Their posts and comments will no longer be visible to you</li>
              <li>They will not be able to view your profile</li>
              <li>They will not appear in your search results</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Blocks are silent — the blocked user is not notified.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Abusing the report system by submitting false or malicious reports is a violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">12. Platform Availability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not guarantee that Buildboard will be available at all times. The platform may be unavailable due to maintenance, technical issues, or circumstances beyond our control. We are not liable for any loss or inconvenience caused by downtime or unavailability.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We do not guarantee that your content will be preserved indefinitely. While we take reasonable steps to maintain data integrity, you are responsible for keeping copies of any content that is important to you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">13. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Buildboard name, logo, design, and all platform code are owned by Buildboard and may not be copied, reproduced, or used without explicit written permission.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              User-generated content belongs to its respective creators as described in Section 7.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">14. Disclaimer of Warranties</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buildboard is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>The platform will be uninterrupted or error-free</li>
              <li>Any content on the platform is accurate or reliable</li>
              <li>The platform is free of viruses or harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">15. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, Buildboard and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of revenue, or damage to reputation, arising from your use of or inability to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">16. Indemnification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Buildboard and its operators from any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-6 mt-2">
              <li>Your use of Buildboard</li>
              <li>Content you post on Buildboard</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third party's rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">17. Governing Law and Dispute Resolution</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of Buildboard shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">18. Changes to These Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these Terms at any time. When we make significant changes, we will notify registered users by email and update the "Last updated" date at the top of this document. Your continued use of Buildboard after changes are posted constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">19. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions about these Terms, contact us at:
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
