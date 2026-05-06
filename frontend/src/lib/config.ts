/**
 * Centralized API configuration for LuxeStay.
 * All fetch calls must use API_URL from this file.
 *
 * Local dev  → set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
 * Production → set NEXT_PUBLIC_API_URL=http://16.112.68.152   in .env.production
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

/**
 * Resolve a media path returned by Django into a full URL.
 * Django stores paths like "/media/properties/foo.jpg".
 * In production the EC2 host serves them directly.
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
