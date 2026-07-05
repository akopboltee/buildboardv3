import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-12 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Platform</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/guidelines" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Community Guidelines</Link>
              <Link to="/aup" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Acceptable Use</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Legal</h3>
            <div className="space-y-2">
              <Link to="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
              <Link to="/copyright" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Copyright / DMCA</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Community</h3>
            <div className="space-y-2">
              <Link to="/search" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Search</Link>
              <Link to="/submit" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Share a post</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Contact</h3>
            <p className="text-xs text-muted-foreground">
              clarviodesigners@gmail.com
            </p>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">BuildBoard — built for builders, by builders.</p>
          <p className="text-[10px] text-muted-foreground/50 text-center md:text-right">
            By using BuildBoard, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-muted-foreground">Terms</Link>,{" "}
            <Link to="/privacy" className="underline hover:text-muted-foreground">Privacy</Link>,{" "}
            <Link to="/cookies" className="underline hover:text-muted-foreground">Cookies</Link>,{" "}
            <Link to="/guidelines" className="underline hover:text-muted-foreground">Guidelines</Link>,{" "}
            <Link to="/copyright" className="underline hover:text-muted-foreground">Copyright</Link>, and{" "}
            <Link to="/aup" className="underline hover:text-muted-foreground">AUP</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
