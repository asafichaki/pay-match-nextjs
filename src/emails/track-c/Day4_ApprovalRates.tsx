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

export default function Component(props: Props) {
  const { name, shortlistUrl, providerX = "One provider on your list" } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>{name},</Text>
          <Text style={p}>
            Low authorization rates in complex verticals are rarely a product issue. They&apos;re a routing issue. Wrong acquiring bank for your issuer mix, misconfigured 3DS, or a BIN with weak performance on your transaction type.
          </Text>
          <Text style={p}>
            Merchants in your category regularly move 10 to 15 approval rate points just by switching acquirers without changing anything else. The product stays the same. The routing changes.
          </Text>
          <Text style={p}>
            {providerX} is the strongest option on this specifically in your category.
          </Text>
          <Text style={p}>
            Worth 10 minutes:{" "}
            {shortlistUrl ? <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link> : "[link]"}
          </Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) =>
  `Your approval rate problem is almost never where you think it is`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
