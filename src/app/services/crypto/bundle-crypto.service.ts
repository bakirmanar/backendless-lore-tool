import { Injectable } from '@angular/core';
import {
  AppState,
  Article,
  ArticleSection,
  ArticleType,
  Base64,
  ContentAccessTag,
  ContentAccessTagId,
  EncryptedAccessTag,
  EncryptedArticle,
  EncryptedBundle,
  EncryptedNode,
  EncryptedUser,
  OwnerBundleData,
  PublicArticle,
  User
} from '@app/models';
import {
  aesGcmDecrypt,
  aesGcmEncrypt,
  base64ToBytes,
  bytesToBase64,
  decodeJson,
  deriveAesKeyFromPassword,
  deriveWrapKeyFromAllKeys,
  encodeJson,
  importAesGcmKeyFromRaw,
  randomBytes,
  unwrapDek,
  wrapDek
} from '@app/services/crypto/crypto.helpers';

// Content encryption (payload): AES-256-GCM
const CONTENT_DEK_BYTES = 32;

// User password KDF: PBKDF2-SHA256
const USER_SALT_BYTES = 16;

// Tag secret key bytes (permission material)
const TAG_KEY_BYTES = 32;

type KeyIdKeyMap = Record<string, Uint8Array>;

type BundledUser = User & {
  ownerBundleData?: OwnerBundleData
}

type UserDecryptionResult = {
  user: User;
  userPermissions: KeyIdKeyMap;
  ownerData: OwnerBundleData | null;
}

@Injectable({ providedIn: 'root' })
export class BundleCryptoService {
  async encrypt(state: AppState): Promise<EncryptedBundle | null> {
    if (!state.ownerData) return null;

    // TODO try catch

    // TODO actually encrypt tags
    // 1) Public tag definitions (no secrets)
    const encryptedAccessTags = this.encryptAccessTags(state.ownerData.accessTags);

    // 2) Generate secret TagKeys bundle-wide; distribute to users via encrypted user records
    const allAccessKeysMap = this.generateTagKeysMap(state.ownerData.accessTags);

    // 3) Encrypt users (store only the tag keys they are allowed)
    const encryptedUsers: EncryptedUser[] = [];
    for (let user of state.ownerData.users as BundledUser[]) {
      if (user.name == 'OWNER') {
        user = {
          ...user,
          access: state.ownerData.accessTags.map((tag) => tag.id),
          ownerBundleData: state.ownerData
        };
      }
      encryptedUsers.push(await this.encryptUser(user, allAccessKeysMap));
    }

    // 4) Encrypt articles/sections
    const encryptedArticles: Array<EncryptedArticle | PublicArticle> = [];
    for (const article of state.articles) {
      encryptedArticles.push(await this.encryptArticle(article, allAccessKeysMap));
    }

    return {
      // TODO increment
      version: 1,
      accessTags: encryptedAccessTags,
      users: encryptedUsers,
      articles: encryptedArticles,
    } satisfies EncryptedBundle;
  }

  private encryptAccessTags(accessTags: ContentAccessTag[]): Record<ContentAccessTagId, EncryptedAccessTag> {
    const map: Record<ContentAccessTagId, EncryptedAccessTag> = {};

    for (const t of accessTags) {
      map[t.id] = { id: t.id, name: t.name };
    }

    return map;
  }

  private generateTagKeysMap(accessTags: ContentAccessTag[]): KeyIdKeyMap {
    const map: KeyIdKeyMap = {};

    for (const tag of accessTags){
      map[tag.id] = randomBytes(TAG_KEY_BYTES);
    }

    return map;
  }

  private async encryptUser(
    user: BundledUser,
    bundleKeys: KeyIdKeyMap
  ): Promise<EncryptedUser> {
    const saltBytes = randomBytes(USER_SALT_BYTES);
    const userKey = await deriveAesKeyFromPassword(user.password, saltBytes);

    const plainPermissions = user.access.map((tagId) => ({
      tagId,
      tagKey: bytesToBase64(bundleKeys[tagId]),
    }));
    const payload = {
      ownerBundleData: user.ownerBundleData,
      plainPermissions
    }

    // TODO pass whole user?
    const { nonce, ct } = await aesGcmEncrypt(userKey, encodeJson(payload));

    return {
      id: user.id,
      name: user.name,
      salt: bytesToBase64(saltBytes),
      nonce,
      ct,
    } satisfies EncryptedUser;
  }


