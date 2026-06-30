/**
 * Minimal className utility — concatenates truthy strings.
 * Drop-in replacement for clsx / tailwind-merge for projects not using Tailwind.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
