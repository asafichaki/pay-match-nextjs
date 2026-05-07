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

export const subject = (_props: Props) => `There's a real difference between local acquiring and gateway routing`;

export default function Day4NewMarkets({ name, shortlistUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>Routing transactions through a single European acquirer into Brazil or Southeast Asia is not the same as having local acquiring in those markets. The approval rate gap can be 8 to 12 points, and it shows up as a decline on the customer's end with no clear reason.</Text>
        <Text style={p}>Two providers on your list have genuine local acquiring in the markets you mentioned, not just gateway connections. That's the question worth asking before you sign anything.</Text>
        <Text style={p}><Link href={shortlistUrl} style={link}>{shortlistUrl}</Link></Text>
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
