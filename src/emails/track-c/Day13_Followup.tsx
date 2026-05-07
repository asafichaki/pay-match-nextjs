import { Html, Head, Body, Container, Text } from "@react-email/components";

interface Props {
  name: string;
  businessType?: string;
  volumeTier?: string;
  painPoint?: string;
  shortlistUrl?: string;
  calendlyUrl?: string;
  affiliateUrl?: string;
}

export default function Component(_props: Props) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>
            Tell me who you&apos;re currently with and what&apos;s not working.
          </Text>
          <Text style={p}>
            I&apos;ll reply with a straight answer on whether there&apos;s a better fit and what a realistic switch looks like.
          </Text>
          <Text style={p}>No forms. One reply.</Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (_props: Props) => `One thing I can do right now`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
