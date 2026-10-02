import {
  AppState,
  Article,
  ArticleSection,
  ContentAccessTagId,
  EncryptedArticle,
  EncryptedBundle,
  EncryptedNode,
  EncryptedUser,
  PublicArticle,
  User
} from '@app/models';
import {
  aesGcmDecrypt,
  base64ToBytes,
  decodeJson,
  deriveAesKeyFromPassword,
  deriveWrapKeyFromAllKeys,
  importAesGcmKeyFromRaw,
  unwrapDek
} from '@app/crypto';
import { extractRequiredKeys } from './bundle-crypto-common.helpers';
import {
  ArticleEncryptionPayload,
  KeyIdKeyMap,
  UserDecryptionResult,
  UserEncryptionPayload
} from './bundle-crypto-common.models';

export class BundleDecryptService {
  static async decrypt(bundle: EncryptedBundle, password: string): Promise<AppState | null> {
    const { user, userPermissions, ownerData } = await this.tryDecryptUserByPassword(bundle, password)
      || this.buildGuestUser();

    const articles = await this.decryptArticles(bundle.articles, userPermissions);
    const state: AppState = {
      currentUser: user,
      articles,
    };

    if (ownerData) {
      state.ownerData = ownerData;
      user.access = [];
    }

    return state;
  }

  private static async tryDecryptUserByPassword(
    bundle: EncryptedBundle,
    password: string
  ): Promise<UserDecryptionResult | null> {
    let results = [];
    for (const user of bundle.users) {
      results.push(await this.decryptUserAndPermissions(user, password));
    }
    results = results.filter((data) => data);

    // did not log in
    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  private static async decryptUserAndPermissions(
    encryptedUser: EncryptedUser,
    password: string
  ): Promise<UserDecryptionResult | null> {
    if (!encryptedUser) return null;

    try {
      const userKey = await deriveAesKeyFromPassword(password, base64ToBytes(encryptedUser.salt));
      const pt = await aesGcmDecrypt(userKey, encryptedUser.nonce, encryptedUser.ct);
      const payload = decodeJson<UserEncryptionPayload>(pt);

      const userPermissions: KeyIdKeyMap = {};
      for (const tag of payload.plainPermissions) {
        userPermissions[tag.tagId] = base64ToBytes(tag.tagKey);
      }

      return {
        user: {
          id: payload.id,
          name: payload.name,
          password: null as unknown as string,
          access: payload.plainPermissions.map((x) => x.tagId),
        } satisfies User,
        userPermissions,
        ownerData: payload.ownerBundleData,
      };
    } catch (error) {
      return null;
    }
  }

  private static async decryptArticles(
    articles: Array<EncryptedArticle | PublicArticle>,
    tagKeyById: KeyIdKeyMap,
  ): Promise<Article[]> {
    const outArticles: Array<Article | null> = [];

    for (const article of articles) {
      outArticles.push(await this.decryptArticle(article, tagKeyById));
    }

    // if an article was not decrypted then it will be null, so filter it out
    return outArticles.filter(Boolean) as Article[];
  }

  private static async decryptArticle(
    article: EncryptedArticle | PublicArticle,
    userKeys: KeyIdKeyMap,
  ): Promise<Article | null> {
    // Public article
    if (!this.isEncryptedArticle(article)) {
      return {
        id: article.id,
        title: article.title,
        type: article.type,
        accessTags: article.accessTags ?? [],
        sections: await this.decryptSections(article.sections, userKeys),
      };
    }

    // EncryptedArticle: must decrypt meta first; if cannot, hide article
    const meta = await this.tryDecryptNode<ArticleEncryptionPayload>(article.meta, userKeys);
    if (!meta) {
      return null;
    }

    return {
      id: meta.id,
      title: meta.title,
      type: meta.type,
      accessTags: [...article.meta.access],
      sections: await this.decryptSections(article.sections, userKeys),
    };
  }

  private static isEncryptedArticle(article: EncryptedArticle | PublicArticle): article is EncryptedArticle {
    return (article as EncryptedArticle).meta !== undefined;
  }

  private static async decryptSections(
    sections: Array<EncryptedNode | ArticleSection>,
    userKeys: KeyIdKeyMap,
  ): Promise<ArticleSection[]> {
    const outSections: Array<ArticleSection | null> = [];

    for (const section of sections) {
      outSections.push(await this.decryptSection(section, userKeys))
    }

    return outSections.filter((section) => section) as ArticleSection[];
  }

  private static async decryptSection(
    section: EncryptedNode | ArticleSection,
    userKeys: KeyIdKeyMap,
  ): Promise<ArticleSection | null> {
    if (!this.isEncryptedNode(section)) {
      // public section
      return section;
    }

    // TODO during encryption we put parent tags to section tags. We probably should remove them on decryption
    return await this.tryDecryptNode<ArticleSection>(section, userKeys);
  }

  private static isEncryptedNode(x: EncryptedNode | unknown): x is EncryptedNode {
    return (x as EncryptedNode).ct !== undefined;
  }

  private static async tryDecryptNode<T>(
    node: EncryptedNode,
    userKeys: KeyIdKeyMap
  ): Promise<T | null> {
    const requiredTagIds = node.access ?? [];

    // Public nodes should not be encrypted.
    // But if required is empty, we treat it as NOT decryptable (should have been plaintext).
    if (requiredTagIds.length === 0) return null;

    // Does not have all key (read as don't have access), don't even try to decrypt, it will fail anyway
    if (!this.hasAllTags(requiredTagIds, userKeys)) return null;

    try {
      const requiredTagKeys = extractRequiredKeys(requiredTagIds, userKeys);
      const wrapKey = await deriveWrapKeyFromAllKeys(requiredTagKeys);
      const dekRaw = await unwrapDek(wrapKey, node.dek.nonce, node.dek.wrappedKey);
      const dekKey = await importAesGcmKeyFromRaw(dekRaw);
      const pt = await aesGcmDecrypt(dekKey, node.nonce, node.ct);

      return decodeJson<T>(pt);
    } catch (error) {
      return null;
    }
  }

  private static hasAllTags(required: ContentAccessTagId[], tagKeyById: KeyIdKeyMap): boolean {
    return required.every((tagId) => tagKeyById[tagId]);
  }

  private static buildGuestUser(): UserDecryptionResult {
    return {
      user: null,
      userPermissions: {},
    } as unknown as UserDecryptionResult
  }
}
