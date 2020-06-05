declare module "country-language" {
    export type CodeType = '1' | '2' | '3';
    export interface LangCultureMs {
        cultureCode: string;
        displayName: string;
        langCultureName: string;
    }
    export interface Language {
        name: string[];
        nativeName: string[];

        /** Countries in code-3 */
        countries: string[];
        direction: string;
        family: string;
        iso639_1: string;
        iso639_2: string;
        iso639_2en: string;
        iso639_3: string;
        langCultureMs: LangCultureMs[];
    }
    export interface Country {
        code_2: string;
        code_3: string;
        langCultureMs: LangCultureMs[];
        languages: Language[];
    }

    export interface CountryLanguage {
        /** language iso639-1 code (2 letters) */
        iso639_1: string;
        /** language iso639-2 code with some codes derived from English names rather than native names of languages (3 letters) */
        iso639_2: string;
        /** language iso639-3 code (3 letters) */
        iso639_3: string;
    }

    export interface LanguageCountry {
        code_2: string;
        code_3: string;
        numCode: string;
    }

    export function getLanguageCodes(languageCodeType?: CodeType): string[];
    export function getCountryCodes(countryCodeType?: CodeType): string[];
    export function languageCodeExists(languageCode: string): boolean;
    export function countryCodeExists(countryCode: string): boolean;
    export function getCountry(countryCode: string): Country;
    export function getLanguage(languageCode: string): Language;
    export function getCountryLanguages(countryCode: string): CountryLanguage[]
    export function getLanguageCountries(languageCode: string): LanguageCountry[]

}