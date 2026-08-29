/**
 * Phone entry: one normaliser, shared by the client and the server action.
 *
 * Written 2026-08-29, when the funnel had captured 9 leads and 0 phone
 * numbers. The field existed, but it sat on an optional step after the lead
 * was already saved, under the label "only if you'd rather talk" and the line
 * "Nothing here is required". The design guaranteed the result.
 *
 * The bar here is deliberately low. This validates that a number could
 * plausibly be dialled, and nothing more. It is not a carrier lookup and does
 * not try to be: rejecting a real merchant because a strict regex disliked
 * their formatting costs a lead worth thousands, while a typo costs one
 * bounced call. When in doubt this accepts.
 */

/** Digits only, so "(415) 555-0134" and "415.555.0134" compare equal. */
export function digitsOf(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

/**
 * Plausibly dialable. US and Canada numbers are 10 digits, or 11 with the
 * country code. Everything else is treated as international and allowed a
 * wider range, because the site sells cross-border acquiring and a merchant
 * in Lisbon or Tel Aviv is exactly the audience.
 */
export function isValidPhone(raw: string): boolean {
  const d = digitsOf(raw);
  if (!d) return false;
  const international = (raw || "").trim().startsWith("+");
  if (international) return d.length >= 8 && d.length <= 15;
  if (d.length === 10) return !/^[01]/.test(d);        // NANP area code never starts 0 or 1
  if (d.length === 11) return d.startsWith("1");
  return d.length >= 8 && d.length <= 15;
}

/** E.164 where we can be sure, otherwise the trimmed original. */
export function normalizePhone(raw: string): string {
  const t = (raw || "").trim();
  const d = digitsOf(t);
  if (t.startsWith("+")) return `+${d}`;
  if (d.length === 10 && !/^[01]/.test(d)) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return t;
}

/** The one message every surface shows, so the wording cannot drift. */
export const PHONE_INVALID_MESSAGE =
  "That phone number does not look complete. Include the area code, or start with + for a number outside the US.";
