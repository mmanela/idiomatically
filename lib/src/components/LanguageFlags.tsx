import * as React from "react";
import { parse as emoji } from "twemoji-parser";
import { Tooltip, Avatar } from "antd";
import "./LanguageFlags.scss";
import { FullIdiomEntry_language, FullIdiomEntry_language_countries } from "../__generated__/types";

type FlagSize = "small" | "default" | "large";
export interface FlagCountry {
  name: string;
  flag: string;
}
export interface LanguageFlagsProps {
  languageInfo: FullIdiomEntry_language;
  /**
   * Small - 24px
   * Default - 32px
   * Large - 40px
   */
  size?: FlagSize;
  showLabel?: boolean;
  layoutMode?: "horizontal" | "vertical";
  compactMode?: boolean;
  hideFlags?: boolean;
}

export const LanguageFlags: React.StatelessComponent<LanguageFlagsProps> = props => {
  const languageLabel = `${props.languageInfo.languageName}`;
  const layoutMode = props.layoutMode || "horizontal";
  const size = props.size || "default";

  return (
    <div className={["flagAvatarContainer", layoutMode, size].join(" ")}>
      {props.showLabel && <div className="flagAfterText">{languageLabel}</div>}
      {!props.hideFlags && renderFlag(props.languageInfo.countries, size, props.compactMode)}
    </div>
  );
};

const renderFlag = (countries: FullIdiomEntry_language_countries[], size?: FlagSize, compactMode?: boolean) => {
  if (compactMode) {
    // Just pick first country for now, in the future we may want some idea
    // of default country that best represents the idiom
    const country = countries[0];
    return (
      <div className="flagsGroup">
        {getCountryFlag(country, size)}
        {countries.length > 1 && (
          <Tooltip
            className="flagOverflow"
            placement="top"
            title={<div className="flagOverflowTooltip">{renderFlagList(countries.slice(1), size)}</div>}
            arrowPointAtCenter
          >
            <span className="flagOverflowText">+{countries.length - 1}</span>
          </Tooltip>
        )}
      </div>
    );
  } else {
    return <div className="flagsGroup">{renderFlagList(countries, size)}</div>;
  }
};

const renderFlagList = (countries: FullIdiomEntry_language_countries[], size?: FlagSize) => (
  <div className="flagList">{countries.map(f => getCountryFlag(f, size))}</div>
);

const getCountryFlag = (country: FullIdiomEntry_language_countries, size?: FlagSize) => {
  const emojiResults = emoji(country.emojiFlag);
  const flagEmoji = emojiResults ? emojiResults[0].url : undefined;

  return (
    <Tooltip className="flagImage" placement="top" title={country.countryName} key={country.countryKey} arrowPointAtCenter>
      <Avatar src={flagEmoji} size={size} />
    </Tooltip>
  );
};
