/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Add this for Google profile pictures
      'nextjs.org'                  // Keep this for your existing Next.js images
    ],
  },
}

module.exports = nextConfig 