import { Article, ArticleSection } from '@app/models/article.model';
import { ContentAccessTagId } from '@app/models/content-access.model';
import { Base64, WrappedDekAll } from '@app/models/crypto.model';

export type EncryptedBundle = {
  version: number;
  accessTags: Record<ContentAccessTagId, EncryptedAccessTag>;
  users: EncryptedUser[];
  articles: Array<EncryptedArticle | PublicArticle>;
}

// TODO Actually encrypt?
export type EncryptedAccessTag = {
  id: ContentAccessTagId;
  name: string;
}

export type EncryptedUser = {
  id: string;
  name: string;

  /** salt for deriving a key from the user's password */
  salt: Base64;
  /** encrypted payload containing the user's allowed tags + tag keys */
  nonce: Base64;
  ct: Base64;
}

export type PublicArticle = Omit<Article, 'sections'> & {
  // EncryptedNode for restricted and ArticleSection for public
  sections: Array<EncryptedNode|ArticleSection>;
}

export type EncryptedArticle = {
  id: string;
  // meta includes title, type, etc.
  meta: EncryptedNode;
  // sections content, EncryptedNode for restricted and ArticleSection for public
  sections: Array<EncryptedNode|ArticleSection>;
}

export type EncryptedNode = {
  id: string;
  access: ContentAccessTagId[];
  nonce: Base64;
  ct: Base64;
  dek: WrappedDekAll;
}
