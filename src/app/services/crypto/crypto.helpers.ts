import { Base64, EncryptedNode } from '@app/models';

// Content encryption (payload): AES-256-GCM
const CONTENT_DEK_BYTES = 32;
const CONTENT_NONCE_BYTES = 12;

// Wrapping DEK: AES-256-GCM
const WRAP_KEY_BYTES = 32;
const WRAP_NONCE_BYTES = 12;

// User password KDF: PBKDF2-SHA256
const USER_SALT_BYTES = 16;
const USER_DERIVED_KEY_BITS = 256;

const PBKDF2_ITERATIONS = 310_000;


export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export const b64urlEncode = (bytes: Uint8Array): string => {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const b64urlDecode  = (str: string): Uint8Array => {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const base64 = (str + pad)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return base64ToBytes(base64);
}

export const randomBytes = (n: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(n));
}

export const bytesToArrayBuffer = (u8: Uint8Array): ArrayBuffer => {
  // Copy into a real ArrayBuffer
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

export const encodeJson = (obj: unknown): Uint8Array => {
  return new TextEncoder().encode(JSON.stringify(obj));
}

export const decodeJson = <T>(bytes: Uint8Array): T => {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}


export const aesGcmEncrypt = async (
  key: CryptoKey,
  plaintext: Uint8Array,
  nonceBytes: number = CONTENT_NONCE_BYTES,
): Promise<{ nonce: Base64; ct: Base64 }> => {
  const ivBytes = randomBytes(nonceBytes);

  // TS-friendly: iv as ArrayBuffer
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bytesToArrayBuffer(ivBytes) },
    key,
    bytesToArrayBuffer(plaintext)
  );

  return {
    nonce: bytesToBase64(ivBytes),
    ct: bytesToBase64(new Uint8Array(ct)),
  };
}

export const aesGcmDecrypt = async (
  key: CryptoKey,
  nonceB64: Base64,
  ctB64: Base64,
): Promise<Uint8Array> => {
  const iv = base64ToBytes(nonceB64);
  const ct = base64ToBytes(ctB64);

  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytesToArrayBuffer(iv) },
    key,
    bytesToArrayBuffer(ct)
  );

  return new Uint8Array(pt);
}

export const deriveAesKeyFromPassword =  async (
  password: string,
  saltBytes: Uint8Array,
  derivedKeyBitsLength: number = USER_DERIVED_KEY_BITS,
  pbkdf2Iterations= PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
  const pwKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const salt = bytesToArrayBuffer(saltBytes);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: pbkdf2Iterations,
    },
    pwKey,
    { name: 'AES-GCM', length: derivedKeyBitsLength },
    false,
    ['encrypt', 'decrypt']
  );
}

export const importAesGcmKeyFromRaw = async (raw: Uint8Array): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'raw',
    bytesToArrayBuffer(raw),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export const hkdfSha256 = async (
  ikm: Uint8Array,
  info: string
): Promise<Uint8Array> => {
  const ikmKey = await crypto.subtle.importKey(
    'raw',
    bytesToArrayBuffer(ikm), // TS-friendly
    'HKDF',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array([]),
      info: new TextEncoder().encode(info),
    },
    ikmKey,
    WRAP_KEY_BYTES * 8
  );

  return new Uint8Array(bits);
}

export const wrapDek = async (
  wrapKey: CryptoKey,
  dekRaw: Uint8Array,
): Promise<{ nonce: Base64; wrappedKey: Base64 }> => {
  const ivBytes = randomBytes(WRAP_NONCE_BYTES);
  const wrapped = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bytesToArrayBuffer(ivBytes) },
    wrapKey,
    bytesToArrayBuffer(dekRaw)
  );

  return {
    nonce: bytesToBase64(ivBytes),
    wrappedKey: bytesToBase64(new Uint8Array(wrapped)),
  };
}

export const unwrapDek = async (
  wrapKey: CryptoKey,
  nonceB64: Base64,
  wrappedKeyB64: Base64,
): Promise<Uint8Array> => {
  const iv = base64ToBytes(nonceB64);
  const ct = base64ToBytes(wrappedKeyB64);

  const dekRaw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytesToArrayBuffer(iv) },
    wrapKey,
    bytesToArrayBuffer(ct)
  );

  return new Uint8Array(dekRaw);
}

export const deriveWrapKeyFromAllKeys = async (keys: Uint8Array[]): Promise<CryptoKey> => {
  const total = keys.reduce((s, p) => s + p.length, 0);
  const ikm = new Uint8Array(total);
  let offset = 0;
  for (const p of keys) {
    ikm.set(p, offset);
    offset += p.length;
  }
  // Combine for ALL-of tags: HKDF-SHA256
  const HKDF_INFO = 'bundle:tags-allof';
  const wrapKeyBytes = await hkdfSha256(ikm, HKDF_INFO);

  return crypto.subtle.importKey(
    'raw',
    bytesToArrayBuffer(wrapKeyBytes),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function deriveWrapKeyFromAnyKeys(keys: Uint8Array[]) {
  // noop for now
}
