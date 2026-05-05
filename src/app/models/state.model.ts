import { Article } from '@app/models/article.model';
import { User } from '@app/models/user.model';
import { ContentAccessTag } from '@app/models/content-access.model';

// state after decryption the bundle. Contains only data available for the user based on their access.
export type AppState = {
  // contains user id and list of tags if needed
  currentUser: User | null,
  // settings for the bundle accessible only for the owner
  ownerData?: OwnerBundleData,
  // Only decrypted articles. Owner will have everything there, while other users will have only available content
  articles: Article[],
}

export type OwnerBundleData = {
  // List of users with their access
  users: User[],
  // List of possible tags
  accessTags: ContentAccessTag[],
}
