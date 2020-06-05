import * as countryLanguage from 'country-language'
import { languagesAll, languages as langaugesList, countries, Country, Language } from 'countries-list';
import worldCountries from 'world-countries'
type WorldCountry = import("world-countries").Country;

export interface LanguageModel {
    languageName: string,
    languageNativeName: string,
    languageKey: string,
    countries: CountryModel[]
}

export interface CountryModel {
    countryKey: string,
    countryName: string,
    countryNativeName: string,
    emojiFlag: string,
    latitude: number,
    longitude: number
}

export class Languages {
    private languages: LanguageModel[] = [];
    private languageMap: Map<string, LanguageModel> = new Map();
    private countryMap: Map<string, CountryModel> = new Map();
    private static _instance: Languages;
    private worldCountriesMap: Map<string, WorldCountry> = new Map();
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    constructor() {
        console.time("Languages::initialize");
        this.initialize();
        console.timeEnd("Languages::initialize");
    }

    private initialize() {

        // Build map of world countries which we use for 
        // getting the longitude and latitude
        // It also has languages with the 3 letter code if needed
        for (let i = 0; i < worldCountries.length; i++) {
            const worldCountry = worldCountries[i];
            this.worldCountriesMap.set(worldCountry.cca2, worldCountry);
        }

        for (const countryCode of Object.keys(countries)) {
            const country: Country = countries[countryCode];

            // Grab from world country map to get lang/lat
            const worldCountry: WorldCountry = this.worldCountriesMap.get(countryCode);
            
            const countryModel: CountryModel = {
                countryName: country.name,
                countryNativeName: country.native,
                countryKey: countryCode,
                emojiFlag: country.emoji,
                latitude: worldCountry && worldCountry.latlng[0],
                longitude: worldCountry && worldCountry.latlng[1]
            };
            this.countryMap.set(countryModel.countryKey.toLowerCase(), countryModel);

            // We are using a second library here to get extra country info. 
            // We are combining two libraries since countries-list has the emoji data we want
            // but is missing the full mapping of languages to countries. To get that
            // we are using  country-language :/
            const extraCountryInfo = countryLanguage.getCountry(countryCode);
            let countryLanguages = extraCountryInfo.languages ? extraCountryInfo.languages.map(lan => lan.iso639_1) : country.languages;

            // Hardcoded insertion of Yiddish into IL data set. 
            // Need to submit PR to add to underlying NPM package
            if (countryCode === "IL") {
                countryLanguages = countryLanguages.concat("yi");
            }

            for (const langCode of countryLanguages) {
                if (!langCode) {
                    continue;
                }

                const language: Language = languagesAll[langCode] || langaugesList[langCode];
                if (language.name == null) {
                    continue;
                }

                const langKey = langCode.toLowerCase();
                let languageModel = this.languageMap.get(langKey);
                if (languageModel == null) {
                    languageModel = {
                        languageName: language.name,
                        languageNativeName: language.native,
                        languageKey: langCode,
                        countries: []
                    };

                    this.languageMap.set(langKey, languageModel);
                }

                languageModel.countries.push(countryModel);
            }
        }
        this.languages = Array.from(this.languageMap.values()).sort((a, b) => a.languageName.localeCompare(b.languageName));
    }

    isValidComboKey(langCode: string) {
        if (!langCode) {
            throw new Error("Language code must not be empty");
        }

        const [lang, country] = this.getLangParts(langCode);

        if (!country) {
            // we require a country since idioms are really local
            return false;
        }

        if (!this.hasLangugage(langCode)) {
            return false;
        }

        return this.languageMap.has(lang.toLowerCase()) && this.countryMap.has(country.toLowerCase());
    }

    hasLangugage(languageKey: string): boolean {
        if (!languageKey) {
            return false;
        }

        return this.languageMap.has(languageKey.toLowerCase());
    }

    getLangugage(languageKey: string): LanguageModel {
        if (!languageKey) {
            return null;
        }

        return { ... this.languageMap.get(languageKey.toLowerCase()) };
    }

    hasCountry(countryKey: string, languageKey?: string): boolean {
        return !!this.getCountry(countryKey, languageKey);
    }

    getCountry(countryKey: string, languageKey?: string): CountryModel {
        if (!countryKey) {
            return null;
        }

        countryKey = countryKey.toLowerCase();

        if (languageKey) {
            let languageModel = this.getLangugage(languageKey);
            return languageModel.countries.find(c => c.countryKey.toLowerCase() === countryKey);
        }

        return { ... this.countryMap.get(countryKey.toLowerCase()) };
    }

    getAllLanguages(): LanguageModel[] {
        return this.languages;
    }

    normalizeCountryKey(key: string) {
        return key.toUpperCase();
    }

    normalizeLanguageKey(key: string) {
        return key.toLowerCase();
    }

    private getLangParts(comboKey: string) {
        return comboKey.split("-", 2);
    }

}