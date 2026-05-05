import { ContentAccessTagId } from '@app/models/content-access.model';

export type User = {
  id: string;
  name: string;
  // TODO think about it twice
  password: string;
  access: ContentAccessTagId[];
}
