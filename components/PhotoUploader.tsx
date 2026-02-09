
import React, { useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { T } from "../constants/i18n";

export type PhotoData = {
  id: string;
  url: string;
};

export type PhotoUploaderProps = {
  photos: PhotoData[];
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (photoId: string) => void;
};

export default function PhotoUploader({
  photos,
  onUpload,
  onRemove,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      await onUpload(Array.from(files));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 cursor-pointer hover:bg-slate-50 transition">
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            {T.audit.uploading}
          </>
        ) : (
          <>
            <Camera size={18} />
            {T.audit.add_photo}
          </>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {photos?.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              <img
                src={p.url}
                className="h-20 w-full object-cover rounded-lg border cursor-pointer"
                onClick={() => window.open(p.url)}
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
