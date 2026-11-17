import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
/** @type {import('next').NextConfig} */
const config = {
  // Sitio estático: una página por región, provincia, comuna y ficha (Cloudflare Pages).
  output: "export",
  images: { unoptimized: true },
  transpilePackages: [
    "@territorio-vivo/core",
    "@territorio-vivo/i18n",
    "@territorio-vivo/design-tokens",
  ],
  turbopack: { root },
  agentRules: false,
};
export default config;
