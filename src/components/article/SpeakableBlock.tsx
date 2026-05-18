// Marks a content block as Speakable for AI Overviews + voice assistants.
// Per geo-architect/03-citation-worthy-content.md § Speakable schema.
//
// CSS selectors to match in Article schema:
//   speakable.cssSelector: ["h1", "[data-speakable='true']"]
//
// Use sparingly: 2 blocks max per cornerstone. Each block must stand alone
// (a screen reader could read it; an LLM can quote it).

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "p" | "div" | "section";
}

export function SpeakableBlock({ children, className, as = "p" }: Props) {
  const Tag = as as "p";
  return (
    <Tag data-speakable="true" className={className}>
      {children}
    </Tag>
  );
}

/** Canonical CSS selectors to declare in Article schema `speakable.cssSelector`. */
export const SPEAKABLE_SELECTORS = ["h1", "[data-speakable='true']"];
