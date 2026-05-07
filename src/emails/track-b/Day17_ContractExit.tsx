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

export default function Component({ name, shortlistUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          Hardware amortization clauses make switching expensive mid-term. Before you commit: check the termination fee, the minimum monthly volume clause, and whether MDR is fixed or tiered.
        </Text>
        <Text style={p}>
          The providers on your shortlist have been checked on all of these.
        </Text>
        <Text style={p}>
          If you're close to a decision: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link> or just reply.
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (_props: Props) => `In-person payment contracts are harder to exit than online agreements`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
