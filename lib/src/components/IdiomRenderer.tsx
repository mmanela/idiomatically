import React from "react";
import { LanguageFlags } from "./LanguageFlags";
import { Link } from "react-router-dom";
import "./IdiomRenderer.scss";
import { MinimalIdiomEntry } from "../__generated__/types";

type IdiomRendererProps = {
  idiom: MinimalIdiomEntry;
  actions?: React.ReactNode;
  layoutMode?: "horizontal" | "vertical";
  hideFlags?: boolean;
  disableLink?: boolean;
};
export const IdiomRenderer = (props: IdiomRendererProps) => {
  const layoutMode = props.layoutMode || "horizontal";
  return (
    <div className="idiomRendererItemContainer">
      <div className="idiomRendererItem">
        <div className={"idiomRendererItemContent " + layoutMode}>
          <div className="idiomFlag">
            <LanguageFlags
              languageInfo={props.idiom.language}
              compactMode={true}
              showLabel={true}
              size={"small"}
              layoutMode={"horizontal"}
              hideFlags={props.hideFlags}
            />
          </div>
          <div className="idiomLink">
            {props.disableLink ? (
              <span>{props.idiom.title}</span>
            ) : (
              <Link to={"/idioms/" + props.idiom.slug}>
                {props.idiom.title}
              </Link>
            )}
          </div>
        </div>
        {props.actions && (
          <div className="idiomRendererActions">{props.actions}</div>
        )}
      </div>
    </div>
  );
};
