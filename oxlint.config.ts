import { withNuxt } from "./.nuxt/oxlint.mjs";

export default withNuxt({
  ignorePatterns: [
    ".nuxt/**",
    ".output/**",
    ".data/**",
    "dist/**",
    "node_modules/**",
    ".vercel/**",
  ],
  categories: {
    correctness: "error",
    suspicious: "warn",
  },
  rules: {
    // Nuxt / Vue patterns
    "import/no-unassigned-import": "off",
    // seed & admin scripts log intentionally
    "no-console": "off",
  },
  overrides: [
    {
      files: ["scripts/**/*.{ts,js}", "tests/**/*.{ts,js}"],
      rules: {
        "no-console": "off",
      },
    },
  ],
});
