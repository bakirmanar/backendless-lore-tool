import {
  AppState,
  Article,
  ArticleSection,
  ContentAccessTag,
  EncryptedArticle,
  EncryptedBundle,
  EncryptedNode,
  EncryptedUser,
  OWNER_USERNAME,
  PublicArticle
} from '@app/models';
import {
  aesGcmEncrypt,
  bytesToBase64,
  deriveAesKeyFromPassword,
  deriveWrapKeyFromAllKeys,
  encodeJson,
  importAesGcmKeyFromRaw,
  randomBytes,
  wrapDek
} from '@app/crypto';
import { extractRequiredKeys } from './bundle-crypto-common.helpers';
import {
  ArticleEncryptionPayload,
  BundledUser,
  KeyIdKeyMap,
  UserEncryptionPayload
} from './bundle-crypto-common.models';


// Tag secret key bytes (permission material)
const TAG_KEY_BYTES = 32;
// User password KDF: PBKDF2-SHA256
const USER_SALT_BYTES = 16;
// Content encryption (payload): AES-256-GCM
const CONTENT_DEK_BYTES = 32;

export class BundleEncryptService {
  static async encrypt(state: AppState): Promise<EncryptedBundle | null> {
    if (!state.ownerData) return null;

    // TODO try catch

    // 1) Generate secret TagKeys bundle-wide; distribute to users via encrypted user records
    const allAccessKeysMap = this.generateTagKeysMap(state.ownerData.accessTags);

    // 2) Encrypt users (store only the tag keys they are allowed)
    const encryptedUsers: EncryptedUser[] = [];
    for (let user of state.ownerData.users as BundledUser[]) {
      if (user.name === OWNER_USERNAME) {
        user = {
          ...user,
          access: state.ownerData.accessTags.map((tag) => tag.id),
          ownerBundleData: state.ownerData
        };
      }
      encryptedUsers.push(await this.encryptUser(user, allAccessKeysMap));
    }

    // 3) Encrypt articles/sections
    const encryptedArticles: Array<EncryptedArticle | PublicArticle> = [];
    for (const article of state.articles) {
      encryptedArticles.push(await this.encryptArticle(article, allAccessKeysMap));
    }

    // 4) Build final bundle
    return {
      // TODO increment
      version: 1,
      users: encryptedUsers,
      articles: encryptedArticles,
    } satisfies EncryptedBundle;
  }

  private static generateTagKeysMap(accessTags: ContentAccessTag[]): KeyIdKeyMap {
    const map: KeyIdKeyMap = {};

    for (const tag of accessTags){
      map[tag.id] = randomBytes(TAG_KEY_BYTES);
    }

    return map;
  }

  private static async encryptUser(user: BundledUser, bundleKeys: KeyIdKeyMap): Promise<EncryptedUser> {
    const saltBytes = randomBytes(USER_SALT_BYTES);
    const userKey = await deriveAesKeyFromPassword(user.password, saltBytes);
    const plainPermissions = user.access.map((tagId) => ({
      tagId,
      tagKey: bytesToBase64(bundleKeys[tagId]),
    }));
    const payload = {
      id: user.id,
      name: user.name,
      ownerBundleData: user.ownerBundleData,
      plainPermissions
    } satisfies UserEncryptionPayload;
    const { nonce, ct } = await aesGcmEncrypt(userKey, encodeJson(payload));

    return {
      salt: bytesToBase64(saltBytes),
      nonce,
      ct,
    } satisfies EncryptedUser;
  }

  private static async encryptArticle(article: Article, bundleKeys: KeyIdKeyMap): Promise<EncryptedArticle | PublicArticle> {
    const isArticlePublic = !article.accessTags.length;

    // Sections: public if section.access empty, otherwise EncryptedNode
    const bundledSections: Array<EncryptedNode | ArticleSection> = [];
    for (const section of article.sections) {
      bundledSections.push(await this.encryptSection(article, section, bundleKeys));
    }

    if (isArticlePublic) {
      // PublicArticle can contain encrypted sections
      return {
        ...article,
        sections: bundledSections,
      } satisfies PublicArticle;
    }

    // Dont want to pass whole article obj because `sections` should encrypted separately
    const articlePayload = {
      id: article.id,
      title: article.title,
      type: article.type
    } satisfies ArticleEncryptionPayload;
    const metaNode = await this.encryptNodeAllOf(articlePayload, article.accessTags, bundleKeys);

    return {
      meta: metaNode,
      sections: bundledSections,
    } satisfies EncryptedArticle;
  }

  private static async encryptSection(
    article: Article,
    section: ArticleSection,
    bundleKeys: KeyIdKeyMap,
  ): Promise<EncryptedNode | ArticleSection> {
    // Since sections encrypted separately from article meta we need to make sure that each section also inherits
    // parent's (article's) access restrictions, but only during encrypting
    const requiredKeys = Array.from(new Set<string>([...article.accessTags, ...section.accessTags]));

    if (!requiredKeys.length) {
      // public section, return as is
      return section;
    }

    return await this.encryptNodeAllOf({ ...section }, requiredKeys, bundleKeys);
  }

  private static async encryptNodeAllOf(
    payloadPlain: unknown,
    requiredKeyIds: string[],
    keyIdKeyMap: KeyIdKeyMap
  ): Promise<EncryptedNode> {
    // 1) random DEK encrypts payload
    const dekRaw = randomBytes(CONTENT_DEK_BYTES);
    const dekKey = await importAesGcmKeyFromRaw(dekRaw);
    const payloadBytes = encodeJson(payloadPlain);
    const { nonce, ct } = await aesGcmEncrypt(dekKey, payloadBytes);

    // 2) derive wrapKey from ALL required tags, wrap DEK
    const requiredKeys = extractRequiredKeys(requiredKeyIds, keyIdKeyMap)
    const wrapKey = await deriveWrapKeyFromAllKeys(requiredKeys);
    const wrappedDek = await wrapDek(wrapKey, dekRaw);

    return {
      access: [...requiredKeyIds],
      nonce,
      ct,
      dek: {
        nonce: wrappedDek.nonce,
        wrappedKey: wrappedDek.wrappedKey,
      },
    };
  }
}
