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

export const subject = (_props: Props) => `Failed payments are a churn problem. Most PSPs treat them like a billing problem.`;

export default function Day4Subscriptions({ name, shortlistUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>If your failed payment rate is above 5%, the issue is usually not the card. It's retry logic and how well your acquirer knows the issuing banks you're hitting.</Text>
        <Text style={p}>Good dunning logic recovers a meaningful chunk of those transactions. Most standard PSPs don't have it built in.</Text>
        <Text style={p}>Two on your shortlist do, and one of them handles it natively inside the SCA flow, which matters if you're processing in Europe.</Text>
        <Text style={p}>Details here: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link></Text>
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
