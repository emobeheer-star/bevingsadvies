import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use native Node.js APIs or binary addons — keep them out of the bundle
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'canvas', 'pdfkit'],
};

export default nextConfig;
