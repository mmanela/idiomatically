import * as React from "react";
import "./Idiom.scss";
import { LanguageFlags } from "../components/LanguageFlags";
import { Typography, Alert, Spin, Button, PageHeader } from "antd";
import { RouteChildrenProps } from "react-router";
import { History } from "history";
import { getIdiomQuery } from "../fragments/getIdiom";
import { GetIdiomQuery, GetIdiomQueryVariables } from "../__generated__/types";
import { Query } from "@apollo/react-components";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../components/withCurrentUser";
const { Title, Paragraph } = Typography;

export interface IdiomProps {
  slug: string;
}
type IdiomCombinedProps = RouteChildrenProps<any> & IdiomProps;

export const Idiom: React.StatelessComponent<IdiomCombinedProps> = props => {
  const { slug } = props;

  const { currentUser, currentUserLoading } = useCurrentUser();
  const showEdit = currentUser && !currentUserLoading;

  return (
    <Query<GetIdiomQuery, GetIdiomQueryVariables>
      query={getIdiomQuery}
      variables={{ slug }}
    >
      {({ loading, data, error }) => {
        if (loading)
          return (
            <Spin delay={500} className="middleSpinner" tip="Loading..." />
          );
        if (error)
          return (
            <Alert message="Error" type="error" description={error} showIcon />
          );
        if (!data || !data.idiom)
          return (
            <Alert
              message="Oops!"
              description="It looks like you went barking up the wrong tree."
              type="warning"
              showIcon
            />
          );

        const { idiom } = data;
        const buttons = showEdit
          ? [
              <Button
                key="1"
                type="default"
                onClick={() => {
                  props.history.push("/idioms/" + idiom.slug + "/update");
                }}
              >
                Edit
              </Button>
            ]
          : [];

        return (
          <article className="idiom">
            <PageHeader
              title={
                <Title level={3} copyable>
                  {idiom.title}
                </Title>
              }
              className="page-header"
              extra={buttons}
            >
              <LanguageFlags
                languageInfo={idiom.language}
                size="large"
                showLabel
              />
              {idiom.transliteration && (
                <>
                  <Title level={4}>Pronunciation</Title>
                  <Paragraph className="content">
                    {idiom.transliteration}
                  </Paragraph>
                </>
              )}

              {idiom.literalTranslation && (
                <>
                  <Title level={4}>Literal Translation </Title>
                  <Paragraph className="content">
                    {idiom.literalTranslation}
                  </Paragraph>
                </>
              )}

              {idiom.description && (
                <>
                  <Title level={4}>Description</Title>
                  <Paragraph className="content">{idiom.description}</Paragraph>
                </>
              )}

              <Title level={4}>Equivalents</Title>
              <Paragraph className="info">
                This is how you express this idiom across languages and locales.
              </Paragraph>
              <ul className="equivilentList">
                {idiom.equivalents.length > 0 &&
                  idiom.equivalents.map(x => (
                    <li key={x.slug}>
                      <div className="equivilentItem">
                        <LanguageFlags
                          languageInfo={x.language}
                          compactMode={true}
                          size={"small"}
                          layoutMode={"horizontal"}
                        />
                        <Link to={"/idioms/" + x.slug}>{x.title}</Link>
                      </div>
                    </li>
                  ))}
              </ul>
              {idiom.equivalents.length <= 0 && (
                <>
                  <Paragraph className="content">
                    No equivilent idioms across languages found yet...
                  </Paragraph>
                </>
              )}
              <Paragraph className="content addEquivalent">
                <Button
                  type="link"
                  icon="plus-circle"
                  onClick={e =>
                    handleAddEquivilentClick(e, data.idiom!.id, props.history)
                  }
                >
                  Add an equivilent idiom
                </Button>
              </Paragraph>
            </PageHeader>
          </article>
        );
      }}
    </Query>
  );
};

const handleAddEquivilentClick = (
  e: React.MouseEvent<any, any>,
  idiomId: string,
  history: History
) => {
  history.push(`/new?equivilentIdiomId=${idiomId}`);
};
