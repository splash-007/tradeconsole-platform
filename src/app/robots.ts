import type { MetadataRoute } from 'next';

/**
 * Trade Console — robots.txt configuration
 *
 * This is a private authenticated trading platform.
 * All pages carry a global NOINDEX directive via root layout metadata.
 *
 * robots.txt intentionally uses Allow: / so that crawlers can reach pages
 * and detect the NOINDEX meta tag / X-Robots-Tag header (defense-in-depth).
 *
 * No sitemap is advertised because this application must not be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    // No sitemap — private platform must not be indexed
  };
}
