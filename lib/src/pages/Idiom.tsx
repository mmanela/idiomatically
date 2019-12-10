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
import { useState } from "react";
import marked from "marked";
import dompurify from "dompurify";
import { AddEquivalentSection } from "../components/AddEquivalentSection";
import { EquivalentIdiomList } from "../components/EquivalentIdiomList";
import { Typography, Alert, Spin, Button, PageHeader, Icon } from "antd";
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

export const Idiom: React.StatelessComponent<IdiomCombinedProps> = props => {
  const { slug } = props;

  const { currentUser, currentUserLoading } = useCurrentUser();
  const [deleteConfirmation, setDeleteConfirmation] = useState(DeleteActionState.None);
  const showEdit = currentUser && !currentUserLoading;
  const showDelete = currentUser && !currentUserLoading && currentUser.role === UserRole.ADMIN;

  const { loading, data, error } = useQuery<GetIdiomQuery, GetIdiomQueryVariables>(getIdiomQuery, {
    variables: { slug: slug }
  });

  const [deleteIdiom, deleteStatusInfo] = useMutation<DeleteIdiomMutation, DeleteIdiomMutationVariables>(deleteIdiomQuery);

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
        {deleteConfirmation === DeleteActionState.Proposed ? "Are you sure?" : <Icon type="delete" theme="filled" />}
      </Button>
    )
  ];
  const editConfig = {
    onStart: () => {
      props.history.push("/idioms/" + idiom.slug + "/update");
    }
  };
  return (
    <article className="idiom">
      <PageHeader
        title={
          <Title level={3} editable={showEdit ? editConfig : false}>
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
        <EquivalentIdiomList idiom={idiom} user={currentUser} />
        <AddEquivalentSection idiom={idiom} user={currentUser} history={props.history} />
      </PageHeader>
    </article>
  );
};
