import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
  providerA?: string;
  providerB?: string;
  providerC?: string;
  providerX?: string;
  providerXReason?: string;
}

export default function Component({
  name,
  painPoint,
  shortlistUrl,
  providerA = "Provider A",
  providerB = "Provider B",
  providerC = "Provider C",
  providerX = "Provider X",
  providerXReason = "",
}: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          {providerA}: Competitive in-person MDR at your volume. Works with most existing hardware so you're not forced into a swap. Settles next business day.
        </Text>
        <Text style={p}>
          {providerB}: Built for multi-location. Slightly higher per transaction, but the centralized reporting and consolidated reconciliation makes a real difference once you're across more than two sites.
        </Text>
        <Text style={p}>
          {providerC}: Best option if you're in hospitality. Pre-auth, tip adjustment, and split checks work natively without workarounds.
        </Text>
        <Text style={p}>
          Given {painPoint} is the main issue, I'd start with {providerX} and here's the short reason: {providerXReason}
        </Text>
        <Text style={p}>
          Full details: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link>
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (_props: Props) => `Your shortlist, rates, hardware, and what actually matters`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
