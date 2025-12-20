export function cloudinaryUrlFromPublicId(publicId: string): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  if (!cloudName || !publicId) return "";
  const id = String(publicId)
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/?/, "")
    .replace(/^image\/upload\/?/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${id}`;
}
