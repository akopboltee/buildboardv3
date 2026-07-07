import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Tag = "Code" | "Design" | "Music" | "Art" | "Writing" | "Game" | "Other"

export const TAGS: Tag[] = ["Code", "Design", "Music", "Art", "Writing", "Game", "Other"]

export interface Post {
  id: string
  title: string
  description: string | null
  media_url: string | null
  tag: Tag
  author_name: string | null
  user_id: string | null
  created_at: string
  comment_count?: number
  show_anonymous?: boolean
  guest_id?: string
  flagged?: boolean
  project_id?: string | null
}

export interface Comment {
  id: string
  post_id: string
  content: string
  author_name: string | null
  user_id: string | null
  created_at: string
  show_anonymous?: boolean
  guest_id?: string
  flagged?: boolean
}

export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  profile_public: boolean
  show_real_name: boolean
  email_notifications: boolean
  weekly_digest: boolean
  pronouns?: string | null
  github_url?: string | null
  youtube_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  website_url?: string | null
  default_anonymous?: boolean
  created_at: string
  updated_at: string
}

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id?: string
  reporter_guest_id?: string
  reported_user_id?: string
  reported_post_id?: string
  reported_comment_id?: string
  content_type: 'post' | 'comment' | 'user'
  reason: 'spam' | 'harassment' | 'hate_speech' | 'inappropriate' | 'misinformation' | 'other'
  description?: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  website_url: string | null
  repo_url: string | null
  cover_image: string | null
  tag: string
  created_at: string
  updated_at: string
}
