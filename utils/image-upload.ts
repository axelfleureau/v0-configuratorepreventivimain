import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function uploadPackageImage(file: File, packageId: string): Promise<string> {
  const supabase = createClientComponentClient()

  // Genera un nome file unico
  const fileExt = file.name.split(".").pop()
  const fileName = `${packageId}-${Date.now()}.${fileExt}`

  try {
    // Upload del file
    const { data, error } = await supabase.storage.from("package-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Ottieni l'URL pubblico
    const {
      data: { publicUrl },
    } = supabase.storage.from("package-images").getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deletePackageImage(imageUrl: string): Promise<void> {
  const supabase = createClientComponentClient()

  try {
    // Estrai il nome del file dall'URL
    const fileName = imageUrl.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage.from("package-images").remove([fileName])

    if (error) throw error
  } catch (error) {
    console.error("Error deleting image:", error)
  }
}
