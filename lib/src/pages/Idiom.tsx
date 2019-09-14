import * as React from "react";
import "./Idiom.scss";
import { LanguageFlags } from "../components/LanguageFlags";
import { Typography, Alert, Spin, Button } from "antd";
import { WithCurrentUserProps } from "../components/withCurrentUser";
import { RouteChildrenProps } from "react-router";
import { History } from "history";
import { IdiomQuery, getIdiomQuery } from "../fragments/getIdiom";
const { Title, Paragraph } = Typography;

export interface IdiomProps {
  slug: string;
}
type IdiomCombinedProps = RouteChildrenProps<any> &
  WithCurrentUserProps<IdiomProps>;

export const Idiom: React.StatelessComponent<IdiomCombinedProps> = props => {
  const { slug } = props;

  return (
    <IdiomQuery query={getIdiomQuery} variables={{ slug }}>
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
        return (
          <article className="idiom">
            <Title level={3} copyable>
              {idiom.title}
            </Title>
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
            {idiom.equivalents.length > 0 &&
              idiom.equivalents.map(x => <li>{x.title}</li>)}
            {idiom.equivalents.length <= 0 && (
              <>
                <Paragraph className="content">
                  No equivilent idioms across languages found yet...
                </Paragraph>
              </>
            )}
            <Paragraph className="content">
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
          </article>
        );
      }}
    </IdiomQuery>
  );
};

const handleAddEquivilentClick = (
  e: React.MouseEvent<any, any>,
  idiomId: string,
  history: History
) => {
  history.push(`/new?equivilentIdiomId=${idiomId}`);
};
