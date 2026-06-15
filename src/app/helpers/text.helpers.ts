export const toReadableText = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '') // remove html tags
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // keep unicode letters/numbers
}

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '') // remove html tags
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // keep unicode letters/numbers
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
