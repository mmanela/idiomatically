import * as React from "react";
import "./Idiom.scss";
import { LanguageFlags } from "../components/LanguageFlags";
import { Navigate, useNavigate } from "react-router";
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
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState, Suspense, useEffect } from "react";
import { AddEquivalentSection } from "../components/AddEquivalentSection";
import { EquivalentIdiomList } from "../components/EquivalentIdiomList";
import { MarkdownContent } from "../components/MarkdownContent";
import { DeleteFilled } from '@ant-design/icons';
import { Typography, Alert, Spin, Button, Tabs } from "antd";
import screenfull from 'screenfull';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { DEFAULT_PAGE_TITLE } from "../constants";
const WorldMap = React.lazy(() => import('../components/WorldIdiomMap'));
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
  initialData: GetIdiomQuery;
}
export const Idiom: React.FunctionComponent<IdiomProps> = props => {
  const { slug } = props;
  const navigate = useNavigate();
  const [equivalentTab, setEquivalentTab] = useState<string>("List");
  const mapFullScreen = useFullScreenHandle();
  const { currentUser, currentUserLoading } = useCurrentUser();
  const [deleteConfirmation, setDeleteConfirmation] = useState(DeleteActionState.None);
  const showEdit = currentUser && !currentUserLoading;
  const showDelete = currentUser && !currentUserLoading && currentUser.role === UserRole.ADMIN;

  const data = props.initialData;

  const [deleteIdiom, deleteStatusInfo] = useMutation<DeleteIdiomMutation, DeleteIdiomMutationVariables>(deleteIdiomQuery);

  const idiomTitle = data?.idiom?.title;
  useEffect(() => {
    if (window.document && window.document.title) {
      if (idiomTitle) {
        window.document.title = `${idiomTitle} - ${DEFAULT_PAGE_TITLE}`;
      }
      else {
        window.document.title = DEFAULT_PAGE_TITLE;
      }
    }
  }, [idiomTitle]);

  if (deleteStatusInfo.data && deleteStatusInfo.data.deleteIdiom.status === OperationStatus.SUCCESS) {
    return <Navigate to="/" replace />;
  }

  if (!data.idiom)
    return <Alert title="Oops!" description="It looks like you went barking up the wrong tree." type="warning" showIcon />;

  const { idiom } = data;

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
    editing: false,
    onStart: () => {
      navigate("/idioms/" + idiom.slug + "/update");
    }
  };
  const onFullScreenClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (screenfull.isEnabled && equivalentTab === "Map") {
      mapFullScreen.enter();
    }
  }

  const fullScreenMapButton = screenfull.isEnabled && equivalentTab === "Map" ? <Button onClick={onFullScreenClick}>View Fullscreen</Button> : null;
  const onTabChange = (key: string): void => {
    return setEquivalentTab(key);
  }
  return (
    <article className="idiom">
      <div className="page-header">
        <div className="page-header-title">
          <Title
            className="idiomTitle"
            level={1}
            editable={showEdit ? editConfig : false}
            lang={idiom.language.languageKey}
            dir="auto"
          >
            {idiom.title}
          </Title>
          <div className="page-header-actions">{buttons}</div>
        </div>
        <LanguageFlags languageInfo={idiom.language} size="large" showLabel />
        {idiom.transliteration && (
          <>
            <Title level={2}>Pronunciation</Title>
            <Paragraph className="content">{idiom.transliteration}</Paragraph>
          </>
        )}

        {idiom.literalTranslation && (
          <>
            <Title level={2}>Literal Translation </Title>
            <Paragraph className="content">{idiom.literalTranslation}</Paragraph>
          </>
        )}

        {idiom.description && (
          <>
            <Title level={2}>Meaning</Title>
            <Paragraph className="content description">
              <MarkdownContent
                className="markdown"
                source={idiom.description}
              />
            </Paragraph>
          </>
        )}

        <section className="equivalentIdiomsSection" aria-labelledby="equivalent-idioms-title">
          <header className="equivalentIdiomsHeader">
            <Title id="equivalent-idioms-title" className="equivalentIdiomsTitle" level={2}>
              Equivalent idioms in other languages
            </Title>
            <Paragraph className="info equivalentIdiomsDescription">
              This is how you express this idiom across languages and locales.
            </Paragraph>
          </header>
          <Tabs
            className="equivalentIdiomsTabs"
            animated={false}
            tabBarExtraContent={fullScreenMapButton}
            onChange={onTabChange}
            items={[
              {
                key: "List",
                label: "List",
                children: <EquivalentIdiomList idiom={idiom} user={currentUser} />,
              },
              {
                key: "Map",
                label: "Map",
                className: "worldMapPanel",
                children: (
                  <Suspense fallback={<Spin delay={150} className="middleSpinner" description="Loading..." />}>
                    <FullScreen handle={mapFullScreen}>
                      <WorldMap idiom={idiom} />
                    </FullScreen>
                  </Suspense>
                ),
              },
            ]}
          />
          <AddEquivalentSection idiom={idiom} user={currentUser} navigate={navigate} />
        </section>
      </div>
    </article>

  );
};
