import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/*
  Flat config (ESLint 9). `npm run build` runs typecheck + lint before
  `next build`, and lint runs with --max-warnings 0, so anything ESLint has an
  opinion about fails the build rather than scrolling past in the output.
*/
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "legacy/**", // the pre-Next static build, kept for reference only
      "next-env.d.ts",
    ],
  },

  ...coreWebVitals,
  ...typescript,

  {
    rules: {
      /* The type-safety bans from architecture_skill.md, as errors rather
         than warnings — fix the underlying issue, don't silence it. */
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      /* Errors must surface, never be swallowed. */
      "no-empty": ["error", { allowEmptyCatch: false }],
    },
  },
];

export default config;
