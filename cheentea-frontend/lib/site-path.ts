export const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function sitePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${SITE_BASE_PATH}${path}`;
}
