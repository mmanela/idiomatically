import * as React from "react";
import { GetIdiomListQuery, GetIdiomListQueryVariables, GetIdiomListQuery_idioms_edges } from "../__generated__/types";
import gql from "graphql-tag";
import "./IdiomListView.scss";
import { Alert, Spin, List, Empty } from "antd";
import { Link } from "react-router-dom";
import { LanguageFlags } from "../components/LanguageFlags";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { useLazyQuery } from "@apollo/react-hooks";

export const getIdiomListQuery = gql`
  query GetIdiomListQuery($filter: String, $locale: String, $limit: Int, $cursor: String) {
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
}

export const IdiomListView: React.StatelessComponent<IdiomListViewProps> = props => {
  const { filter } = props;
  const [pageNumber, setPageNumber] = React.useState(1);
  const [queryPage, loadResult] = useLazyQuery<GetIdiomListQuery, GetIdiomListQueryVariables>(getIdiomListQuery);
  const pageSize = 10;

  // Based on the page number we get from state we calculate the bounds of the cursors
  // we then check if the data we current have has a endCursor that falls in that range. If so, 
  // we have the data for this page, no need to query. Otherwise, run the query.
  const currCursorNum = (pageNumber - 1) * pageSize;
  const nextCursorNum = pageNumber * pageSize;
  const incomingEndCursorNum = loadResult.data ? Number.parseInt(loadResult.data.idioms.pageInfo.endCursor) : 0;
  const changePage = !(currCursorNum < incomingEndCursorNum && nextCursorNum >= incomingEndCursorNum);
  if (!loadResult.called || (!loadResult.loading && loadResult.data && changePage)) {
    queryPage({
      variables: { filter, limit: pageSize, cursor: currCursorNum.toString() }
    });
  }
  if (loadResult.loading) return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
  if (loadResult.error) return <Alert message="Error" type="error" description={loadResult.error.message} showIcon />;
  if (!loadResult.data || loadResult.data.idioms.edges.length <= 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="You looked for a needle in a haystack and didn't find it" />;
  }

  return (
    <List
      className="idiomListView"
      itemLayout="horizontal"
      size="large"
      pagination={{
        defaultCurrent: pageNumber,
        onChange: (page: number, size?: number) => {
          setPageNumber(page);
        },
        pageSize: pageSize,
        hideOnSinglePage: true,
        total: loadResult.data.idioms.totalCount
      }}
      dataSource={loadResult.data.idioms.edges}
      renderItem={renderIdiomListItem}
    />
  );
};

const renderIdiomListItem = (item: GetIdiomListQuery_idioms_edges) => {
  const idiom = item.node,
    equivalentsCount = item.node.equivalents.length;
  const flagElement = <LanguageFlags languageInfo={idiom.language} showLabel={true} layoutMode="vertical" compactMode />;

  let equivalentIdiomContent = "";
  if (equivalentsCount === 1) {
    equivalentIdiomContent = `1 equivalent idiom`;
  } else if (equivalentsCount > 1) {
    equivalentIdiomContent = `${idiom.equivalents.length} equivalent idioms`;
  }

  return (
    <List.Item key={idiom.slug} extra={equivalentIdiomContent}>
      <List.Item.Meta
        className="idiomListDetails"
        title={<Link to={`/idioms/${idiom.slug}`}>{idiom.title}</Link>}
        description={<div>{idiom.literalTranslation}</div>}
        avatar={flagElement}
      />
    </List.Item>
  );
};
