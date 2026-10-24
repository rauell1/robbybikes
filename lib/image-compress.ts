/**
 * Client-side image optimization for fast, responsive motorcycle photo uploads.
 * Automatically resizes high-resolution mobile photos to maximum 1920x1440
 * and compresses them to clean, lightweight JPEGs (~250-450 KB).
 * This ensures lightning-fast uploads to Neon Object Storage and smooth mobile loading.
 */

export async function optimizeImageForUpload(file: File): Promise<File> {
  // If not an image or already under 250 KB, keep original
  if (!file.type.startsWith("image/") || file.size < 250 * 1024) {
    return file;
  }

  // Ensure execution only runs in browser environments with Canvas support
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1440;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width <= 0 || height <= 0) {
        resolve(file);
        return;
      }

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }

          const cleanName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          const optimizedFile = new File([blob], cleanName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
