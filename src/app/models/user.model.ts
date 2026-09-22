import { ContentAccessTagId } from '@app/models/content-access.model';

export const OWNER_USERNAME = 'OWNER';

export type User = {
  id: string;
  name: string;
  // TODO think about it twice
  password: string;
  access: ContentAccessTagId[];
}
