import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Input, Select } from "antd";
import { useEffect, useState } from "react";
import {
  GetLanguagesWithIdioms,
  GetLanguagesWithIdioms_languagesWithIdioms,
} from "../__generated__/types";
import { getLanguageName } from "../utilities/languageUtil";
import "./SearchBox.scss";

const { Search } = Input;

export const getLanguagesWithIdiomsQuery = gql`
  query GetLanguagesWithIdioms {
    languagesWithIdioms {
      languageName
      languageNativeName
      languageKey
    }
  }
`;

export interface SearchBoxProps {
  filter: string | null;
  language: string | null;
  onSearch: (value: string) => void;
  onLanguageChange: (value: string) => void;
}

export function SearchBox(props: SearchBoxProps) {
  const [query, setQuery] = useState(props.filter || "");
  const { data, loading } = useQuery<GetLanguagesWithIdioms>(
    getLanguagesWithIdiomsQuery,
  );
  useEffect(() => {
    setQuery(props.filter || "");
  }, [props.filter]);
  const languages: GetLanguagesWithIdioms_languagesWithIdioms[] = [
    {
      languageKey: "all",
      languageName: "All",
      languageNativeName: "All",
      __typename: "Language",
    },
    ...(!loading && data?.languagesWithIdioms
      ? data.languagesWithIdioms
      : []),
  ];
  const selectedLanguage =
    props.language || getLanguageName(props.language) || "en";

  return (
    <div className="idiomSearchControls">
      <Search
        aria-label="Find an idiom"
        value={query}
        className="idiomSearchBox"
        placeholder="Find an idiom"
        size="large"
        enterButton
        onChange={(event) => setQuery(event.target.value)}
        onSearch={props.onSearch}
      />
      <Select
        aria-label="Language"
        value={selectedLanguage}
        className="languageSelect"
        size="large"
        classNames={{ popup: { root: "languageOptionContainer" } }}
        onChange={props.onLanguageChange}
        options={languages.map((language) => ({
          value: language.languageKey,
          label: language.languageName,
          title: language.languageNativeName,
          className: "languageOption",
        }))}
      />
    </div>
  );
}
