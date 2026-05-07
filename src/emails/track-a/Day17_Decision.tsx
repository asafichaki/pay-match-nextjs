import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
}

export const subject = (_props: Props) => `Is staying where you are actually cheaper?`;

export default function Day17Decision({ name, affiliateUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>If your current provider is costing 0.3 to 0.4% more than market rate at your volume, the switch pays for itself inside 90 days.</Text>
        <Text style={p}>If it's an approval rate issue, the cost is harder to find on a statement but it's there.</Text>
        <Text style={p}>If you're close to a decision and want a quick sanity check on the commercial terms before you commit: <Link href={affiliateUrl} style={link}>{affiliateUrl}</Link> or just reply here.</Text>
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
