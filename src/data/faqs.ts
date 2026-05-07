export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "What are payment processing fees and how are they calculated?",
    answer: "Payment processing fees are charges applied by payment processors for handling credit and debit card transactions. These typically include interchange fees (1.5% to 2.5%), assessment fees, and processor markup. Total fees usually range from 2% to 3.5% per transaction, plus potential monthly fees, setup costs, and PCI compliance charges depending on your provider and business type.",
  },
  {
    id: 2,
    question: "How quickly will I receive my money from credit card transactions?",
    answer: "Funding speeds vary by payment processor. The fastest processors offer same-day or next-day funding (within 24 hours), while standard processing typically takes 2-3 business days. Your funding speed can also depend on your business type, processing volume, account history, and whether you have a high-risk merchant account.",
  },
  {
    id: 3,
    question: "What is PCI compliance and why is it important for my business?",
    answer: "PCI DSS (Payment Card Industry Data Security Standard) compliance is a set of security requirements designed to protect cardholder information during and after transactions. Compliance is mandatory for any business that accepts card payments and helps prevent data breaches, fraud, and potential fines up to $500,000. Most modern payment processors handle PCI compliance for you.",
  },
  {
    id: 4,
    question: "Can I accept payments both online and in-store with one processor?",
    answer: "Yes, most modern payment processors offer omnichannel solutions that allow you to accept payments both online and in physical locations. This includes support for e-commerce platforms, mobile payments (Apple Pay, Google Pay), contactless payments, and traditional point-of-sale systems. Unified processing helps simplify accounting and provides consistent reporting.",
  },
  {
    id: 5,
    question: "What's the difference between a payment gateway and a payment processor?",
    answer: "A payment gateway is the technology that securely transmits transaction data between your website/POS and the payment processor. A payment processor is the company that actually handles the transaction, communicating with card networks and banks to authorize and settle payments. Many providers today offer both services combined.",
  },
  {
    id: 6,
    question: "How do I choose the best payment processor for my small business?",
    answer: "Five things to compare: effective rate at your card mix and ticket size, contract length and termination fee, settlement time, hidden fees (PCI, monthly minimum, batch, statement), and approval rate for your industry. Sticker rates rarely match what you actually pay.",
  },
  {
    id: 7,
    question: "What does the free shortlist from Barak actually include?",
    answer: "Three providers picked against your specific vertical, monthly volume, and the operational pain you flagged. For each: realistic effective rate at your tier, settlement time, contract length and termination fee, and the specific questions to ask their sales team before you sign. No generic CRM. You get a personal reply from Barak.",
  },
];
