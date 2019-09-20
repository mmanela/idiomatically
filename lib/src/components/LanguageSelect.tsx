import * as React from "react";
import { Select, Spin } from "antd";
import gql from "graphql-tag";
import { Query } from "@apollo/react-components";
import { GetLanguagesQuery } from "../__generated__/types";
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

export const LanguageSelect: React.StatelessComponent<
  LanguageSelectProps
> = React.forwardRef<{}, LanguageSelectProps>((props, ref) => {
  return (
    <Query<GetLanguagesQuery> query={getLanguagesQuery}>
      {({ loading, data, error }) => {
        if (loading) return <Spin delay={250} />;

        const options = buildOptions(data!);
        return (
          <Select
            onChange={props.onChange}
            showSearch
            placeholder="Please select a language"
            optionFilterProp="title"
          >
            {options}
          </Select>
        );
      }}
    </Query>
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
