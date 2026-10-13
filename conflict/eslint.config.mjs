import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
