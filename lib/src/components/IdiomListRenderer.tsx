import * as React from "react";
import { FullIdiomEntry, MinimalIdiomEntry } from "../__generated__/types";
import "./IdiomListRenderer.scss";
import { List } from "antd";
import { Link } from "react-router-dom";
import { LanguageFlags } from "../components/LanguageFlags";

export interface IdiomListRendererProps {
  idioms: (FullIdiomEntry | MinimalIdiomEntry)[];
  onPageChange?: (page: number, size?: number) => void;
  pageNumber?: number;
  pageSize: number;
  totalCount: number;
  className?: string;
}

export const IdiomListRenderer: React.StatelessComponent<IdiomListRendererProps> = props => {
  return (
    <List
      className={"idiomListRenderer " + props.className}
      itemLayout="horizontal"
      size="large"
      pagination={{
        defaultCurrent: props.pageNumber,
        onChange: props.onPageChange,
        pageSize: props.pageSize,
        hideOnSinglePage: true,
        total: props.totalCount
      }}
      dataSource={props.idioms}
      renderItem={renderIdiomListItem}
    />
  );
};

function isFullIdiom(
  item: FullIdiomEntry | MinimalIdiomEntry
): item is FullIdiomEntry {
  return (item as FullIdiomEntry).equivalents !== undefined;
}

const renderIdiomListItem = (item: FullIdiomEntry | MinimalIdiomEntry) => {
  const idiom = item;
  let equivalentsCount = 0;
  if (isFullIdiom(idiom)) {
    equivalentsCount = idiom.equivalents.length;
  }

  const flagElement = (
    <LanguageFlags
      languageInfo={idiom.language}
      showLabel={true}
      size="small"
      layoutMode="horizontal"
      compactMode
    />
  );

  let equivalentIdiomContent: React.ReactNode;
  if (equivalentsCount === 1) {
    equivalentIdiomContent = `1 equivalent idiom`;
  } else if (equivalentsCount > 1) {
    equivalentIdiomContent = `${equivalentsCount} equivalent idioms`;
  }
  equivalentIdiomContent = (
    <div className="equivalentCount">{equivalentIdiomContent}</div>
  );

  return (
    <List.Item key={idiom.slug} className="idiomListItem">
      <List.Item.Meta
        className="idiomListDetails"
        title={
          <div>
            <div className="itemHeader">
              {flagElement}
              {equivalentIdiomContent}
            </div>

            <Link className="idiomListTitle" to={`/idioms/${idiom.slug}`}>
              {idiom.title}
            </Link>
          </div>
        }
        description={<div>{idiom.literalTranslation}</div>}
      />
    </List.Item>
  );
};
