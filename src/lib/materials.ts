import type { MaterialFormat } from "../../generated/prisma";

export type { MaterialFormat };

export const MATERIAL_FORMAT_VALUES = [
  "PDF",
  "IMAGE",
  "VIDEO",
  "OTHER",
] as const satisfies readonly MaterialFormat[];

export const FORMAT_LABELS: Record<MaterialFormat, string> = {
  PDF: "PDF",
  IMAGE: "Imagen",
  VIDEO: "Video de YouTube",
  OTHER: "Otro archivo",
};

// Vercel serverless functions reject request bodies above ~4.5 MB
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

const PDF = "application/pdf";
const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function acceptedFileTypes(format: MaterialFormat): string[] {
  switch (format) {
    case "PDF":
      return [PDF];
    case "IMAGE":
      return IMAGES;
    case "OTHER":
      return [PDF, ...IMAGES];
    case "VIDEO":
      return [];
  }
}

/** Accepts a full YouTube URL (watch, youtu.be, embed, shorts, live) or a bare 11-char id. */
export function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  const match =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(
      value,
    );
  return match?.[1] ?? null;
}

export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}
