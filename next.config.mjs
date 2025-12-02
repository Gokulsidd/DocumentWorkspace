/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    basePath: "/DocumentWorkspaceV2",  // ✅ Ensure this matches IIS site path
    assetPrefix: "/DocumentWorkspaceV2/", // ✅ Ensures correct static file paths
    trailingSlash: true, // ✅ Helps with IIS routing


    turbopack: {},

    async rewrites() {
        return [
            {
                source: "/_next/:path*",
                destination: "/DocumentWorkspaceV2/_next/:path*", // ✅ Fix for static assets
            },
        ];
    },
};

export default nextConfig;