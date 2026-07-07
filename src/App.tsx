import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
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
import { ProjectsPage } from "@/pages/ProjectsPage"

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8,
  },
}

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.2,
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <HomePage />
            </motion.div>
          }
        />
        <Route
          path="/post/:id"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <PostDetailPage />
            </motion.div>
          }
        />
        <Route
          path="/submit"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <SubmitPage />
            </motion.div>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <ProfilePage />
            </motion.div>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <PublicProfilePage />
            </motion.div>
          }
        />
        <Route
          path="/@:username"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <PublicProfilePage />
            </motion.div>
          }
        />
        <Route
          path="/search"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <SearchPage />
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <AboutPage />
            </motion.div>
          }
        />
        <Route
          path="/settings"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <SettingsPage />
            </motion.div>
          }
        />
        <Route
          path="/admin"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <AdminDashboard />
            </motion.div>
          }
        />
        <Route
          path="/reset-password"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <ResetPasswordPage />
            </motion.div>
          }
        />
        <Route
          path="/terms"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <TermsPage />
            </motion.div>
          }
        />
        <Route
          path="/privacy"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <PrivacyPage />
            </motion.div>
          }
        />
        <Route
          path="/cookies"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <CookiesPage />
            </motion.div>
          }
        />
        <Route
          path="/guidelines"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <GuidelinesPage />
            </motion.div>
          }
        />
        <Route
          path="/copyright"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <CopyrightPage />
            </motion.div>
          }
        />
        <Route
          path="/aup"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <AupPage />
            </motion.div>
          }
        />
        <Route
          path="/projects"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              <ProjectsPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
