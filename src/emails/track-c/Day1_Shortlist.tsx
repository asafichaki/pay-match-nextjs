import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
  region?: string;
  providerA?: string;
  providerB?: string;
  providerC?: string;
  providerX?: string;
  providerXReason?: string;
}

export default function Component(props: Props) {
  const {
    name,
    painPoint,
    shortlistUrl,
    region = "your region",
    providerA = "Provider A",
    providerB = "Provider B",
    providerC = "Provider C",
    providerX = providerA,
    providerXReason = "best fit for your specific issue",
  } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>{name},</Text>
          <Text style={p}>
            <strong>{providerA}:</strong> Approval rate baseline around 85% CNP for your category. Rolling reserve capped at 10%, negotiable after 90 days of clean processing. Onboarding runs 2 to 3 weeks with a complete documentation pack.
          </Text>
          <Text style={p}>
            <strong>{providerB}:</strong> Slightly lower baseline but stronger issuer relationships in {region}. Underwriting decision usually comes back within a week.
          </Text>
          <Text style={p}>
            <strong>{providerC}:</strong> Best option if keeping the upfront reserve low is the priority. Trade-off is a longer go-live.
          </Text>
          <Text style={p}>
            Given your main issue is {painPoint}, start with {providerX}. Here&apos;s why in one line: {providerXReason}.
          </Text>
          {shortlistUrl ? (
            <Text style={p}>
              Full details: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link>
            </Text>
          ) : null}
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `Approval rates, reserve structures, onboarding timelines - your shortlist`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
