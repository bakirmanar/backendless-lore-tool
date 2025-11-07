import { EncryptedBundle } from './incrypted-bundle.model'

export interface LoreCard {
  id: string;
  title: string;
  publicText: string;
  playersEnc: EncryptedBundle | null;
  gmEnc: EncryptedBundle | null;
}
