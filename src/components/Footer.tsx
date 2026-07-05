import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Platform</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">About</Link>
              <Link to="/guidelines" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Community Guidelines</Link>
              <Link to="/aup" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Acceptable Use</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Legal</h3>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Terms of Service</Link>
              <Link to="/privacy" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Privacy Policy</Link>
              <Link to="/cookies" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Cookie Policy</Link>
              <Link to="/copyright" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10" target="_blank">Copyright / DMCA</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Community</h3>
            <div className="space-y-2">
              <Link to="/search" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10">Search</Link>
              <Link to="/submit" className="block text-sm text-blue-600 hover:text-blue-700 transition-all px-2 py-1 rounded -mx-2 hover:bg-blue-600/10">Share a post</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Contact</h3>
            <p className="text-sm text-foreground">
              clarviodesigners@gmail.com
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground">BuildBoard — built for builders, by builders.</p>
          <p className="text-xs text-foreground text-center md:text-right">
            By using BuildBoard, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">Terms</Link>,{" "}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">Privacy</Link>,{" "}
            <Link to="/cookies" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">Cookies</Link>,{" "}
            <Link to="/guidelines" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">Guidelines</Link>,{" "}
            <Link to="/copyright" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">Copyright</Link>, and{" "}
            <Link to="/aup" className="text-blue-600 hover:text-blue-700 underline transition-colors" target="_blank">AUP</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
