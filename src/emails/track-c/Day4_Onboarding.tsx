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
            Applications that get declined or delayed are rarely turned down on business model. They fail on documentation gaps: missing processing history, chargeback ratios above 1%, or a website that doesn&apos;t hold up on a basic compliance review.
          </Text>
          <Text style={p}>All of these are fixable before you submit.</Text>
          <Text style={p}>
            If you&apos;re about to apply to one of the providers on your list and want a second set of eyes on your pack before you send it, I&apos;ll tell you if anything looks like a problem.
          </Text>
          <Text style={p}>
            Takes 20 minutes:{" "}
            {calendlyUrl ? <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link> : "[Calendly]"}
          </Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `Most rejections aren't about what you do. They're about how you document it.`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
