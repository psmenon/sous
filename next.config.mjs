import path from "node:path";
import nextEnv from "@next/env";

// Load .env files here too, so a local SOUS_FAKE_AI in .env.local is seen when choosing the module below.
nextEnv.loadEnvConfig(process.cwd());

// Canned test answers (src/lib/fake-ai.ts) are compiled in only when SOUS_FAKE_AI is set at build time.
// Every other build, including Vercel, gets the empty stub, so no mock code ships to production.
const fakeModule = process.env.SOUS_FAKE_AI ? "src/lib/fake-ai.ts" : "src/lib/fake-ai.off.ts";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias["@fake-ai"] = path.resolve(process.cwd(), fakeModule);
    return config;
  },
};
export default nextConfig;
