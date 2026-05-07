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

export const subject = (props: Props) => `On it, ${props.name}`;

export default function Day0Confirmation({ name, businessType, volumeTier, painPoint }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>Got your details.</Text>
        <Text style={p}>
          You're running {businessType} at {volumeTier} and the main thing you flagged was {painPoint}.
        </Text>
        <Text style={p}>Working on your shortlist now. Not pulling from a generic list, filtering specifically against what you told me.</Text>
        <Text style={p}>Back with it tomorrow.</Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
