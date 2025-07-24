/** @type {import('next').NextConfig} */
const nextConfig = {
  /*eslint: {
    ignoreDuringBuilds: true,
  },*/
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "codefusion-projects.s3.sa-east-1.amazonaws.com",
        port: "",
        pathname: "/static-ecw/**",
      },
    ],
  },
};

export default nextConfig;
