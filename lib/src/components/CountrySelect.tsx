import * as React from "react";
import { Select } from "antd";
import {
  GetCountriesQuery,
  GetCountriesQueryVariables
} from "../__generated__/types";
import { useLazyQuery, gql } from "@apollo/client";
import { useState, useEffect } from "react";
const { Option } = Select;

export const getCountriesQuery = gql`
  query GetCountriesQuery($languageKey: String) {
    countries(languageKey: $languageKey) {
      countryKey
      countryName
      countryNativeName
    }
  }
`;

export interface CountrySelectProps {
  initialValue?: string[];
  languageKey?: string;
  onChange?: (
    value: string[]
  ) => void;
}

export const CountrySelect: React.FunctionComponent<CountrySelectProps> = (props) => {

  const [lastLanguageKey, setLastLanguageKey] = useState<(string | undefined)>(props.languageKey);
  const [getCountries, getCountriesLoadResult] = useLazyQuery<
    GetCountriesQuery,
    GetCountriesQueryVariables
  >(getCountriesQuery);

  useEffect(() => {
    setLastLanguageKey(props.languageKey);
  }, [props.languageKey]);

  const called = getCountriesLoadResult && getCountriesLoadResult.called;
  const data = getCountriesLoadResult && getCountriesLoadResult.data;
  const loading = getCountriesLoadResult && getCountriesLoadResult.loading;
  if ((!called
    && !loading)
    || (props.languageKey && lastLanguageKey !== props.languageKey)) {
    getCountries({ variables: { languageKey: props.languageKey } });
  }
  const options = data ? buildOptions(data!) : undefined;
  return (
    <Select
      loading={loading}
      defaultValue={props.initialValue}
      onChange={props.onChange}
      mode="multiple"
      placeholder={
        props.languageKey
          ? "Please select a country"
          : "You must first select a language"
      }
      disabled={!props.languageKey}
      optionFilterProp="title"
    >
      {options}
    </Select>
  );
};
function buildOptions(data: GetCountriesQuery) {
  return data.countries.map(c => {
    const key = c.countryKey;
    const display = `${c.countryName} (${c.countryNativeName})`;
    return (
      <Option key={key} value={key} title={display}>
        {display}
      </Option>
    );
  });
}
