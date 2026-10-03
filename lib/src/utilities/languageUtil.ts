import { languages, type ILanguage, type TLanguageCode } from 'countries-list';


export function getLanguageName(languageKey: string | null): (string | null) {
    if (!languageKey) {
        return null;
    }

    if (languageKey.toLocaleLowerCase() === "all") {
        return "All";
    }

    const language = languages[languageKey as TLanguageCode] as ILanguage | undefined;
    if (!language?.name) {
        return null;
    }
    return language.name;
}

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