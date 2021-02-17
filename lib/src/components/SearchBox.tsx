import * as React from "react";
import "./SearchBox.scss";
import { Input, Select } from "antd";
import { useQuery, gql } from "@apollo/client";
import {
  GetLanguagesWithIdioms,
  GetLanguagesWithIdioms_languagesWithIdioms
} from "../__generated__/types";
import { getLanguageName } from "../utilities/languageUtil";
const { Search } = Input;
const { Option } = Select;

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
  const { data, loading } = useQuery<GetLanguagesWithIdioms>(
    getLanguagesWithIdiomsQuery
  );

  const loadLangs = !loading && data && data.languagesWithIdioms;
  const defaultLangs: GetLanguagesWithIdioms_languagesWithIdioms[] = [
    {
      languageKey: "all",
      languageName: "All",
      languageNativeName: "All",
      __typename: "Language"
    }
  ];
  let langs: GetLanguagesWithIdioms_languagesWithIdioms[] = defaultLangs;
  if (loadLangs) {
    langs = langs.concat(loadLangs);
  }

  let defaultValue: string = getLanguageName(props.language) || "English";

  let selectAfter: JSX.Element = (
    <Select
      defaultValue={defaultValue}
      value={props.language ? props.language : defaultValue}
      className="languageSelect"
      dropdownClassName="languageOptionContainer"
      onChange={props.onLanguageChange}
    >
      {langs.map(lang => {
        return (
          <Option
            key={lang.languageKey}
            value={lang.languageKey}
            title={lang.languageNativeName}
            className="languageOption"
          >
            {lang.languageName}
          </Option>
        );
      })}
    </Select>
  );

  return (
    <Search
      defaultValue={props.filter || undefined}
      className="idiomSearchBox"
      placeholder="Find an idiom"
      size="large"
      enterButton
      addonAfter={selectAfter}
      onSearch={props.onSearch}
    />
  );
}
