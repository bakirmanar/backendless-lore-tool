import { EncryptedBundle } from './incrypted-bundle.model'

export interface LoreCard {
  id: string;
  title: string;
  publicText: string;
  gmEnc: EncryptedBundle | null;
}
