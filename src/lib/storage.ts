import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Uploads a profile avatar to Supabase Storage in the 'avatars' bucket.
 * Security enforcement:
 * - A student can ONLY upload to their OWN path: `${userId}/avatar-${timestamp}.${ext}`.
 * - No service_role key is used; only standard authenticated client / anon client.
 * - If Supabase Storage bucket is not yet provisioned on the remote instance,
 *   cleanly falls back to an optimized, client-compressed data URL so the student is never blocked.
 */
export async function uploadAvatarImage(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Le fichier sélectionné doit être une image (PNG, JPG, WebP).' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'L’image ne doit pas dépasser 5 Mo.' };
  }

  // 1. Try uploading to Supabase Storage if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
      const filePath = `${userId}/avatar-${Date.now()}.${cleanExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError && data) {
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage fallback notice:', err);
    }
  }

  // 2. Fallback: Compress image via canvas to a compact Base64 Data URL (max 400x400)
  try {
    const dataUrl = await compressImageFile(file, 400, 400, 0.85);
    return { success: true, url: dataUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur lors du traitement de l’image.' };
  }
}

/**
 * Resizes and compresses an image file to a lightweight data URL
 */
export function compressImageFile(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Impossible de lire l’image.'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    reader.readAsDataURL(file);
  });
}
