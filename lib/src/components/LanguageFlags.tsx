import * as React from "react";
import { Tooltip } from "antd";
import "./LanguageFlags.scss";
import { FullIdiomEntry_language, FullIdiomEntry_language_countries } from "../__generated__/types";
import { CountryFlag, FlagSize } from "./CountryFlag";

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
    countries = countries.sort((a, b) => {
      if (a.countryKey === 'US') {
        return -1;
      }
      else if (b.countryKey === 'US') {
        return 1;
      }

      return a.countryName.localeCompare(b.countryName);
    }
    );
    const country = countries[0];
    return (
      <div className="flagsGroup">
        <CountryFlag country={country} size={size} />
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
  <div className="flagList">{countries.map(f => <CountryFlag key={f.countryKey} country={f} size={size} />)}</div>
);