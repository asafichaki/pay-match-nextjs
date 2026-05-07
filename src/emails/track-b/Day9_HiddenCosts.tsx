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

export default function Component({ name, calendlyUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          Reconciliation sounds like an operational detail. It's actually a cashflow question. Batch settlement at a fixed cut-off versus rolling 24h settlement makes a real difference when you're running multiple locations.
        </Text>
        <Text style={p}>
          Also worth knowing: in-person chargebacks in restaurants and hospitality run higher than most sectors. Not all providers price that risk the same way.
        </Text>
        <Text style={p}>
          Happy to walk through what to ask before you sign anything: <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link>
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (_props: Props) => `Where the hidden costs actually live in an in-person payment contract`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
