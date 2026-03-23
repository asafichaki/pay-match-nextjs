import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyPay Auto Test 2026-03-23T09-17-19-038Z",
  description: "Automated MyPay publish test page.",
  alternates: {
    canonical: "https://mypayadvisor.com/insights/mypay-auto-test-2026-03-23t09-17-19-038z",
  },
};

const html = `<h1>MyPay Auto Test 2026-03-23T09-17-19-038Z</h1><p>Automated MyPay publish test.</p>`;

export default function InsightPage() {
  return (
    <main className="section-padding">
      <div className="section-container max-w-4xl">
        <article className="prose prose-slate lg:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
