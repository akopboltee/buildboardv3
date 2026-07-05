import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, Eye, EyeOff, Loader as Loader2, CircleCheck as CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { validatePassword, getPasswordStrengthColor } from "@/lib/sanitize"
import { cn } from "@/lib/utils"

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")

  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have the reset token
    const accessToken = searchParams.get("access_token")
    const type = searchParams.get("type")

    if (!accessToken || type !== "recovery") {
      setError("Invalid or expired reset link. Please request a new one.")
    }
  }, [searchParams])

  useEffect(() => {
    if (password) {
      const result = validatePassword(password)
      setPasswordError(result.valid ? null : (result.error ?? null))
      setPasswordStrength(result.strength)
    } else {
      setPasswordError(null)
      setPasswordStrength("weak")
    }
  }, [password])

  useEffect(() => {
    if (confirmPassword && password) {
      setConfirmError(confirmPassword === password ? null : "Passwords do not match")
    } else {
      setConfirmError(null)
    }
  }, [confirmPassword, password])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const passwordResult = validatePassword(password)
    if (!passwordResult.valid) {
      setPasswordError(passwordResult.error ?? null)
      return
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
  }

  const isValid = password && !passwordError && password === confirmPassword

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
            BuildBoard
          </Link>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-12">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3" />
          Back to sign in
        </Link>

        {success ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in-0 duration-300">
            <CheckCircle className="size-12 text-green-500 mx-auto" />
            <h1 className="text-lg font-semibold text-foreground">Password updated</h1>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link to="/auth">
              <Button className="mt-4">Sign in</Button>
            </Link>
          </div>
        ) : error && !password ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Link to="/auth">
              <Button variant="outline">Request new reset link</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-muted-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "bg-transparent h-9 text-sm pr-9",
                      passwordError && "border-destructive"
                    )}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={passwordStrength === "weak" ? 33 : passwordStrength === "medium" ? 66 : 100}
                        className={cn("h-1.5 flex-1", getPasswordStrengthColor(passwordStrength))}
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
                  </div>
                )}

                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs text-muted-foreground">
                  Confirm new password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "bg-transparent h-9 text-sm pr-9",
                      confirmError && "border-destructive"
                    )}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-xs text-destructive">{confirmError}</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-9 text-sm"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
