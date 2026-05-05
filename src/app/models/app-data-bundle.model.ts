import { Article } from '@app/models/article.model';
// TODO remove whole file
export type AppDataBundle = {
  id: string;
  version: string;
  keyring: {
    ownerKey: { id: "KEY:OWNER"; wrappedByPasswords: WrappedByPassword[] };
    tagKeys: Array<{
      id: string; // KEY:TAG:<tag>
      tagName: string;
      wrappedByKeys: WrappedByKey[];         // unwrap with OWNER
      wrappedByPasswords: WrappedByPassword[]; // unwrap with group pass
    }>;
  };
  articles: ArticleBundle[];
}

export type ArticleBundle = {
  id: string;
  sections: SectionBundle[];
}
export type SectionBundle = {
  id: string;
}

export type WrappedByPassword = {
  label: string;      // "PASS:master" | "PASS:group1" ...
  salt: string;       // b64url
  iv: string;         // b64url
  ct: string;         // b64url (wrapped key bytes)
};

export type WrappedByKey = {
  label: string;      // "WRAP:BY:OWNER"
  iv: string;         // b64url
  ct: string;         // b64url
};

export type EncryptedBlob = {
  iv: string;
  ct: string;
};
