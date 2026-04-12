import type { NextConfig } from "next";

const configuredBasePathRaw = process.env.NEXT_PUBLIC_BASE_PATH;
const configuredBasePath = typeof configuredBasePathRaw === "string"
  ? configuredBasePathRaw.trim()
  : undefined;
const repoName = (() => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return undefined;
  const parts = repository.split("/");
  return parts.length === 2 && parts[1] ? parts[1] : undefined;
})();
const githubPagesBasePath =
  process.env.GITHUB_ACTIONS === "true" && repoName ? `/${repoName}` : "";
const basePath =
  configuredBasePath !== undefined
    ? (configuredBasePath === "/" ? "" : configuredBasePath)
    : githubPagesBasePath;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
