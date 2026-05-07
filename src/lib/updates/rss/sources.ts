// RSS sources for the Live Updates industry-news pipeline.
// Specialist B owns this file. Add/remove feeds as the editorial mix shifts.
// URLs marked with `?` in comments are best-effort and need a runtime probe
// before being relied on long-term.

export interface RssSource {
  name: string;
  url: string;
  weight: "primary" | "secondary";
}

export const RSS_SOURCES: RssSource[] = [
  {
    name: "Payments Dive",
    url: "https://www.paymentsdive.com/feeds/news/",
    weight: "primary",
  },
  {
    // ? Finextra has multiple RSS endpoints; this is the all-headlines feed.
    // We rely on the merchant/processor regex pre-filter to narrow it down.
    name: "Finextra",
    url: "https://www.finextra.com/rss/headlines.aspx",
    weight: "primary",
  },
  {
    // ? The Paypers root RSS — confirm at runtime; may need a category-specific URL.
    name: "The Paypers",
    url: "https://thepaypers.com/rss",
    weight: "primary",
  },
  {
    name: "Digital Transactions",
    url: "https://www.digitaltransactions.net/feed/",
    weight: "primary",
  },
  {
    // ? Reuters phased out most public RSS in 2020; this URL is a known mirror
    // and may 404. Kept as secondary so failures don't block the pipeline.
    name: "Reuters Business",
    url: "https://feeds.reuters.com/reuters/businessNews",
    weight: "secondary",
  },
];
