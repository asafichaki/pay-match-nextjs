import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Portfolio rule: em-dash (U+2014) banned in source. Replace with comma, colon, or period.
  // Per memory `feedback_no_em_dashes` (2026-05-02). Applies to .ts/.tsx only.
  //
  // Promoted from `warn` to `error` in PR 2 (2026-08-26) once the sweep was done:
  // 88 reported sites across 32 files, taken to zero. Two places still hold the
  // character on purpose and carry a disable directive, both in
  // src/lib/updates/voice-rules.ts: the prompt fragment that tells a model which
  // character to avoid, and the violation record that reports what it matched.
  // The sanitizer regexes need no directive; the selectors below cover strings,
  // template chunks and JSX text, not regex literals.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\u2014/]",
          message: "em-dash banned per portfolio rule; replace with comma, colon, or period.",
        },
        {
          selector: "TemplateElement[value.raw=/\\u2014/]",
          message: "em-dash banned per portfolio rule; replace with comma, colon, or period.",
        },
        {
          selector: "JSXText[value=/\\u2014/]",
          message: "em-dash banned per portfolio rule; replace with comma, colon, or period.",
        },
      ],
    },
  },
]);

export default eslintConfig;
