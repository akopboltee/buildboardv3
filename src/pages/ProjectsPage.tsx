import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Globe, Trash2, CreditCard as Edit2, X, Link as LinkIcon, Loader as Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { TAGS, type Project } from "@/lib/supabase"
import { TAG_COLORS } from "@/lib/tag-colors"
import { getSignedUrl, uploadMedia } from "@/lib/media-upload"
import { cn } from "@/lib/utils"

export function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [tag, setTag] = useState<string>("Other")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user])

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false })
    if (data) setProjects(data as Project[])
    setLoading(false)
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setWebsiteUrl("")
    setRepoUrl("")
    setTag("Other")
    setCoverFile(null)
    setCoverPreview(null)
    setEditProject(null)
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(project: Project) {
    setEditProject(project)
    setTitle(project.title)
    setDescription(project.description || "")
    setWebsiteUrl(project.website_url || "")
    setRepoUrl(project.repo_url || "")
    setTag(project.tag)
    setCoverPreview(project.cover_image)
    setCreateOpen(true)
  }

  async function handleSave() {
    if (!title.trim() || !user) return
    setSaving(true)

    let coverImageUrl = editProject?.cover_image || null

    if (coverFile) {
      const uploadResult = await uploadMedia(coverFile, user.id, "posts")
      if (uploadResult.success && uploadResult.url) {
        coverImageUrl = uploadResult.url
      }
    }

    let error = null
    if (editProject) {
      const result = await supabase
        .from("projects")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          website_url: websiteUrl.trim() || null,
          repo_url: repoUrl.trim() || null,
          tag,
          cover_image: coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editProject.id)
      error = result.error
    } else {
      const result = await supabase.from("projects").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        website_url: websiteUrl.trim() || null,
        repo_url: repoUrl.trim() || null,
        tag,
        cover_image: coverImageUrl,
      })
      error = result.error
    }

    if (error) {
      console.error("Project save error:", error)
      setSaving(false)
      return
    }

    setSaving(false)
    setCreateOpen(false)
    resetForm()
    fetchProjects()
  }

  async function handleDelete() {
    if (!deleteProject) return
    await supabase.from("projects").delete().eq("id", deleteProject.id)
    setDeleteProject(null)
    fetchProjects()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB")
        return
      }
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your posts into projects
            </p>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              No projects yet. Create your first project to organize your posts.
            </p>
            <Button variant="outline" onClick={openCreate}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => openEdit(project)}
                onDelete={() => setDeleteProject(project)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome project"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Website URL</Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Repo URL</Label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tag</Label>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      tag === t
                        ? "border-foreground bg-foreground/10"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cover Image</Label>
              {coverPreview ? (
                <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                    className="absolute top-2 right-2 size-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <label className="block border border-dashed border-border rounded-md py-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim() || saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : editProject ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.title}"? Posts in this project will not be deleted, but will no longer be associated with a project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project
  onEdit: () => void
  onDelete: () => void
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (project.cover_image && !project.cover_image.startsWith("http")) {
      getSignedUrl(project.cover_image).then((url) => {
        if (url) setSignedUrl(url)
      })
    }
  }, [project.cover_image])

  const coverUrl = signedUrl || project.cover_image

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {coverUrl && (
        <div className="aspect-video bg-muted">
          <img src={coverUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-[10px] border-0 px-1.5 py-0 ${TAG_COLORS[project.tag as keyof typeof TAG_COLORS]}`}>
                {project.tag}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="size-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Edit2 className="size-3.5" />
            </button>
            <button onClick={onDelete} className="size-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        )}
        <div className="flex items-center gap-2">
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Globe className="size-3" />
              Website
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <LinkIcon className="size-3" />
              Repo
            </a>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <Link to={`/submit?project=${project.id}`}>
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
              <Plus className="size-3" />
              Add Post
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
