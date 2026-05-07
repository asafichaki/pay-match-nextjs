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
  const { name, affiliateUrl } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>{name},</Text>
          <Text style={p}>
            If your provider is holding reserves you didn&apos;t agree to, or your approval rate has stopped moving, the cost of staying is real. It just doesn&apos;t show up cleanly on a statement. It shows up in revenue you&apos;re not capturing.
          </Text>
          <Text style={p}>
            The providers on your shortlist know what they&apos;re underwriting going in. No surprises after approval.
          </Text>
          <Text style={p}>
            {affiliateUrl ? (
              <Link href={affiliateUrl} style={link}>{affiliateUrl}</Link>
            ) : (
              "[affiliate link]"
            )}{" "}
            or reply if you want to talk through it first.
          </Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `Is staying where you are actually the cheaper option?`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
