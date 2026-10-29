/* eslint-disable @next/next/no-img-element */
/**
 * A provider's official logo on a white tile, so it reads the same in light
 * and dark mode. Falls back to the first two letters when there is no file.
 * Used to identify the provider in an editorial comparison, nothing more.
 */
export function ProviderLogo({ name, logo, size = "md", top }: { name: string; logo?: string; size?: "sm" | "md" | "lg"; top?: boolean }) {
  const box = size === "lg" ? "h-14 w-28 sm:w-32 p-2.5" : size === "sm" ? "h-10 w-20 p-1.5" : "h-12 w-24 p-2";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border bg-white ${box} ${top ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}
    >
      {logo ? (
        <img src={logo} alt={`${name} logo`} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-sm font-bold text-primary">{name.slice(0, 2)}</span>
      )}
    </span>
  );
}
