import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
  providerX?: string;
}

export default function Component({ name, affiliateUrl, providerX = "Provider X" }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          Two things that cost operators the most and get negotiated the least: in-person MDR on high-frequency, low-ticket transactions, and tip adjustment processing, which some providers charge separately and bury.
        </Text>
        <Text style={p}>
          At 300 or more transactions a day on an average ticket under $40, even 0.1% on MDR adds up by end of month. Not a rounding error.
        </Text>
        <Text style={p}>
          {providerX} from your list has pricing that works for that transaction profile specifically: <Link href={affiliateUrl} style={link}>{affiliateUrl}</Link>
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (_props: Props) => `The payment setup most operators get wrong`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
