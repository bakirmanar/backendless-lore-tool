import { EncryptedBundle } from './incrypted-bundle.model'

export enum ArticleType {
  CHARACTER = 'Character',
  LOCATION = 'Location',
  FACTION = 'Faction',
  HISTORICAL_EVENT = 'Historical Event',
}

export enum LoreSectionAccess {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export type LoreSection =
  | { access: LoreSectionAccess.PUBLIC; text: string }
  | { access: LoreSectionAccess.PRIVATE; enc: EncryptedBundle };

export interface LoreArticle {
  id: string;
  title: string;
  type?: ArticleType | null;
  sections: LoreSection[];
}
