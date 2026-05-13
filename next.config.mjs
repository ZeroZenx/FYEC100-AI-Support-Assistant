const moodleOrigin = process.env.MOODLE_ORIGIN;

function securityHeaders() {
  const headers = [
    {
      key: "X-Content-Type-Options",
      value: "nosniff"
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin"
    }
  ];

  if (moodleOrigin) {
    headers.push({
      key: "Content-Security-Policy",
      value: `frame-ancestors 'self' ${moodleOrigin};`
    });
  }

  return headers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/embed",
        headers: securityHeaders()
      },
      {
        source: "/api/:path*",
        headers: securityHeaders()
      }
    ];
  }
};

export default nextConfig;
