import { ContentAccessTagId } from '@app/models/content-access.model';

export enum ArticleType {
  CHARACTER = 'Character',
  LOCATION = 'Location',
  FACTION = 'Faction',
  HISTORICAL_EVENT = 'Historical Event',
}

export type Article = {
  id: string;
  title: string;
  type?: ArticleType;
  accessTags: ContentAccessTagId[];
  sections: ArticleSection[];
}

export type ArticleSection = {
  id: string;
  accessTags: ContentAccessTagId[];
  content: string;
};
