/**
 * Trusted infrastructure proxy CIDR blocks and keywords for Render + Cloudflare deployment topology.
 *
 * Render terminates TLS and routes traffic through:
 * 1. Cloudflare Anycast edge proxies (official IPv4 and IPv6 published ranges).
 * 2. Render internal routing mesh and load balancers (observed in production logs as 10.27.189.201 in RFC 1918 10.0.0.0/8).
 * 3. Local container loopback interface (127.0.0.1/8, ::1).
 */

/**
 * Cloudflare official published IPv4 Anycast edge ranges.
 * Verified against https://www.cloudflare.com/ips-v4
 */
export const CLOUDFLARE_IPV4_CIDRS: readonly string[] = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
];

/**
 * Cloudflare official published IPv6 Anycast edge ranges.
 * Verified against https://www.cloudflare.com/ips-v6
 */
export const CLOUDFLARE_IPV6_CIDRS: readonly string[] = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];

/**
 * Narrowed private infrastructure addresses:
 * - 'loopback': local container interface (127.0.0.1/8, ::1).
 * - '10.0.0.0/8': Render's internal private VPC load balancer subnet (observed in production logs as 10.27.189.201).
 *
 * NOTE ON INFRASTRUCTURE LIMITATION:
 * Render does not publish narrower static CIDR blocks for internal ingress load balancers.
 * Rather than trusting all RFC 1918 subnets (uniquelocal), we restrict the private trust specifically
 * to 'loopback' and '10.0.0.0/8' (Render's internal subnet). Broad ranges like 172.16.0.0/12, 192.168.0.0/16,
 * and linklocal (169.254.0.0/16) are excluded.
 */
export const RENDER_INTERNAL_PRIVATE_RANGES: readonly string[] = [
  'loopback',
  '10.0.0.0/8',
];

/**
 * Default immutable trusted infrastructure list.
 */
export const DEFAULT_TRUSTED_PROXIES: readonly string[] = Object.freeze([
  ...RENDER_INTERNAL_PRIVATE_RANGES,
  ...CLOUDFLARE_IPV4_CIDRS,
  ...CLOUDFLARE_IPV6_CIDRS,
]);

/**
 * Set of all approved infrastructure tokens that can be specified via configuration override.
 */
const APPROVED_INFRASTRUCTURE_TOKENS = new Set<string>([
  'loopback',
  '10.0.0.0/8',
  ...CLOUDFLARE_IPV4_CIDRS,
  ...CLOUDFLARE_IPV6_CIDRS,
]);

/**
 * Strictly resolves and validates the trust proxy setting.
 *
 * SECURITY INVARIANTS:
 * 1. NEVER permits 'true', 'all', '*', 'any', or wildcard subnets ('0.0.0.0/0').
 * 2. NEVER permits numeric hop counts (e.g. '1', '2', '3') because hop counts fail in multi-tier topologies.
 * 3. Rejects any unapproved or arbitrary CIDRs.
 * 4. Fails fast with an explicit Error on invalid configuration to prevent startup with an unsafe posture.
 */
export function resolveTrustProxyConfiguration(envValue?: string): readonly string[] | false {
  if (envValue === undefined || envValue.trim() === '') {
    return DEFAULT_TRUSTED_PROXIES;
  }

  const trimmed = envValue.trim().toLowerCase();

  // Explicitly disallow any permissive trust setting
  if (['true', 'all', '*', 'any', '0.0.0.0/0', '::/0'].includes(trimmed)) {
    throw new Error(
      `[Security Error] Insecure TRUST_PROXY="${envValue}" is strictly forbidden. ` +
        `Enabling global or wildcard proxy trust permits arbitrary client IP spoofing.`
    );
  }

  // Reject numeric hop counts in environment variables as fragile and unsafe
  if (!isNaN(Number(trimmed))) {
    throw new Error(
      `[Security Error] Numeric TRUST_PROXY="${envValue}" is not permitted. ` +
        `Hardcoded hop counts fail on multi-tier proxy topologies. Use approved CIDR tokens or leave unset.`
    );
  }

  // Allow explicit 'false', 'none', or 'off' for direct (unproxied) testing/development
  if (trimmed === 'false' || trimmed === 'none' || trimmed === 'off') {
    return false;
  }

  // If a custom comma-separated list of tokens is supplied, strictly validate every single token
  const tokens = envValue.split(',').map((s) => s.trim());
  if (tokens.length === 0) {
    throw new Error('[Security Error] Malformed TRUST_PROXY configuration: empty token list.');
  }

  for (const token of tokens) {
    if (!token) {
      throw new Error('[Security Error] Malformed TRUST_PROXY configuration: empty token detected in list.');
    }
    // Must be in the approved infrastructure token allowlist
    if (!APPROVED_INFRASTRUCTURE_TOKENS.has(token)) {
      throw new Error(
        `[Security Error] Unapproved or unrecognized proxy token "${token}" in TRUST_PROXY. ` +
          `Only vetted infrastructure CIDRs (Render VPC and Cloudflare edge blocks) are permitted.`
      );
    }
  }

  return Object.freeze([...tokens]);
}
