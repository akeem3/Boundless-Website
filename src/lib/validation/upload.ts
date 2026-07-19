const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ValidationError {
  error: string;
}

export function validateUpload(file: File): ValidationError | null {
  if (!ALLOWED_MIMES.includes(file.type as (typeof ALLOWED_MIMES)[number])) {
    return {
      error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, PDF.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      error: `File too large (${sizeMB}MB). Maximum is 5MB.`,
    };
  }

  return null;
}
