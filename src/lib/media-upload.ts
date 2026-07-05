import { supabase } from '@/lib/supabase'

// File signature magic bytes for validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/jpg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]],
  'video/webm': [[0x1a, 0x45, 0xdf, 0xa3]],
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB

// Media bucket name in Supabase
const MEDIA_BUCKET = 'media'
const AVATAR_BUCKET = 'avatars'

export interface MediaValidationResult {
  valid: boolean
  error?: string
  type?: string
  isVideo?: boolean
}

export interface UploadResult {
  success: boolean
  url?: string
  signedUrl?: string
  error?: string
}

/**
 * Validate file by reading magic bytes signature
 */
export async function validateFileSignature(file: File): Promise<MediaValidationResult> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
      for (const sig of signatures) {
        let match = true
        for (let i = 0; i < sig.length; i++) {
          if (bytes[i] !== sig[i]) {
            match = false
            break
          }
        }
        if (match) {
          return {
            valid: true,
            type: mimeType,
            isVideo: ALLOWED_VIDEO_TYPES.includes(mimeType),
          }
        }
      }
    }

    return {
      valid: false,
      error: 'File type not allowed. Please upload images (jpg, png, webp, gif) or videos (mp4, webm) only.',
    }
  } catch {
    return {
      valid: false,
      error: 'Failed to validate file. Please try again.',
    }
  }
}

/**
 * Validate media file for posts
 */
export async function validateMediaFile(file: File): Promise<MediaValidationResult> {
  const isVideo = file.type.startsWith('video/')
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB for ${isVideo ? 'videos' : 'images'}.`,
    }
  }

  const signatureResult = await validateFileSignature(file)
  if (!signatureResult.valid) {
    return signatureResult
  }

  if (signatureResult.type && !ALLOWED_TYPES.includes(signatureResult.type)) {
    return {
      valid: false,
      error: 'Invalid file type detected.',
    }
  }

  return {
    valid: true,
    type: signatureResult.type,
    isVideo: signatureResult.isVideo,
  }
}

/**
 * Validate avatar file
 */
export async function validateAvatarFile(file: File): Promise<MediaValidationResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Avatar must be an image (jpg, png, webp, or gif).',
    }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: 'Avatar image must be 5MB or less.',
    }
  }

  const signatureResult = await validateFileSignature(file)
  if (!signatureResult.valid) {
    return {
      valid: false,
      error: 'Invalid image file detected.',
    }
  }

  return { valid: true, type: signatureResult.type }
}

/**
 * Upload media to bucket and return path
 */
export async function uploadMedia(
  file: File,
  userId: string,
  folder: 'posts' | 'avatars' = 'posts'
): Promise<UploadResult> {
  try {
    const validation = folder === 'avatars'
      ? await validateAvatarFile(file)
      : await validateMediaFile(file)

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const ext = file.name.split('.').pop() || 'bin'
    const bucket = folder === 'avatars' ? AVATAR_BUCKET : MEDIA_BUCKET
    const fileName = `${folder}/${userId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: validation.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload file. Please try again.' }
    }

    // Generate signed URL valid for 1 hour
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600)

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      return { success: false, error: 'Failed to generate file URL.' }
    }

    return {
      success: true,
      url: fileName,
      signedUrl: signedUrlData.signedUrl,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Upload failed. Please try again.' }
  }
}

/**
 * Get signed URL for viewing media
 */
export async function getSignedUrl(path: string, folder: 'posts' | 'avatars' = 'posts'): Promise<string | null> {
  const bucket = folder === 'avatars' ? AVATAR_BUCKET : MEDIA_BUCKET
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600)

  return data?.signedUrl || null
}

/**
 * Delete media file
 */
export async function deleteMedia(path: string, folder: 'posts' | 'avatars' = 'posts'): Promise<boolean> {
  const bucket = folder === 'avatars' ? AVATAR_BUCKET : MEDIA_BUCKET
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return !error
}
