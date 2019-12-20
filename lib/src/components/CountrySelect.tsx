import * as React from "react";
import { Select } from "antd";
import gql from "graphql-tag";
import {
  GetCountriesQuery,
  GetCountriesQueryVariables
} from "../__generated__/types";
import { useQuery } from "@apollo/react-hooks";
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
    value: string[],
    option: React.ReactElement<any> | React.ReactElement<any>[]
  ) => void;
}

export const CountrySelect: React.StatelessComponent<CountrySelectProps> = React.forwardRef<
  {},
  CountrySelectProps
>((props, ref) => {
  const { data, loading } = useQuery<
    GetCountriesQuery,
    GetCountriesQueryVariables
  >(getCountriesQuery, { variables: { languageKey: props.languageKey } });

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
});
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
