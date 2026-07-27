function configuredMoodleOrigin() {
  if (!process.env.MOODLE_ORIGIN) return null;

  try {
    return new URL(process.env.MOODLE_ORIGIN).origin;
  } catch {
    return null;
  }
}

function globalSecurityHeaders() {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
    },
    { key: "X-DNS-Prefetch-Control", value: "off" }
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains"
    });
  }

  return headers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    const moodleOrigin = configuredMoodleOrigin();
    const frameAncestors = moodleOrigin
      ? `'self' ${moodleOrigin}`
      : process.env.NODE_ENV === "production"
        ? "'none'"
        : "'self'";

    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders()
      },
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors};`
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }]
      }
    ];
  }
};

export default nextConfig;
