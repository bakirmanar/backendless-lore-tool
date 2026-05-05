export type Base64 = string;

/**
 * Wrapped Data Encryption Key with "All of" logic
 */
export interface WrappedDekAll {
  // kind: 'ALL';
  wrappedKey: Base64;
  nonce: Base64;
}
