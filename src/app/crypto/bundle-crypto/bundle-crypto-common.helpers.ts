import { KeyIdKeyMap } from  './bundle-crypto-common.models';

export function extractRequiredKeys(
  requiredKeyIds: string[],
  keyIdKeyMap: KeyIdKeyMap
): Uint8Array[] {
  // Sort to make sure combinations of tags always create same id for encryption regardless of the original order,
  // i.e. TAG1+TAG2 vs TAG2+TAG1
  return [...requiredKeyIds]
    .sort((a, b) => a.localeCompare(b))
    .map((id) => keyIdKeyMap[id]);
}
