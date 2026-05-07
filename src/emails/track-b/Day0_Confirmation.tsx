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

export default function Component({ name, volumeTier }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>
          In-person payments at {volumeTier}, got it. Most comparison tools are built for online merchants and don't properly account for in-person MDR, hardware, or how reconciliation actually works at the location level.
        </Text>
        <Text style={p}>
          Putting together something that actually fits your setup. Back tomorrow.
        </Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

export const subject = (props: Props) => `On it, ${props.name}`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
