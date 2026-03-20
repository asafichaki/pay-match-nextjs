export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  rating: number;
  businessType?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Switching payment processors was seamless, and we're saving over $400 a month on processing fees. The comparison tool made it so easy to find the right payment solution for our cafe.",
    author: "Sarah L.",
    role: "Owner, The Daily Grind Cafe",
    rating: 5,
    businessType: "Restaurant"
  },
  {
    id: 2,
    quote: "The detailed breakdown of payment processor features was a game-changer. We finally have a system that integrates with our e-commerce platform and has next-day funding for better cash flow.",
    author: "Michael B.",
    role: "Manager, Tech Gadgets Online",
    rating: 5,
    businessType: "E-commerce"
  },
  {
    id: 3,
    quote: "As a small business owner, every dollar counts. myPayAdvisor helped us find a payment processor with no monthly fees and transparent pricing, which has been huge for our bottom line.",
    author: "Jessica R.",
    role: "Founder, Artisan Boutique",
    rating: 5,
    businessType: "Retail"
  },
];
