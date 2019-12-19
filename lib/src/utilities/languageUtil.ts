import { languagesAll, languages as langaugesList, Language } from 'countries-list';


export function getLanguageName(languageKey: string | null): (string | null) {
    if (!languageKey) {
        return null;
    }

    const language: Language = languagesAll[languageKey] || langaugesList[languageKey];
    if (language.name == null) {
        return null;
    }
    return language.name;
}