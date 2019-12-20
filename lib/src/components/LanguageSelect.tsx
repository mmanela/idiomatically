import * as React from "react";
import { Select } from "antd";
import gql from "graphql-tag";
import { GetLanguagesQuery } from "../__generated__/types";
import { useQuery } from "@apollo/react-hooks";
const { Option } = Select;

export const getLanguagesQuery = gql`
  query GetLanguagesQuery {
    languages {
      languageKey
      languageName
      languageNativeName
    }
  }
`;

export interface LanguageSelectProps {
  onChange?: (
    value: string,
    option: React.ReactElement<any> | React.ReactElement<any>[]
  ) => void;
}

export const LanguageSelect: React.StatelessComponent<LanguageSelectProps> = 
React.forwardRef<{},LanguageSelectProps>((props, ref) => {
  const { data, loading } = useQuery<GetLanguagesQuery>(
    getLanguagesQuery
  );

  const options = data ? buildOptions(data!) : undefined;
  return (
    <Select
      loading={loading}
      onChange={props.onChange}
      // This ensure the box opens so you can type right away
      showAction={["focus", "click"]}
      showSearch
      placeholder="Please select a language"
      optionFilterProp="title"
      showArrow={false}
    >
      {options}
    </Select>
  );
});
function buildOptions(data: GetLanguagesQuery) {
  return data.languages.map(lang => {
    const key = lang.languageKey;
    const display = `${lang.languageName} (${lang.languageNativeName})`;
    return (
      <Option key={key} value={key} title={display}>
        {display}
      </Option>
    );
  });
}
