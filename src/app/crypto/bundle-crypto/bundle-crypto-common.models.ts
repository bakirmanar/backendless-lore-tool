import { Article, Base64, ContentAccessTagId, OwnerBundleData, User } from '@app/models';

export type KeyIdKeyMap = Record<string, Uint8Array>;

export type BundledUser = User & {
  ownerBundleData?: OwnerBundleData
}

export type UserEncryptionPayload = {
  id: User['id'];
  name: User['name'];
  plainPermissions: { tagId: ContentAccessTagId, tagKey: Base64 }[]
  ownerBundleData?: OwnerBundleData,
}

export type UserDecryptionResult = {
  user: User;
  userPermissions: KeyIdKeyMap;
  ownerData?: OwnerBundleData;
}

export type ArticleEncryptionPayload = {
  id: Article['id'];
  title: Article['title'];
  type: Article['type'];
}
