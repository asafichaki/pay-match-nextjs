import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentinel Auto Test 2026-03-22T20-20-37-123Z",
  description: "Automated publish test page.",
  alternates: {
    canonical: "https://mypayadvisor.com/insights/sentinel-auto-test-2026-03-22t20-20-37-123z",
  },
};

const html = `<h1>Sentinel Auto Test 2026-03-22T20-20-37-123Z</h1>
<p>This is an automated publish test for MyPayAdvisor.</p>
<h2>Why it matters</h2>
<ul>
<li>Confirms Sentinel GitHub auto-publish flow</li>
<li>Confirms links-only email behavior</li>
</ul>
<h2>Next steps</h2>
<p>Use this page to verify deployment and indexing.</p>
`;

export default function InsightPage() {
  return (
    <main className="section-padding">
      <div className="section-container max-w-4xl">
        <article className="prose prose-slate lg:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
