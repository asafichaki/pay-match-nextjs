export const BARAK_LINKEDIN = "https://www.linkedin.com/in/barak-bachar/";

export const BARAK_NAME = "Barak Bachar";
export const BARAK_TITLE = "Global Payments Manager";
export const BARAK_PROFILE_URL = "https://www.mypayadvisor.com/about/barak";
export const BARAK_PERSON_ID = "https://www.mypayadvisor.com/about/barak#person";
export const BARAK_IMAGE = "https://www.mypayadvisor.com/images/barak-monogram.svg";

export const BARAK_BIO_SHORT =
  "Barak Bachar is a Global Payments Manager with hands-on experience operating payment infrastructure at the $500M+ annual volume level. He works with merchants on pricing structure, acquirer routing, reserve negotiation, and onboarding for complex verticals.";

export const BARAK_AREAS = [
  "Payment processing",
  "Interchange-plus pricing",
  "Merchant statement audit",
  "Acquirer routing",
  "Reserve negotiation",
  "Approval rate optimization",
  "High-risk merchant accounts",
  "Multi-acquirer routing",
  "PCI compliance",
  "Card-not-present payments",
  "Card-present payments",
  "Effective rate computation",
];

/**
 * Entity disambiguation.
 *
 * Two collisions, both confirmed live on 2026-08-26. "Barak Bachar" resolves
 * first to the Israeli association-football manager, and the LinkedIn profile
 * our `sameAs` points at is titled "Barak Bachar, 888holdings", not
 * myPayAdvisor. Until the profile headline is updated, a consumer of this
 * graph has two reasons to bind the node to the wrong person.
 *
 * `disambiguatingDescription` is schema.org's property for exactly this: a
 * short statement used only to tell same-name entities apart. Kept factual and
 * kept short, because it is read by machines, not by readers.
 */
export const BARAK_DISAMBIGUATION =
  "Payments professional specialising in merchant acquiring and high-risk underwriting. Not the association-football manager of the same name.";

/** The occupation node, so the Person carries an occupation, not just a title. */
export const BARAK_OCCUPATION = {
  "@type": "Occupation",
  "name": "Payments Manager",
  // BLS SOC 13-2099, Financial Specialists, All Other. The closest published
  // code for a payments operations role; there is no dedicated SOC entry.
  "occupationalCategory": "13-2099",
  "skills": BARAK_AREAS,
} as const;

export const BARAK_ORGANIZATION_ID = "https://www.mypayadvisor.com/#organization";

export const BARAK_PERSON_SCHEMA = {
  "@type": "Person",
  "@id": BARAK_PERSON_ID,
  "name": BARAK_NAME,
  "jobTitle": BARAK_TITLE,
  "description": BARAK_BIO_SHORT,
  "disambiguatingDescription": BARAK_DISAMBIGUATION,
  "url": BARAK_PROFILE_URL,
  "image": BARAK_IMAGE,
  "sameAs": [BARAK_LINKEDIN],
  "knowsAbout": BARAK_AREAS,
  "hasOccupation": BARAK_OCCUPATION,
  "worksFor": {
    "@type": "Organization",
    "@id": BARAK_ORGANIZATION_ID,
    "name": "myPayAdvisor",
    "url": "https://www.mypayadvisor.com",
  },
} as const;
