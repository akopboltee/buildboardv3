import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Eye, EyeOff, Loader as Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  sanitizeText,
} from "@/lib/sanitize"

export function AuthPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signInLoading, setSignInLoading] = useState(false)
  const [showSignInPassword, setShowSignInPassword] = useState(false)

  // Sign up state
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [signUpError, setSignUpError] = useState<string | null>(null)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Validation states
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")

  // Moderation modal
  const [moderationModalOpen, setModerationModalOpen] = useState(false)

  // Forgot password
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  // Real-time validation for sign up
  useEffect(() => {
    if (signUpName) {
      const result = validateDisplayName(signUpName)
      setNameError(result.valid ? null : (result.error ?? null))
    } else {
      setNameError(null)
    }
  }, [signUpName])

  useEffect(() => {
    if (signUpEmail) {
      const result = validateEmail(signUpEmail)
      setEmailError(result.valid ? null : (result.error ?? null))
    } else {
      setEmailError(null)
    }
  }, [signUpEmail])

  useEffect(() => {
    if (signUpPassword) {
      const result = validatePassword(signUpPassword)
      setPasswordError(result.valid ? null : (result.error ?? null))
      setPasswordStrength(result.strength)
    } else {
      setPasswordError(null)
      setPasswordStrength("weak")
    }
  }, [signUpPassword])

  useEffect(() => {
    if (signUpConfirmPassword && signUpPassword) {
      setConfirmError(
        signUpConfirmPassword === signUpPassword
          ? null
          : "Passwords do not match"
      )
    } else {
      setConfirmError(null)
    }
  }, [signUpConfirmPassword, signUpPassword])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()

    setSignInLoading(true)
    setSignInError(null)

    // Check lockout
    const lockCheck = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-actions?action=check-lockout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: signInEmail.trim().toLowerCase() }),
      }
    )
    const lockData = await lockCheck.json()

    if (lockData.locked) {
      setSignInError(`Too many failed attempts. Please try again in ${lockData.timeRemaining || "15 minutes"}.`)
      setSignInLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail.trim().toLowerCase(),
      password: signInPassword,
    })

    if (error) {
      // Record failed attempt
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-actions?action=record-attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email: signInEmail.trim().toLowerCase() }),
        }
      )

      if (error.message.includes("Email not confirmed")) {
        setSignInError("Please verify your email before signing in.")
      } else if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not found")
      ) {
        setSignInError("Invalid email or password. Please try again.")
      } else {
        setSignInError(error.message)
      }
      setSignInLoading(false)
      return
    }

    navigate("/")
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    // Validate all fields
    const nameResult = validateDisplayName(signUpName)
    if (!nameResult.valid) {
      setNameError(nameResult.error ?? null)
      return
    }

    const emailResult = validateEmail(signUpEmail)
    if (!emailResult.valid) {
      setEmailError(emailResult.error ?? null)
      return
    }

    const passwordResult = validatePassword(signUpPassword)
    if (!passwordResult.valid) {
      setPasswordError(passwordResult.error ?? null)
      return
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setConfirmError("Passwords do not match")
      return
    }

    if (!termsAccepted) {
      setSignUpError("Please accept the Terms of Service and Privacy Policy to continue.")
      return
    }

    // Check username moderation
    const sanitizedName = sanitizeText(signUpName.trim())
    const nameAllowed = await checkUsernameModeration(sanitizedName)
    if (!nameAllowed) {
      setModerationModalOpen(true)
      return
    }

    setSignUpLoading(true)
    setSignUpError(null)

    const { error } = await supabase.auth.signUp({
      email: signUpEmail.trim().toLowerCase(),
      password: signUpPassword,
      options: {
        data: { full_name: sanitizedName },
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        setSignUpError("An account with this email already exists. Please sign in instead.")
      } else {
        setSignUpError(error.message)
      }
      setSignUpLoading(false)
      return
    }

    setSignUpSuccess(true)
    setSignUpLoading(false)
  }

  async function checkUsernameModeration(name: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ content: name }),
        }
      )
      const result = await res.json()
      return result.allowed !== false
    } catch {
      return true
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setForgotPasswordLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(
      forgotPasswordEmail.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    setForgotPasswordLoading(false)

    if (!error) {
      setForgotPasswordSent(true)
    }
  }

  // Check if sign up form is valid
  const signUpValid =
    validateDisplayName(signUpName).valid &&
    validateEmail(signUpEmail).valid &&
    validatePassword(signUpPassword).valid &&
    signUpPassword === signUpConfirmPassword &&
    termsAccepted

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
            BuildBoard
          </Link>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3" />
          Back to feed
        </Link>

        <Tabs defaultValue="signin">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="bg-transparent h-9 text-sm"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password" className="text-xs text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="bg-transparent h-9 text-sm pr-9"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {signInError && (
                <p className="text-xs text-destructive">{signInError}</p>
              )}
              <Button
                type="submit"
                className="w-full h-9 text-sm"
                disabled={signInLoading}
              >
                {signInLoading ? "Signing in..." : "Sign in"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(true)
                  setForgotPasswordSent(false)
                  setForgotPasswordEmail(signInEmail)
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Forgot password? Click here
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {signUpSuccess ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm font-medium text-foreground">Check your email</p>
                <p className="text-xs text-muted-foreground">
                  We sent a confirmation link to{" "}
                  <span className="text-foreground">{signUpEmail}</span>.
                  Click it to activate your account.
                </p>
                <Link to="/" className="block mt-4">
                  <Button variant="outline" size="sm" className="text-xs">
                    Back to feed
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-name" className="text-xs text-muted-foreground">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {signUpName.length}/20
                    </span>
                  </div>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Letters, numbers, underscores, spaces"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className={cn(
                      "bg-transparent h-9 text-sm",
                      nameError && "border-destructive"
                    )}
                    maxLength={20}
                    required
                    autoComplete="username"
                  />
                  {nameError && (
                    <p className="text-xs text-destructive">{nameError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs text-muted-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className={cn(
                      "bg-transparent h-9 text-sm",
                      emailError && "border-destructive"
                    )}
                    required
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs text-muted-foreground">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className={cn(
                        "bg-transparent h-9 text-sm pr-9",
                        passwordError && "border-destructive"
                      )}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {signUpPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={passwordStrength === "weak" ? 33 : passwordStrength === "medium" ? 66 : 100}
                          className="h-1.5 flex-1"
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          passwordStrength === "weak" && "text-red-500",
                          passwordStrength === "medium" && "text-yellow-500",
                          passwordStrength === "strong" && "text-green-500"
                        )}>
                          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Use 8+ characters for a strong password</span>
                      </div>
                    </div>
                  )}

                  {passwordError && (
                    <p className="text-xs text-destructive">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm" className="text-xs text-muted-foreground">
                    Confirm password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className={cn(
                        "bg-transparent h-9 text-sm pr-9",
                        confirmError && "border-destructive"
                      )}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmError && (
                    <p className="text-xs text-destructive">{confirmError}</p>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-border"
                  />
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Terms of Service</Link>,{" "}
                      <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Privacy Policy</Link>, and{" "}
                      <Link to="/cookies" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Cookie Policy</Link>.
                    </span>
                    <p className="text-[10px] text-muted-foreground/60">
                      You also agree to our{" "}
                      <Link to="/guidelines" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">Community Guidelines</Link>,{" "}
                      <Link to="/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">Copyright Policy</Link>, and{" "}
                      <Link to="/aup" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">Acceptable Use Policy</Link>.
                    </p>
                  </div>
                </label>

                {signUpError && (
                  <p className="text-xs text-destructive">{signUpError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-9 text-sm"
                  disabled={signUpLoading || !signUpValid}
                >
                  {signUpLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Moderation Modal */}
      <AlertDialog open={moderationModalOpen} onOpenChange={setModerationModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inappropriate Username</AlertDialogTitle>
            <AlertDialogDescription>
              This username contains inappropriate content. Please make a new appropriate username.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setModerationModalOpen(false)}>
              Okay, Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Forgot Password Modal */}
      <AlertDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              {forgotPasswordSent
                ? `Password reset email sent to ${forgotPasswordEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}. Check your inbox for the reset link.`
                : "Enter your email address and we'll send you a password reset link."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!forgotPasswordSent && (
            <form onSubmit={handleForgotPassword} className="mt-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="h-9 text-sm"
                required
              />
              <AlertDialogFooter className="mt-4">
                <AlertDialogAction asChild>
                  <Button
                    type="submit"
                    className="h-9 text-sm"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          )}
          {forgotPasswordSent && (
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setForgotPasswordOpen(false)}>
                Done
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
