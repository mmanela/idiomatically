import * as React from "react";
import "./Idiom.scss";
import { LanguageFlags } from "../components/LanguageFlags";
import { RouteChildrenProps, Redirect } from "react-router";
import { getIdiomQuery } from "../fragments/getIdiom";
import {
  GetIdiomQuery,
  GetIdiomQueryVariables,
  UserRole,
  DeleteIdiomMutation,
  DeleteIdiomMutationVariables,
  OperationStatus
} from "../__generated__/types";
import { useCurrentUser } from "../components/withCurrentUser";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useState, Suspense, useEffect } from "react";
import marked from "marked";
import dompurifyFactory from "dompurify";
import { AddEquivalentSection } from "../components/AddEquivalentSection";
import { EquivalentIdiomList } from "../components/EquivalentIdiomList";
import { DeleteFilled } from '@ant-design/icons';
import { Typography, Alert, Spin, Button, PageHeader, Tabs } from "antd";
import screenfull from 'screenfull';
import Fullscreen from "react-full-screen";
const WorldMap = React.lazy(() => import('../components/WorldIdiomMap'));
const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

export const deleteIdiomQuery = gql`
  mutation DeleteIdiomMutation($id: ID!) {
    deleteIdiom(idiomId: $id) {
      status
      message
    }
  }
`;

enum DeleteActionState {
  None,
  Proposed
}

export interface IdiomProps {
  slug: string;
}
type IdiomCombinedProps = RouteChildrenProps<any> & IdiomProps;


export const Idiom: React.FunctionComponent<IdiomCombinedProps> = props => {
  const { slug } = props;
  const [equivalentTab, setEquivalentTab] = useState<string>("List");
  const [isMapFullscreen, setMapFullscreen] = useState(false);
  const { currentUser, currentUserLoading } = useCurrentUser();
  const [deleteConfirmation, setDeleteConfirmation] = useState(DeleteActionState.None);
  const showEdit = currentUser && !currentUserLoading;
  const showDelete = currentUser && !currentUserLoading && currentUser.role === UserRole.ADMIN;

  const { loading, data, error } = useQuery<GetIdiomQuery, GetIdiomQueryVariables>(getIdiomQuery, {
    variables: { slug: slug }
  });

  const [deleteIdiom, deleteStatusInfo] = useMutation<DeleteIdiomMutation, DeleteIdiomMutationVariables>(deleteIdiomQuery);

  const idiomTitle = data?.idiom?.title;
  useEffect(() => {
    if (window.document && window.document.title) {
      if (idiomTitle) {
        window.document.title = `Idiomatically - ${idiomTitle}`;
      }
      else {
        window.document.title = `Idiomatically`;
      }
    }
  }, [idiomTitle]);

  if (deleteStatusInfo.data && deleteStatusInfo.data.deleteIdiom.status === OperationStatus.SUCCESS) {
    return <Redirect to="/" />;
  }

  if (loading) return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
  if (error) return <Alert message="Error" type="error" description={error} showIcon />;
  if (!data || !data.idiom)
    return <Alert message="Oops!" description="It looks like you went barking up the wrong tree." type="warning" showIcon />;

  const { idiom } = data;

  let renderedDescription = idiom.description;
  if (idiom && idiom.description) {
    const dompurify = dompurifyFactory(window);
    renderedDescription = dompurify.sanitize(marked(idiom.description));
  }

  const buttons = [
    showDelete && (
      <Button
        key="2"
        className="deleteIdiomButton"
        type="default"
        onClick={() => {
          if (deleteConfirmation === DeleteActionState.Proposed) {
            deleteIdiom({ variables: { id: idiom.id } });
          } else if (deleteConfirmation === DeleteActionState.None) {
            setDeleteConfirmation(DeleteActionState.Proposed);
          }
        }}
      >
        {deleteConfirmation === DeleteActionState.Proposed ? "Are you sure?" : <DeleteFilled />}
      </Button>
    )
  ];
  const editConfig = {
    onStart: () => {
      props.history.push("/idioms/" + idiom.slug + "/update");
    }
  };
  const onFullScreenClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (screenfull.isEnabled && equivalentTab === "Map") {
      setMapFullscreen(true);
    }
  }

  const fullScreenMapButton = screenfull.isEnabled && equivalentTab === "Map" ? <Button onClick={onFullScreenClick}>View Fullscreen</Button> : null;
  const onTabChange = (key: string): void => {
    return setEquivalentTab(key);
  }
  return (
    <article className="idiom">
      <PageHeader
        title={
          <Title className="idiomTitle" level={3} editable={showEdit ? editConfig : false}>
            {idiom.title}
          </Title>
        }
        className="page-header"
        extra={buttons}
      >
        <LanguageFlags languageInfo={idiom.language} size="large" showLabel />
        {idiom.transliteration && (
          <>
            <Title level={4}>Pronunciation</Title>
            <Paragraph className="content">{idiom.transliteration}</Paragraph>
          </>
        )}

        {idiom.literalTranslation && (
          <>
            <Title level={4}>Literal Translation </Title>
            <Paragraph className="content">{idiom.literalTranslation}</Paragraph>
          </>
        )}

        {renderedDescription && (
          <>
            <Title level={4}>Description</Title>
            <Paragraph className="content description">
              <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedDescription }}></div>
            </Paragraph>
          </>
        )}

        <Title level={4}>Equivalents</Title>
        <Paragraph className="info">This is how you express this idiom across languages and locales.</Paragraph>
        <Tabs animated={false} tabBarExtraContent={fullScreenMapButton} onChange={onTabChange}>
          <TabPane key="List" tab="List">
            <EquivalentIdiomList idiom={idiom} user={currentUser} />
          </TabPane>
          <TabPane key="Map" tab="Map" className="worldMapPanel">
            <Suspense fallback={<Spin delay={150} className="middleSpinner" tip="Loading..." />}>
              <Fullscreen
                enabled={isMapFullscreen}
                onChange={isFull => setMapFullscreen(isFull)}
              >
                <WorldMap idiom={idiom} />
              </Fullscreen>
            </Suspense>
          </TabPane>
        </Tabs>
        <AddEquivalentSection idiom={idiom} user={currentUser} history={props.history} />
      </PageHeader>
    </article>

  );
};
