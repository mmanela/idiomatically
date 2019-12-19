import * as React from "react";
import * as H from "history";
import "./SearchBox.scss";
import { Input, Select } from "antd";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
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
  history: H.History;
  filter: string | null;
  language: string | null;
}

export function SearchBox(props: SearchBoxProps) {
  const { data, loading } = useQuery<GetLanguagesWithIdioms>(
    getLanguagesWithIdiomsQuery
  );

  const onSearch = (value: string) => {
    let search = `?q=${value}`;
    if (props.language) {
      search += `&lang=${props.language}`;
    }
    props.history.push({ pathname: "/idioms", search: search });
  };

  const onLanguageChange = (value: string) => {
    let search = `?`;
    if (props.filter) {
      search += `q=${props.filter}`;
      search += `&lang=${value}`;
    } else {
      search += `lang=${value}`;
    }
    props.history.push({ pathname: "/idioms", search: search });
  };

  const loadLangs = !loading && data && data.languagesWithIdioms;
  const defaultLangs: GetLanguagesWithIdioms_languagesWithIdioms[] = [
    {
      languageKey: "",
      languageName: "All",
      languageNativeName: "All",
      __typename: "Language"
    }
  ];
  let langs: GetLanguagesWithIdioms_languagesWithIdioms[] = defaultLangs;
  if (loadLangs) {
    langs = langs.concat(loadLangs);
  }

  let defaultValue: string = getLanguageName(props.language) || "All";

  let selectAfter: JSX.Element = (
    <Select
      defaultValue={defaultValue}
      className="languageSelect"
      dropdownClassName="languageOptionContainer"
      onChange={onLanguageChange}
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
      onSearch={onSearch}
    />
  );
}
