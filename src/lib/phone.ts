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
  // Eleven digits is either NANP with its 1, or an international number typed
  // without its plus (a Dutch mobile is 31612345678). Only a leading zero is
  // refused, because that is a national trunk prefix we cannot turn into a
  // dialable number and the message below tells the merchant exactly that.
  if (d.length === 11) return !d.startsWith("0");
  return d.length >= 8 && d.length <= 15;
}

/**
 * E.164 where we can be sure, otherwise the trimmed original.
 *
 * The stored string is what the alert turns into a `tel:` link, so "sure
 * enough to store" means "sure enough for Barak to tap and reach the
 * merchant". A number that keeps its country code but loses the plus dials as
 * nonsense from an Israeli handset, which is how the first real lead with a
 * phone (972545771413, 2026-08-30) arrived.
 */
export function normalizePhone(raw: string): string {
  const t = (raw || "").trim();
  let d = digitsOf(t);
  if (t.startsWith("+")) return `+${d}`;

  // An international dial-out prefix typed instead of a plus: 011 from the US
  // and Canada, 00 almost everywhere else. Neither can be the start of a real
  // number here, because no country code begins with a zero and no NANP
  // number is this long.
  if (d.length >= 13 && d.startsWith("011")) d = d.slice(3);
  else if (d.length >= 10 && d.startsWith("00")) d = d.slice(2);

  if (d.length === 10 && !/^[01]/.test(d)) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  // Longer than any NANP number, so it already carries its own country code
  // and the only thing missing is the plus. A leading zero is excluded: no
  // country code starts with one, so that is a national trunk prefix and
  // prefixing it would produce a plausible looking number that dials nowhere.
  if (d.length >= 11 && d.length <= 15 && !d.startsWith("0")) return `+${d}`;
  // Anything else, a short local number or a 10-digit national format with a
  // trunk zero, keeps the shape the merchant typed. Guessing a country code
  // for it would be inventing data, and the form already tells them to lead
  // with a + if they are outside the US.
  return t;
}

/** The one message every surface shows, so the wording cannot drift. */
export const PHONE_INVALID_MESSAGE =
  "That phone number does not look complete. Include the area code, or start with + for a number outside the US.";
