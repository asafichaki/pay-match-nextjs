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

export default function Component(props: Props) {
  const { name, calendlyUrl } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>{name},</Text>
          <Text style={p}>
            A 10% rolling reserve held for 180 days on $500K monthly volume ties up $300K in working capital. That&apos;s not a risk management decision on their part. That&apos;s a margin decision.
          </Text>
          <Text style={p}>
            Standard for a merchant with clean processing history is a capped reserve with a documented path to release. If you&apos;re being offered rolling with no renegotiation trigger, ask them why.
          </Text>
          <Text style={p}>
            Two providers on your list offer capped structures from day one.
          </Text>
          <Text style={p}>
            If you want someone to look at what you&apos;re currently being offered and tell you if it&apos;s normal, reply or book 20 minutes:{" "}
            {calendlyUrl ? <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link> : "[Calendly]"}
          </Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `Rolling reserve vs. capped reserve - this is a cashflow question, not a risk question`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
