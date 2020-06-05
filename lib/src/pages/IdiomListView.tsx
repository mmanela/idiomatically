import * as React from "react";
import {
  GetIdiomListQuery,
  GetIdiomListQueryVariables
} from "../__generated__/types";
import gql from "graphql-tag";
import "./IdiomListView.scss";
import { Alert, Spin, Empty } from "antd";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { useLazyQuery } from "@apollo/react-hooks";
import { IdiomListRenderer } from "../components/IdiomListRenderer";
import { useEffect } from "react";

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

export const IdiomListView: React.StatelessComponent<IdiomListViewProps> = props => {
  const { filter, language } = props;
  const pageNumber = normalizePage(props.page);
  const [lastFilter, setLastFilter] = React.useState(props.filter);
  const [lastLang, setLastLang] = React.useState(props.language);
  const [queryPage, loadResult] = useLazyQuery<
    GetIdiomListQuery,
    GetIdiomListQueryVariables
  >(getIdiomListQuery);
  const pageSize = 10;

  useEffect(() => {
    setLastFilter(props.filter);
    setLastLang(props.language);
  }, [props.filter, props.language]);

  // Based on the page number we get from state we calculate the bounds of the cursors
  // we then check if the data we current have has a endCursor that falls in that range. If so,
  // we have the data for this page, no need to query. Otherwise, run the query.
  const currCursorNum = (pageNumber - 1) * pageSize;
  const nextCursorNum = pageNumber * pageSize;
  const incomingEndCursorNum =
    loadResult.data && loadResult.data.idioms.totalCount > 0 && loadResult.data.idioms.edges.length > 0
      ? Number.parseInt(loadResult.data.idioms.pageInfo.endCursor)
      : null;
  const changePage =
    incomingEndCursorNum != null &&

    // And incomingEndCursorNum not in (currCursorNum, nextCursorNum]
    !(
      currCursorNum < incomingEndCursorNum &&
      nextCursorNum >= incomingEndCursorNum
    )
    ;
  const filterChanged =
    props.filter !== lastFilter || props.language !== lastLang;
  if (
    !loadResult.called ||
    (!loadResult.loading && loadResult.data && changePage) ||
    filterChanged
  ) {
    queryPage({
      variables: {
        filter,
        locale: language,
        limit: pageSize,
        cursor: currCursorNum.toString()
      }
    });
  }

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
