import { EncryptedBundle } from './incrypted-bundle.model'

export enum LoreSectionAccess {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export type LoreSection =
  | { access: LoreSectionAccess.PUBLIC; text: string }
  | { access: LoreSectionAccess.PRIVATE; enc: EncryptedBundle };

export interface LoreCard {
  id: string;
  title: string;
  sections: LoreSection[];
}
