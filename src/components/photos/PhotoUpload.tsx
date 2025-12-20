import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";
import { supabase } from "../../lib/supabase"; // Import supabase if used for saving to DB

interface PhotoUploadProps {
  packageId: string;
  onPhotosUploaded: (photos: Array<{ path: string; url: string }>) => void;
  maxPhotos?: number;
}

export function PhotoUpload({
  packageId,
  onPhotosUploaded,
  maxPhotos = 5,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedPhotos: Array<{ path: string; url: string }> = [];
    const newPreviewUrls: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, maxPhotos); i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );
        formData.append("folder", `packages/${packageId}`);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          formData
        );

        if (response.data) {
          const publicUrl = response.data.secure_url;

          uploadedPhotos.push({
            path: response.data.public_id,
            url: publicUrl,
          });

          newPreviewUrls.push(publicUrl);

          // Save to database metadata in Supabase
          await supabase.from("package_photos").insert([
            {
              package_id: packageId,
              storage_path: response.data.public_id,
              is_primary: i === 0,
            },
          ]);
        }
      }

      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
      onPhotosUploaded(uploadedPhotos);
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour télécharger</span> ou
              glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">
            Téléchargement en cours...
          </p>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
