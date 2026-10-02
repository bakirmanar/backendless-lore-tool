import { Article, ArticleSection } from '@app/models/article.model';
import { ContentAccessTagId } from '@app/models/content-access.model';
import { Base64, WrappedDekAll } from '@app/models/crypto.model';

export type EncryptedBundle = {
  version: number;
  users: EncryptedUser[];
  articles: Array<EncryptedArticle | PublicArticle>;
}

export type EncryptedUser = {
  /** salt for deriving a key from the user's password */
  salt: Base64;
  /** encrypted payload containing the user's name, allowed tags + tag keys */
  nonce: Base64;
  ct: Base64;
}

export type PublicArticle = Omit<Article, 'sections'> & {
  // EncryptedNode for restricted and ArticleSection for public
  sections: Array<EncryptedNode|ArticleSection>;
}

export type EncryptedArticle = {
  // meta includes title, type, etc.
  meta: EncryptedNode;
  // sections content, EncryptedNode for restricted and ArticleSection for public
  sections: Array<EncryptedNode|ArticleSection>;
}

export type EncryptedNode = {
  access: ContentAccessTagId[];
  nonce: Base64;
  ct: Base64;
  dek: WrappedDekAll;
}
