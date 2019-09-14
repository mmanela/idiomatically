import * as React from "react";
import { Select, Spin } from "antd";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import {
  GetCountriesQuery,
  GetCountriesQueryVariables
} from "../__generated__/types";
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

export class CountriesQuery extends Query<
  GetCountriesQuery,
  GetCountriesQueryVariables
> {}

export interface CountrySelectProps {
  initialValue?: string[];
  languageKey?: string;
  onChange?: (
    value: string[],
    option: React.ReactElement<any> | React.ReactElement<any>[]
  ) => void;
}

export const CountrySelect: React.StatelessComponent<
  CountrySelectProps
> = React.forwardRef<{}, CountrySelectProps>((props, ref) => {
  return (
    <CountriesQuery
      query={getCountriesQuery}
      variables={{ languageKey: props.languageKey }}
    >
      {({ loading, data, error }) => {
        if (loading) return <Spin delay={250} />;

        const options = buildOptions(data!);
        return (
          <Select
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
      }}
    </CountriesQuery>
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
