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

export default function Component(props: Props) {
  const { name, businessType, volumeTier, painPoint } = props;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={p}>
            {name}, {businessType}, {volumeTier}, and the main issue is {painPoint}. Got it.
          </Text>
          <Text style={p}>
            The providers on your shortlist have approved and kept accounts in your category. They&apos;re on the list because they actually deliver, not because they paid to be there.
          </Text>
          <Text style={p}>
            Spent years managing payment operations at the $500M+ level. I know which acquirers are still easy to work with six months after you sign.
          </Text>
          <Text style={p}>Back with your shortlist tomorrow.</Text>
          <Text style={signature}>Barak</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = (props: Props) => `${props.name}, not pulling from a generic list`;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
