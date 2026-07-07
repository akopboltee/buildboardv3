import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, User, LogOut, LayoutGrid, Settings, Paintbrush, Check, Shield, TriangleAlert as AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function Header() {
  const { user, displayName, signOut, profile } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [themeOpen, setThemeOpen] = useState(false)
  const [warningModalOpen, setWarningModalOpen] = useState(false)

  const isAdmin = profile?.role === "superadmin"
  const hasWarnings = profile && profile.warning_count > 0

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : "?"

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="border-b border-border sticky top-0 z-10 bg-background">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <TooltipProvider>
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground shrink-0">
            BuildBoard
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <Input
              type="search"
              placeholder="Search users, projects, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm bg-background border-border"
            />
          </form>

          <div className="flex items-center gap-1.5">
            {/* Theme Dropdown */}
            <DropdownMenu open={themeOpen} onOpenChange={setThemeOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Paintbrush className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Theme</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48 p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Appearance</div>
                <DropdownMenuItem
                  onClick={() => { setTheme("light"); setThemeOpen(false) }}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5",
                    theme === "light" && "bg-muted"
                  )}
                >
                  <span className="text-sm">Light</span>
                  {theme === "light" && <Check className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setTheme("dark"); setThemeOpen(false) }}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5",
                    theme === "dark" && "bg-muted"
                  )}
                >
                  <span className="text-sm">Dark</span>
                  {theme === "dark" && <Check className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setTheme("system"); setThemeOpen(false) }}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5",
                    theme === "system" && "bg-muted"
                  )}
                >
                  <span className="text-sm">System</span>
                  {theme === "system" && <Check className="size-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Warning Badge */}
            {hasWarnings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setWarningModalOpen(true)}
                    className="size-9 rounded-lg flex items-center justify-center text-orange-500 hover:bg-orange-500/10 transition-colors relative"
                  >
                    <AlertCircle className="size-4" />
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {profile?.warning_count}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">You have {profile?.warning_count} warning(s)</TooltipContent>
              </Tooltip>
            )}

            {/* Share Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/submit">
                  <Button size="sm" className="gap-1.5 h-9 px-3">
                    <Plus className="size-4" />
                    Share
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Make a post</TooltipContent>
            </Tooltip>

            {/* Profile */}
            {user ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button className="size-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors">
                        {initials}
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Profile</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <LayoutGrid className="size-3.5" />
                      My posts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="size-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-yellow-600">
                        <Shield className="size-3.5" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="flex items-center gap-2 text-muted-foreground cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="h-9 text-sm text-muted-foreground gap-1.5">
                  <User className="size-4" />
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Warning Modal */}
      <AlertDialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="size-5" />
              Account Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have received {profile?.warning_count} warning(s) for violating our community guidelines.
              {profile?.warning_count && profile.warning_count >= 2 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: After 3 warnings, your account will be automatically banned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay, I understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
