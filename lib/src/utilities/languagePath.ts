export function toLanguageSlug(languageName: string) {
  return languageName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLanguagePath(languageName: string) {
  return `/languages/${toLanguageSlug(languageName)}/idioms`;
}
