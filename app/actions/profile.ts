'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 500 * 1024 // 500 KB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized.' }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' }
  }

  const file = formData.get('avatar') as File | null
  if (!file) {
    return { success: false, error: 'Tidak ada file yang diunggah.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Ukuran gambar maksimal 500 KB. Punyamu ${Math.round(file.size / 1024)} KB.`,
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.',
    }
  }

  // Generate filename: avatar.ext
  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${user.id}/avatar.${ext}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    return { success: false, error: `Gagal mengunggah foto: ${uploadError.message}` }
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(uploadData.path)

  const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}` // Add timestamp to bypass cache

  // Update profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: `Gagal memperbarui profil: ${updateError.message}` }
  }

  revalidatePath('/settings')
  return { success: true, avatarUrl: publicUrl }
}

export async function deleteAvatarAction() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized.' }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' }
  }

  // First get the current profile to know which file to delete, or just delete the folder contents
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    // List files in user's folder
    const { data: files } = await supabase.storage.from('avatars').list(user.id)
    
    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${user.id}/${file.name}`)
      await supabase.storage.from('avatars').remove(filePaths)
    }
  }

  // Update profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: `Gagal memperbarui profil: ${updateError.message}` }
  }

  revalidatePath('/settings')
  return { success: true }
}
