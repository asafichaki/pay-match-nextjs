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

export const subject = (_props: Props) => `Your approval rate issue is probably not what you think it is`;

export default function Day4ApprovalRates({
  name,
  shortlistUrl,
  calendlyUrl,
  providerX = "The top provider",
}: Props) {
  return (
    <Html><Head /><Body style={main}>
      <Container style={container}>
        <Text style={p}>{name},</Text>
        <Text style={p}>Low auth rates on a clean account are almost always a routing problem, not a product problem. Wrong acquirer, weak BIN performance in your issuing markets, or a 3DS setup that's blocking good transactions.</Text>
        <Text style={p}>Changing acquirers without touching anything else on the product side can move approval rates by 10 to 15 points. It depends on who your customers' banks are and whether your acquirer has solid relationships there.</Text>
        <Text style={p}>{providerX} from your shortlist is the strongest option on this specifically. Worth a look: <Link href={shortlistUrl} style={link}>{shortlistUrl}</Link></Text>
        <Text style={p}>If you want to go through your current setup before you talk to anyone, I'm available: <Link href={calendlyUrl} style={link}>{calendlyUrl}</Link></Text>
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
