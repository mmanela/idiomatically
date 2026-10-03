import * as React from "react";
import { GetIdiomListQueryVariables } from "../__generated__/types";
import "./IdiomListView.scss";
import { Empty, Typography } from "antd";
import { gql } from "@apollo/client";
import { IdiomListRenderer } from "../components/IdiomListRenderer";
import type { IdiomListData } from "../loaders/idioms.server";
import { Link, useLocation } from "react-router";
import { IDIOM_PAGE_SIZE } from "../constants";
import type { FeaturedIdiom as FeaturedIdiomData } from "../loaders/featuredIdiom.server";
import { FeaturedIdiom } from "../components/FeaturedIdiom";
const { Paragraph, Title } = Typography;

export const getIdiomListQuery = gql`
  query GetIdiomListQuery(
    $filter: String
    $locale: String
    $limit: Int
    $cursor: String
  ) {
    idioms(filter: $filter, locale: $locale, limit: $limit, cursor: $cursor) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          slug
          title
          literalTranslation
          transliteration
          language {
            languageKey
            languageName
            countries {
              countryKey
              countryName
              emojiFlag
            }
          }
          equivalentCount
        }
      }
    }
  }
`;

export interface IdiomListViewProps {
  initialData: IdiomListData;
  filter: string | null;
  language: string | null;
  page: string | null;
  heading?: string;
  introduction?: string;
  featuredIdiom?: FeaturedIdiomData | null;
  onPageChange: (value: string) => void;
}

function normalizePage(page: string | null) {
  if (!page) {
    return 1;
  }

  const num = parseInt(page);
  if (isNaN(num)) {
    return 1;
  }

  return num;
}

export const IdiomListView: React.FunctionComponent<IdiomListViewProps> = props => {
  const location = useLocation();
  const pageNumber = normalizePage(props.page);
  if (props.initialData.idioms.edges.length <= 0) {
    return (
      <section className="idiomDirectory">
        {props.heading && <Title level={1}>{props.heading}</Title>}
        <Empty
          image={Empty.PRESENTED_IMAGE_DEFAULT}
          description="Could not find a needle in a haystack."
        />
      </section>
    );
  }

  const idioms = props.initialData.idioms.edges.map(x => x.node);
  const pageCount = Math.ceil(
    props.initialData.idioms.totalCount / IDIOM_PAGE_SIZE,
  );
  const pageHref = (page: number) => {
    const searchParams = new URLSearchParams(location.search);
    if (page <= 1) {
      searchParams.delete("page");
    } else {
      searchParams.set("page", String(page));
    }
    const search = searchParams.toString();
    return `${location.pathname}${search ? `?${search}` : ""}`;
  };

  return (
    <section className="idiomDirectory">
      {(props.heading || props.introduction) && (
        <header className="idiomDirectoryHeader">
          {props.heading && <Title level={1}>{props.heading}</Title>}
          {props.introduction && <Paragraph>{props.introduction}</Paragraph>}
        </header>
      )}
      {props.featuredIdiom && <FeaturedIdiom idiom={props.featuredIdiom} />}
      <IdiomListRenderer
        className="idiomListView"
        pageSize={IDIOM_PAGE_SIZE}
        totalCount={props.initialData.idioms.totalCount}
        idioms={idioms}
        pageNumber={pageNumber}
        onPageChange={(page: number) => {
          props.onPageChange(String(page));
        }}
      />
      {pageCount > 1 && (
        <nav className="crawlablePagination" aria-label="Idiom list pages">
          {pageNumber > 1 && (
            <Link rel="prev" to={pageHref(pageNumber - 1)}>
              Previous page
            </Link>
          )}
          <span>
            Page {pageNumber} of {pageCount}
          </span>
          {pageNumber < pageCount && (
            <Link rel="next" to={pageHref(pageNumber + 1)}>
              Next page
            </Link>
          )}
        </nav>
      )}
    </section>
  );
};
