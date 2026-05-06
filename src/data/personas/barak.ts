export const BARAK_LINKEDIN = "https://www.linkedin.com/in/barak-bachar/";

export const BARAK_NAME = "Barak Bachar";
export const BARAK_TITLE = "Global Payments Manager";

export const BARAK_BIO_SHORT =
  "Barak Bachar is a Global Payments Manager with hands-on experience operating payment infrastructure at the $500M+ annual volume level. He works with merchants on pricing structure, acquirer routing, reserve negotiation, and onboarding for complex verticals.";

export const BARAK_AREAS = [
  "Reserve negotiation",
  "Approval rate optimization",
  "Multi-acquirer routing",
  "Complex vertical onboarding",
];

export const BARAK_PERSON_SCHEMA = {
  "@type": "Person",
  "name": BARAK_NAME,
  "jobTitle": BARAK_TITLE,
  "description": BARAK_BIO_SHORT,
  "url": "https://www.mypayadvisor.com/about/barak",
  "sameAs": [BARAK_LINKEDIN],
  "knowsAbout": BARAK_AREAS,
} as const;
