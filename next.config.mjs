

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
