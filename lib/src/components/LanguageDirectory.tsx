import { Link } from "react-router";
import { getLanguagePath } from "../utilities/languageUtil";
import "./LanguageDirectory.scss";

export interface DirectoryLanguage {
  languageKey: string;
  languageName: string;
  languageNativeName: string;
}

export function LanguageDirectory({
  languages,
}: {
  languages: DirectoryLanguage[];
}) {
  return (
    <nav className="languageDirectory" aria-label="Browse idioms by language">
      <h2>Browse idioms by language</h2>
      <ul>
        {languages.map((language) => (
          <li key={language.languageKey}>
            <Link to={getLanguagePath(language.languageName)}>
              {language.languageName}
              {language.languageNativeName !== language.languageName
                ? ` (${language.languageNativeName})`
                : ""}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
