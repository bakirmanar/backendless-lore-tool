import { AppState, ArticleSection, EncryptedArticle, EncryptedBundle, EncryptedNode, PublicArticle } from '@app/models';

export const encryptedBundleToAppState = (encryptedBundle: EncryptedBundle): AppState => ({
  currentUser: null,
  articles: encryptedBundle.articles
    .filter((a) => !(a as EncryptedArticle).meta)
    .map((a) => a as PublicArticle)
    .map((a) => ({
      ...a,
      sections: a.sections
        .filter((s) => !(s as EncryptedNode).dek) as ArticleSection[]
    })),
})
