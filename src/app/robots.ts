import type { MetadataRoute } from 'next';

/**
 * Every named agent below gets its OWN group in robots.txt, and a crawler that
 * matches a named group ignores the `*` group completely. So a disallow listed
 * only under `*` would not apply to Googlebot, GPTBot or any of the others.
 * That is why DISALLOW is shared rather than written once: adding a path in one
 * place has to mean every crawler.
 *
 * `/go/` is the outbound affiliate gate. Links into it already carry
 * rel="sponsored nofollow", and disallowing it means no crawler follows a
 * commercial link out of this site or wastes crawl budget on a redirect.
 *
 * The AI agents stay fully allowed on content. Answer-engine fetches are the
 * channel this site actually earns from, so blocking them would be blocking
 * the traffic.
 */
const DISALLOW = ['/admin/', '/api/', '/go/'];

const AI_AND_SOCIAL_AGENTS = [
  'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot',
  'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'Claude-Web', 'ClaudeUserAgent', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'CCBot', 'Amazonbot', 'Applebot-Extended',
  'cohere-ai', 'Diffbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_AND_SOCIAL_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://www.mypayadvisor.com/sitemap.xml',
  };
}