  private async encryptArticle(
    article: Article,
    bundleKeys: KeyIdKeyMap,
  ): Promise<EncryptedArticle | PublicArticle> {
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

    // Restricted meta => encrypted node; sections may still include public ones
    const metaNode = await encryptNodeAllOf(
      `meta:${article.id}`,
      // Dont want to pass whole article obj because `sections` should encrypted separately
      { title: article.title, type: article.type }, // add any other meta fields here
      article.accessTags,
      bundleKeys,
    );

    return {
      id: article.id,
      meta: metaNode,
      sections: bundledSections,
    } satisfies EncryptedArticle;
  }

  private async encryptSection(
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

    return await encryptNodeAllOf(
      `section:${article.id}:${section.id}`,
      { ...section },
      requiredKeys,
      bundleKeys
    )
  }



//   ---------------------------------
  async decrypt(
    bundle: EncryptedBundle,
    password: string
  ): Promise<AppState | null> {
    let userData = await this.tryDecryptUsersByPassword(bundle, password);
    if (!userData) {
      // TODO error?
      // FIXME NO, because there is still public info!
      // return null;
      userData = {
        user: null,
        userPermissions: {},
      } as unknown as UserDecryptionResult;
    }

    let { user, userPermissions, ownerData } = userData;
    const articles = await this.decryptArticles(bundle.articles, userPermissions);
    const state: AppState = {
      currentUser: user,
      articles,
    };

    if (ownerData) {
      // TODO store bundle somewhere in memory if needed again for reencrypting
      state.ownerData = ownerData;
      user.access = [];
      // ownerData.users.push(user);
    }

    return state;
  }

