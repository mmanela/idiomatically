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