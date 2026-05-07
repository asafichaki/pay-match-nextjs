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

export default function Component({ name, affiliateUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          A lot of providers price the terminal low and make it back over three years through higher MDR. Before you commit to anyone, ask two things: what's the contract length, and can you bring your own terminal.
        </Text>
        <Text style={p}>
          Two providers on your shortlist work with third-party hardware. One of them has a pay-as-you-go terminal option with no lock-in.
        </Text>
        <Text style={p}>
          Details: <Link href={affiliateUrl} style={link}>{affiliateUrl}</Link>
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (_props: Props) => `Hardware lock-in is the oldest trick in the book`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
