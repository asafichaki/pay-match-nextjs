import { JsonLd } from "@/components/JsonLd";

const VIDEO_ID = "i4e6P_S6OAs";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`;
const THUMBNAIL_URL = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

const VIDEO_NAME = "myPayAdvisor — Who we are";
const VIDEO_DESCRIPTION =
  "A short introduction to myPayAdvisor: who runs it, why we review payment processors from the operator side of the table, and how our independent shortlist process actually works for U.S. merchants in 2026.";
const UPLOAD_DATE = "2025-09-15";

const TALKING_POINTS = [
  "Who built myPayAdvisor and why we are not a generic lead-gen CRM.",
  "What an independent, operator-led processor review actually looks like.",
  "How merchants use our shortlist to stop overpaying on processing fees.",
];

const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: VIDEO_NAME,
  description: VIDEO_DESCRIPTION,
  thumbnailUrl: [THUMBNAIL_URL],
  uploadDate: UPLOAD_DATE,
  contentUrl: VIDEO_URL,
  embedUrl: EMBED_URL,
  publisher: {
    "@type": "Organization",
    name: "myPayAdvisor",
    logo: {
      "@type": "ImageObject",
      url: "https://www.mypayadvisor.com/og-logo.png",
    },
  },
};

export default function WhoWeAreVideo() {
  return (
    <section className="bg-muted/30" aria-labelledby="who-we-are-heading">
      <JsonLd data={videoSchema} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-10 sm:py-14 md:py-20">
        <div className="max-w-3xl mb-7 sm:mb-10 text-center md:text-left mx-auto md:mx-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-primary mb-2 sm:mb-3">
            Who we are
          </p>
          <h2
            id="who-we-are-heading"
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight"
          >
            A 90-second look at who&apos;s behind your processor shortlist.
          </h2>
        </div>

        <figure className="mx-auto">
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm aspect-video">
            <iframe
              src={EMBED_URL}
              title={VIDEO_NAME}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <figcaption className="mt-5 sm:mt-6 text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto md:mx-0">
            <span className="font-medium text-foreground">What&apos;s in this video:</span>
            <ul className="mt-2 space-y-1.5 list-disc pl-5">
              {TALKING_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
