import * as React from "react";
import {
  GetIdiomListQuery,
  GetIdiomListQueryVariables,
  GetIdiomListQuery_idioms_edges
} from "../__generated__/types";
import { Query } from "@apollo/react-components";
import gql from "graphql-tag";
import "./IdiomListView.scss";
import { Alert, Spin, List, Empty } from "antd";
import { Link } from "react-router-dom";
import { LanguageFlags } from "../components/LanguageFlags";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";

export const getIdiomListQuery = gql`
  query GetIdiomListQuery($filter: String, $locale: String) {
    idioms(filter: $filter, locale: $locale) {
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

export const IdiomListView: React.StatelessComponent<
  IdiomListViewProps
> = props => {
  const { filter } = props;

  return (
    <Query<
    GetIdiomListQuery,
    GetIdiomListQueryVariables
  > query={getIdiomListQuery} variables={{ filter }}>
      {({ loading, data, error }) => {
        if (loading)
          return (
            <Spin delay={500} className="middleSpinner" tip="Loading..." />
          );
        if (error)
          return (
            <Alert message="Error" type="error" description={error.message} showIcon />
          );
        if (!data || data.idioms.edges.length <= 0) {
          return (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="You looked for a needle in a haystack and didn't find it"
            />
          );
        }

        return (
          <List
            className="idiomListView"
            itemLayout="horizontal"
            size="large"
            pagination={{
              onChange: page => {
                console.log(page);
              },
              pageSize: 10,
              hideOnSinglePage: true
            }}
            dataSource={data.idioms.edges}
            renderItem={renderIdiomListItem}
          />
        );
      }}
    </Query>
  );
};

const renderIdiomListItem = (item: GetIdiomListQuery_idioms_edges) => {
  const idiom = item.node,
    equivalentsCount = item.node.equivalents.length;
  const flagElement = (
    <LanguageFlags
      languageInfo={idiom.language}
      showLabel={true}
      layoutMode="vertical"
      smallMode
    />
  );

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
