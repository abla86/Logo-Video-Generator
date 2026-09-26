/**
 * Security and Sanitization Engine for BrandForge Studio
 * Implements defensive security, XSS prevention, path traversal blocking,
 * prototype pollution protection, and safe media validation across all workflows.
 */

/**
 * Sanitizes file names to prevent path traversal and shell injection.
 * Removes directory traversal sequences (../, \), control chars, and limits length.
 */
export function sanitizeFilename(filename: string, fallback: string = "asset"): string {
  if (!filename || typeof filename !== "string") return fallback;

  // Remove directory separators and null bytes
  let clean = filename
    .replace(/\0/g, "")
    .replace(/[/\\]+/g, "_")
    .replace(/\.\.+/g, ".")
    .trim();

  // Remove any characters that aren't alphanumeric, dash, underscore, or period
  clean = clean.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

  // Avoid hidden files starting with a dot
  while (clean.startsWith(".")) {
    clean = clean.slice(1);
  }

  // Fallback if empty
  if (!clean || clean === "_") {
    clean = fallback;
  }

  // Limit length while preserving extension
  const parts = clean.split(".");
  if (parts.length > 1) {
    const ext = parts.pop()!;
    const name = parts.join("_").slice(0, 48);
    clean = `${name}.${ext.slice(0, 8)}`;
  } else {
    clean = clean.slice(0, 56);
  }

  return clean;
}

/**
 * Sanitizes SVG code to strictly prevent Cross-Site Scripting (XSS),
 * XXE entity injection, and malicious script execution.
 */
export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== "string") return "";

  let cleaned = rawSvg;

  // 1. Strip XML declarations that include DOCTYPE with entity declarations (XXE defense)
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*(\[[^\]]*\])?>/gi, "");
  cleaned = cleaned.replace(/<!ENTITY[^>]*>/gi, "");

  // 2. Strip <script> tags and contents
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 3. Strip dangerous embedding elements
  cleaned = cleaned.replace(/<(iframe|object|embed|foreignobject|link|meta|base)\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/(iframe|object|embed|foreignobject|link|meta|base)>/gi, "");

  // 4. Strip inline event handlers (onload, onclick, onerror, onmouseover, etc.)
  cleaned = cleaned.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\son[a-z]+\s*=\s*[^>\s]+/gi, "");

  // 5. Strip javascript: and vbscript: URIs in href and xlink:href
  cleaned = cleaned.replace(/(href|xlink:href)\s*=\s*(['"])\s*(javascript|vbscript|data:text\/html):.*?\2/gi, '$1=""');
  cleaned = cleaned.replace(/(href|xlink:href)\s*=\s*([^\s>]*javascript:[^\s>]*)/gi, '$1=""');

  // 6. Ensure svg tag exists
  if (!cleaned.includes("<svg")) {
    cleaned = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${cleaned}</svg>`;
  }

  return cleaned;
}

/**
 * Validates that a URL protocol is safe (strictly forbidding javascript:, data:text/html, etc.)
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Disallow javascript:, vbscript:, and file:
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("file:")) {
    return false;
  }

  // Allow standard web protocols and trusted data URIs
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/api/") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("data:video/") ||
    trimmed.startsWith("data:audio/")
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitizes JSON payloads and objects against Prototype Pollution.
 * Recursively strips __proto__, constructor, and prototype keys.
 */
export function sanitizeJsonPayload<T = any>(data: any, maxDepth: number = 8): T {
  if (data === null || typeof data !== "object" || maxDepth <= 0) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeJsonPayload(item, maxDepth - 1)) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    // Prototype pollution guard
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    cleanObj[key] = sanitizeJsonPayload(data[key], maxDepth - 1);
  }

  return cleanObj as T;
}

/**
 * Validates an uploaded media file before memory ingestion.
 */
export function validateMediaFile(file: File, maxSizeBytes: number = 100 * 1024 * 1024): {
  valid: boolean;
  error?: string;
  detectedType?: "image" | "video" | "audio" | "document";
} {
  if (!file) {
    return { valid: false, error: "Ingen fil ble valgt." };
  }

  if (file.size > maxSizeBytes) {
    const mb = Math.round(maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `Filen overskrider maksimal tillatt størrelse på ${mb} MB.` };
  }

  const mime = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();

  let detectedType: "image" | "video" | "audio" | "document" = "document";

  if (mime.startsWith("image/") || /\.(svg|png|jpe?g|webp|gif|bmp|ico)$/i.test(name)) {
    detectedType = "image";
  } else if (mime.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(name)) {
    detectedType = "video";
  } else if (mime.startsWith("audio/") || /\.(wav|mp3|aac|m4a|ogg|flac)$/i.test(name)) {
    detectedType = "audio";
  } else if (/\.(json|srt|vtt|txt|css|md|pdf)$/i.test(name)) {
    detectedType = "document";
  } else {
    return { valid: false, error: `Filformatet «${name}» støttes ikke. Vennligst bruk standard formater.` };
  }

  return { valid: true, detectedType };
}

/**
 * Downloads a string or blob securely in the browser with safe object URL lifecycle.
 */
export function safeDownload(
  content: string | Blob,
  filename: string,
  mimeType: string = "application/octet-stream"
): void {
  const safeName = sanitizeFilename(filename, "download");
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = safeName;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}
