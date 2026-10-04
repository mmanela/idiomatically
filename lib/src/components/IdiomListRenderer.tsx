import * as React from "react";
import "./IdiomListRenderer.scss";
import { List } from "antd";
import { Link } from "react-router";
import { LanguageFlags } from "../components/LanguageFlags";
import { ListSize } from "antd/lib/list";

export interface IdiomListItem {
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: {
    languageKey: string;
    languageName: string;
    countries: Array<{
      countryKey: string;
      countryName: string;
      emojiFlag: string;
    }>;
  };
  equivalentCount?: number;
  equivalents?: ReadonlyArray<unknown>;
}

export interface IdiomListRendererProps {
  showSplit?: boolean;
  listSize?: ListSize;
  paginationSize?: "small" | "default";
  idioms: IdiomListItem[];
  onPageChange?: (page: number, size?: number) => void;
  pageNumber?: number;
  pageSize: number;
  totalCount: number;
  className?: string;
  renderIdiomListItem?: (
    item: IdiomListItem
  ) => React.ReactNode;
}

export const IdiomListRenderer: React.FunctionComponent<IdiomListRendererProps> = props => {
  return (
    <List
      className={"idiomListRenderer " + props.className}
      itemLayout="horizontal"
      size={props.listSize || "large"}
      split={props.showSplit !== undefined ? props.showSplit : true}
      pagination={{
        defaultCurrent: props.pageNumber,
        onChange: props.onPageChange,
        pageSize: props.pageSize,
        hideOnSinglePage: true,
        total: props.totalCount,
        showSizeChanger: false,
        size: props.paginationSize === "small" ? "small" : undefined
      }}
      dataSource={props.idioms}
      renderItem={item =>
        props.renderIdiomListItem
          ? props.renderIdiomListItem(item)
          : renderIdiomListItem(item)
      }
    />
  );
};

function isFullIdiom(
  item: IdiomListItem
): item is IdiomListItem & { equivalents: ReadonlyArray<unknown> } {
  return item.equivalents !== undefined;
}

interface IdiomListItemRenderingOptions {
  includeLiteralTranslation?: boolean;
}
export const renderIdiomListItem = (
  item: IdiomListItem,
  actions?: React.ReactNode[],
  options?: IdiomListItemRenderingOptions
) => {
  const idiom = item;
  let equivalentsCount = 0;
  if (idiom.equivalentCount !== undefined) {
    equivalentsCount = idiom.equivalentCount;
  } else if (isFullIdiom(idiom)) {
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

  const includeLiteralTranslation =
    !options || options?.includeLiteralTranslation !== false;

  return (
    <List.Item key={idiom.slug} className="idiomListItem" actions={actions}>
      <div className="idiomListDetails">
        <div className="itemHeader">
          {flagElement}
          {equivalentIdiomContent}
        </div>

        <h3 className="idiomListHeading">
          <Link
            className="idiomListTitle"
            to={`/idioms/${idiom.slug}`}
            lang={idiom.language.languageKey}
            dir="auto"
          >
            {idiom.title}
          </Link>
        </h3>
        {includeLiteralTranslation && idiom.literalTranslation && (
          <div className="idiomListDescription">
            {idiom.literalTranslation}
          </div>
        )}
      </div>
    </List.Item>
  );
};
