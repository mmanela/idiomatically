import * as React from "react";
import { Select } from "antd";
import { GetLanguagesQuery } from "../__generated__/types";
import { useLazyQuery, gql } from "@apollo/client";
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
    value: string
  ) => void;

  readOnly?: boolean;

  readOnlyText?: string;
}

export const LanguageSelect: React.FunctionComponent<LanguageSelectProps> = (props) => {
  const [getLanguages, getLanguagesLoadResult] = useLazyQuery<GetLanguagesQuery>(
    getLanguagesQuery
  );

  const called = getLanguagesLoadResult && getLanguagesLoadResult.called;
  const data = getLanguagesLoadResult && getLanguagesLoadResult.data;
  const loading = getLanguagesLoadResult && getLanguagesLoadResult.loading;
  if ((!called
    && !loading)) {
    getLanguages();
  }


  const options = data ? buildOptions(data!) : undefined;
  if (props.readOnly) {
    return <span className="ant-form-text">{props.readOnlyText}</span>;
  }

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
};
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
