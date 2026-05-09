export enum FileType {
  JSON = 'application/json',
}

export const FileExtensionMap: Record<FileType, string> = {
  [FileType.JSON]: 'json',
}
