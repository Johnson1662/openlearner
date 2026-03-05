const NETWORK_TIMEOUT_PATTERNS = [
  'connect timeout error',
  'und_err_connect_timeout',
  'cannot connect to api',
  'delay was aborted',
  'request timed out',
  'operation timed out',
  'etimedout',
  'aborterror',
];

export function isLikelyNetworkTimeout(details: string): boolean {
  const normalized = details.toLowerCase();
  return NETWORK_TIMEOUT_PATTERNS.some(pattern => normalized.includes(pattern));
}
