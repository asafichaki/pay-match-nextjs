import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
  providerB?: string;
}

export default function Component(props: Props) {
  const { name, calendlyUrl, shortlistUrl, providerB = "Provider B" } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>{name},</Text>
          <Text style={p}>
            Most underwriting teams are looking for one thing above everything else: evidence that you&apos;ve processed before and your chargeback ratio is clean.
          </Text>
          <Text style={p}>
            Three to six months of statements with a ratio under 1% changes the tone of the whole conversation.
          </Text>
          <Text style={p}>
            If you&apos;re working with limited processing history, there are ways to structure the application that help. Happy to walk through it:{" "}
            {calendlyUrl ? <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link> : "[Calendly]"}
          </Text>
          <Text style={p}>
            {providerB} from your list also has more flexible requirements for earlier-stage accounts if that&apos;s where you are:{" "}
            {shortlistUrl ? <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link> : "[link]"}
          </Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `One thing that changes every underwriting conversation`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
