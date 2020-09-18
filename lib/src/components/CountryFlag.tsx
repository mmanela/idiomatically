import * as React from "react";
import { parse as emoji } from "twemoji-parser";
import { Tooltip, Avatar } from "antd";
import "./LanguageFlags.scss";
import { FullIdiomEntry_language_countries, GetIdiomQuery_idiom_equivalents_language_countries, GetIdiomQuery_idiom_language_countries } from "../__generated__/types";

export type FlagSize = "small" | "default" | "large";

export type CountryFlagProps = {
  country: FullIdiomEntry_language_countries
  | GetIdiomQuery_idiom_equivalents_language_countries
  | GetIdiomQuery_idiom_language_countries;
  size?: FlagSize;
}

export const CountryFlag: React.StatelessComponent<CountryFlagProps> = (props) => {
  const emojiResults = emoji(props.country.emojiFlag);
  const flagEmoji = emojiResults ? emojiResults[0].url : undefined;

  return (
    <Tooltip className="flagImage" placement="top" title={props.country.countryName} key={props.country.countryKey} arrowPointAtCenter>
      <Avatar src={flagEmoji} size={props.size} alt={props.country.countryName} />
    </Tooltip>
  );
};
