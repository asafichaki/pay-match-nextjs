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

export const BARAK_PERSON_SCHEMA = {
  "@type": "Person",
  "@id": BARAK_PERSON_ID,
  "name": BARAK_NAME,
  "jobTitle": BARAK_TITLE,
  "description": BARAK_BIO_SHORT,
  "url": BARAK_PROFILE_URL,
  "image": BARAK_IMAGE,
  "sameAs": [BARAK_LINKEDIN],
  "knowsAbout": BARAK_AREAS,
  "worksFor": {
    "@type": "Organization",
    "@id": "https://www.mypayadvisor.com/#organization",
    "name": "myPayAdvisor",
    "url": "https://www.mypayadvisor.com",
  },
} as const;
