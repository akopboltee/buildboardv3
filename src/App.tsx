import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/hooks/use-auth"
import { HomePage } from "@/pages/HomePage"
import { PostDetailPage } from "@/pages/PostDetailPage"
import { SubmitPage } from "@/pages/SubmitPage"
import { AuthPage } from "@/pages/AuthPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { PublicProfilePage } from "@/pages/PublicProfilePage"
import { SearchPage } from "@/pages/SearchPage"
import { AboutPage } from "@/pages/AboutPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"
import { AdminDashboard } from "@/pages/AdminDashboard"
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { CookiesPage } from "@/pages/CookiesPage"
import { GuidelinesPage } from "@/pages/GuidelinesPage"
import { CopyrightPage } from "@/pages/CopyrightPage"
import { AupPage } from "@/pages/AupPage"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route path="/@:username" element={<PublicProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/copyright" element={<CopyrightPage />} />
          <Route path="/aup" element={<AupPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
