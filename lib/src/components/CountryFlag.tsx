import * as React from "react";
import { parse as emoji } from "@twemoji/parser";
import { Tooltip, Avatar } from "antd";
import "./LanguageFlags.scss";

export type FlagSize = "small" | "default" | "large";

export interface CountryFlagInfo {
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export type CountryFlagProps = {
  country: CountryFlagInfo;
  size?: FlagSize;
}

export const CountryFlag: React.FunctionComponent<CountryFlagProps> = (props) => {
  const emojiResults = emoji(props.country.emojiFlag);
  const flagEmoji = emojiResults ? emojiResults[0].url : undefined;

  return (
    <Tooltip className="flagImage" placement="top" title={props.country.countryName} key={props.country.countryKey}>
      <Avatar src={flagEmoji} size={props.size} alt={props.country.countryName} />
    </Tooltip>
  );
};
