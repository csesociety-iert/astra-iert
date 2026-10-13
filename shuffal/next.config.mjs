const apiUrl = process.env.ASTRA_API_URL?.replace(/\/+$/, "");

const nextConfig = {
  async rewrites() {
    return apiUrl
      ? [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }]
      : [];
  },
};

export default nextConfig;
