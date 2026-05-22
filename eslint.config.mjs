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
  // Severity is `warn` for now because the codebase has 88 files with em-dashes
  // pending a clean sweep. Promote to `error` after sweep is done.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
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
