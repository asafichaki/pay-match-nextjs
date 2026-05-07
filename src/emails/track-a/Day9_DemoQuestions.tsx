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

export const subject = (_props: Props) => `Three things worth asking before any PSP demo`;

export default function Day9DemoQuestions({ name, calendlyUrl }: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>Before you get on a call with any of the providers on your list, a few things worth knowing.</Text>
        <Text style={p}>First: ask for IC++ pricing, not blended. At your volume it's almost always better, and the fact they don't lead with it tells you something.</Text>
        <Text style={p}>Second: check the settlement currency and the FX spread. This is where margin goes quietly, especially on cross-border volume.</Text>
        <Text style={p}>Third: ask what their 3DS2 fallback rate looks like. High fallback means you're paying card fees without getting the liability shift.</Text>
        <Text style={p}>If you want someone to sit on a call with you or review terms before you sign, that's something I do. <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link></Text>
        <Text style={signature}>Barak</Text>
      </Container>
    </Body></Html>
  );
}

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "560px" };
const p = { fontSize: "16px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 16px" };
const link = { color: "#2563eb", textDecoration: "underline" };
const signature = { fontSize: "16px", color: "#1e293b", marginTop: "24px" };
