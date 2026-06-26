/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // Keep heavy server-only document parsers out of the bundle.
  // - pdf-parse: kept for safety even though we no longer import it directly.
  // - pdfjs-dist: our direct dependency for PDF extraction; must not be bundled
  //   because it contains dynamic requires and optional native deps.
  // - mammoth: Node-only deps; bundling breaks the server build.
  // - canvas / @napi-rs/canvas: native binaries that pdfjs-dist optionally
  //   requires; must be external so the bundler does not choke on them.
  serverExternalPackages: [
    'pdf-parse',
    'pdfjs-dist',
    'mammoth',
    'canvas',
    '@napi-rs/canvas',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdfjs-dist has an optional `require('canvas')` that throws at bundle
      // time when canvas is not installed. Alias it to false so the bundler
      // treats it as an empty module (pdfjs falls back gracefully).
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              "frame-src 'self' https://www.youtube.com https://youtube.com",
              "connect-src 'self' https://*.supabase.co https://supabase.co",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