  private async tryDecryptUsersByPassword(bundle: EncryptedBundle, password: string): Promise<UserDecryptionResult | null> {
    let results = [];
    for (const user of bundle.users) {
      results.push(await this.decryptUserAndPermissions(user, password));
    }
    results = results.filter((data) => data);

    // did not login
    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  private async decryptUserAndPermissions(
    encryptedUser: EncryptedUser,
    password: string
  ): Promise<UserDecryptionResult | null> {
    if (!encryptedUser) return null;

    try {
      const userKey = await deriveAesKeyFromPassword(password, base64ToBytes(encryptedUser.salt));
      const pt = await aesGcmDecrypt(userKey, encryptedUser.nonce, encryptedUser.ct);
      const payload = decodeJson<{
        ownerBundleData: OwnerBundleData,
        plainPermissions: Array<{ tagId: ContentAccessTagId; tagKey: Base64 }>,
      }>(pt);

      const userPermissions: Record<ContentAccessTagId, Uint8Array> = {};
      for (const tag of payload.plainPermissions) {
        userPermissions[tag.tagId] = base64ToBytes(tag.tagKey);
      }

      return {
        user: {
          id: encryptedUser.id,
          name: encryptedUser.name,
          access: payload.plainPermissions.map((x) => x.tagId),
        } as User,
        userPermissions,
        ownerData: payload.ownerBundleData,
      };
    } catch (error) {
      return null;
    }
  }

  private async decryptArticles(
    articles: Array<EncryptedArticle | PublicArticle>,
    tagKeyById: KeyIdKeyMap,
  ): Promise<Article[]> {
    const outArticles: Array<Article | null> = [];

    for (const article of articles) {
      outArticles.push(await this.decryptArticle(article, tagKeyById));
    }

    // if article was not decrypted then it will be null, so filter it out
    return outArticles.filter((article) => article) as Article[];
  }

  private async decryptArticle(
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
    const meta = await tryDecryptNode<{ title: string; type?: ArticleType }>(article.meta, userKeys);
    if (!meta) {
      return null;
    }

    return {
      id: article.id,
      title: meta.title,
      type: meta.type,
      accessTags: [...article.meta.access],
      sections: await this.decryptSections(article.sections, userKeys),
    };
  }

  private isEncryptedArticle(article: EncryptedArticle | PublicArticle): article is EncryptedArticle {
    return (article as EncryptedArticle).meta !== undefined;
  }

  private async decryptSections(
    sections: Array<EncryptedNode | ArticleSection>,
    userKeys: KeyIdKeyMap,
  ): Promise<ArticleSection[]> {
    const outSections: Array<ArticleSection | null> = [];

    for (const section of sections) {
      outSections.push(await this.decryptSection(section, userKeys))
    }

    return outSections.filter((section) => section) as ArticleSection[];
  }

  private async decryptSection(
    section: EncryptedNode | ArticleSection,
    userKeys: KeyIdKeyMap,
  ): Promise<ArticleSection | null> {
    if (!this.isEncryptedNode(section)) {
      // public section
      return section;
    }

    return await tryDecryptNode<ArticleSection>(section, userKeys);
  }

  private isEncryptedNode(x: EncryptedNode | unknown): x is EncryptedNode {
    return (x as EncryptedNode).ct !== undefined;
  }
}

async function encryptNodeAllOf(
  nodeId: string,
  payloadPlain: unknown,
  requiredTags: string[],
  tagKeyById: KeyIdKeyMap
): Promise<EncryptedNode> {
  // 1) random DEK encrypts payload
  const dekRaw = randomBytes(CONTENT_DEK_BYTES);
  const dekKey = await importAesGcmKeyFromRaw(dekRaw);
  const payloadBytes = encodeJson(payloadPlain);
  const payload = await aesGcmEncrypt(dekKey, payloadBytes);

  // 2) derive wrapKey from ALL required tags, wrap DEK
  const requiredKeys = extractRequiredKeys(requiredTags, tagKeyById)
  const wrapKey = await deriveWrapKeyFromAllKeys(requiredKeys);
  const wrappedDek = await wrapDek(wrapKey, dekRaw);

  return {
    id: nodeId,
    access: [...requiredTags],
    nonce: payload.nonce,
    ct: payload.ct,
    dek: {
      nonce: wrappedDek.nonce,
      wrappedKey: wrappedDek.wrappedKey,
    },
  };
}

function extractRequiredKeys(
  requiredTags: string[],
  tagKeyById: KeyIdKeyMap
): Uint8Array[] {
  // Sort to make sure combinations of tags always create same id for encryption regardless of the original order,
  // i.e. TAG1+TAG2 vs TAG2+TAG1
  const ordered = [...requiredTags].sort((a, b) => a.localeCompare(b));

  return ordered.map((id) => tagKeyById[id]);
}

async function tryDecryptNode<T>(
  node: EncryptedNode,
  userKeys: KeyIdKeyMap
): Promise<T | null> {
  const required = node.access ?? [];

  // Public nodes should not be encrypted.
  // But if required is empty, we treat it as NOT decryptable (should have been plaintext).
  if (required.length === 0) return null;

  // Does not have all key (read as dont have access), don't even try to decrypt, it will fail anyway
  if (!hasAllTags(required, userKeys)) return null;

  try {
    const requiredKeys = extractRequiredKeys(required, userKeys);
    const wrapKey = await deriveWrapKeyFromAllKeys(requiredKeys);
    const dekRaw = await unwrapDek(wrapKey, node.dek.nonce, node.dek.wrappedKey);
    const dekKey = await importAesGcmKeyFromRaw(dekRaw);
    const pt = await aesGcmDecrypt(dekKey, node.nonce, node.ct);

    return decodeJson<T>(pt);
  } catch (error) {
    return null;
  }
}

function hasAllTags(required: ContentAccessTagId[], tagKeyById: KeyIdKeyMap): boolean {
  return required.every((tagId) => tagKeyById[tagId]);
}
