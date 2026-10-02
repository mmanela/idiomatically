import * as React from "react";
import {
  GetIdiomListQuery,
  GetIdiomListQueryVariables
} from "../__generated__/types";
import "./IdiomListView.scss";
import { Alert, Spin, Empty } from "antd";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { useQuery, gql } from "@apollo/client";
import { IdiomListRenderer } from "../components/IdiomListRenderer";

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
          ...FullIdiomEntry
        }
      }
    }
  }
  ${FULL_IDIOM_ENTRY}
`;

export interface IdiomListViewProps {
  filter: string | null;
  language: string | null;
  page: string | null;
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
  const { filter, language } = props;
  const pageNumber = normalizePage(props.page);
  const pageSize = 10;
  const currCursorNum = (pageNumber - 1) * pageSize;
  const loadResult = useQuery<
    GetIdiomListQuery,
    GetIdiomListQueryVariables
  >(getIdiomListQuery, {
    variables: {
      filter,
      locale: language,
      limit: pageSize,
      cursor: currCursorNum.toString()
    }
  });

  if (loadResult.loading)
    return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
  if (loadResult.error)
    return (
      <Alert
        message="Error"
        type="error"
        description={loadResult.error.message}
        showIcon
      />
    );
  if (!loadResult.data || loadResult.data.idioms.edges.length <= 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_DEFAULT}
        description="Could not find a needle in a haystack."
      />
    );
  }

  const idioms = loadResult.data.idioms.edges.map(x => x.node);

  return (
    <IdiomListRenderer
      className="idiomListView"
      pageSize={pageSize}
      totalCount={loadResult.data.idioms.totalCount}
      idioms={idioms}
      pageNumber={pageNumber}
      onPageChange={(page: number, size?: number) => {
        props.onPageChange(String(page));
      }}
    />
  );
};
