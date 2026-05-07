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
}

export const subject = (_props: Props) => `Your shortlist, and why each one made it`;

export default function Day1Shortlist({
  name,
  volumeTier,
  painPoint,
  shortlistUrl,
  providerA = "Provider A",
  providerB = "Provider B",
  providerC = "Provider C",
}: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          <strong>{providerA}:</strong> Best fit for your volume. IC++ pricing is on the table here, which at {volumeTier} starts to matter a lot. Given your main issue is {painPoint}, this is where I'd start.
        </Text>
        <Text style={p}>
          <strong>{providerB}:</strong> Stronger if you're running volume across multiple markets. A bit more onboarding work upfront, but the acquiring coverage is worth it above $250K.
        </Text>
        <Text style={p}>
          <strong>{providerC}:</strong> Fastest to go live. Simpler pricing structure. Good option if speed is the priority right now over margin optimization.
        </Text>
        <Text style={p}>
          Full breakdown here: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link>
        </Text>
        <Text style={p}>If nothing fits, reply and tell me what's off. I'll adjust.</Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
