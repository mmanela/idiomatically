import * as React from "react";
import {
  CreateIdiomMutation,
  CreateIdiomMutationVariables,
  FullIdiomEntry,
  GetIdiomQuery,
  GetIdiomQueryVariables,
  OperationStatus
} from "../__generated__/types";
import "./NewIdiom.scss";
import { Typography, Alert, Spin, Form } from "antd";
import { useState } from "react";
import { Redirect } from "react-router";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { getIdiomQuery } from "../fragments/getIdiom";
import { commonFormItems } from "../components/commonFormItems";
import { getErrorMessage, isAuthenticationError } from "../utilities/errorUtils";
import { MutationFunction, useMutation, useLazyQuery, gql } from "@apollo/client";
import { useCurrentUser } from "../components/withCurrentUser";
import { PendingOperationNotification } from "../components/PendingOperationNotification";
import { IdiomRenderer } from "../components/IdiomRenderer";
import { Store } from "antd/lib/form/interface";
const { Title, Paragraph } = Typography;

export const createIdiomQuery = gql`
  mutation CreateIdiomMutation(
    $title: String!
    $languageKey: String!
    $countryKeys: [String!]!
    $description: String
    $literalTranslation: String
    $transliteration: String
    $relatedIdiomId: ID
  ) {
    createIdiom(
      idiom: {
        title: $title
        description: $description
        transliteration: $transliteration
        literalTranslation: $literalTranslation
        languageKey: $languageKey
        countryKeys: $countryKeys
        relatedIdiomId: $relatedIdiomId
      }
    ) {
      status
      message
      idiom {
        ...FullIdiomEntry
      }
    }
  }
  ${FULL_IDIOM_ENTRY}
`;

export interface NewIdiomProps {
  equivalentIdiomId?: string;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  }
};

export const NewIdiom: React.FunctionComponent<NewIdiomProps> = props => {
  const { currentUser, currentUserLoading } = useCurrentUser();

  const [languageKey, setLanguageKey] = useState("");

  const [createIdiom, { data, error, loading, client }] = useMutation<CreateIdiomMutation, CreateIdiomMutationVariables>(
    createIdiomQuery
  );
  const [getEquivalentIdiom, equivalentLoadInfo] = useLazyQuery<GetIdiomQuery, GetIdiomQueryVariables>(getIdiomQuery);

  const [form] = Form.useForm();
  const onFinishFailed = async (
    values: Store
  ) => {
    const { errorFields } = values;
    form.scrollToField(errorFields[0].name);
  };

  const onFinish = async (
    values: Store,
    createIdiom: MutationFunction<CreateIdiomMutation, CreateIdiomMutationVariables>,
    equivalentIdiom: FullIdiomEntry | null
  ) => {
    console.log("Received values of form: ", values);

    const variables: CreateIdiomMutationVariables = {
      title: values["title"] as string,
      description: values["description"] as string,
      transliteration: values["transliteration"] as string,
      literalTranslation: values["literalTranslation"] as string,
      languageKey: values["languageKey"] as string,
      countryKeys: values["countryKeys"] as string[],
      relatedIdiomId: equivalentIdiom && equivalentIdiom.id
    };

    await createIdiom({ variables, errorPolicy: "all" } as any);
  };

  const userNoLongerSignedIn = isAuthenticationError(error);
  const userNeedsToAuthenticate = (!currentUser && !currentUserLoading) || userNoLongerSignedIn;
  if (userNeedsToAuthenticate) {
    window.location.href = `${process.env.REACT_APP_SERVER}/login?returnTo=/new`;
    return <></>;
  }

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" tip="Loading..." />;
  }

  let equivilentIdiom: FullIdiomEntry | null = null;
  if (props.equivalentIdiomId) {
    equivilentIdiom = client!.readFragment<FullIdiomEntry>({
      id: "Idiom:" + props.equivalentIdiomId,
      fragment: FULL_IDIOM_ENTRY
    });
  }
  const renderForm = (
    <div>
      <Title level={2}>Add an Idiom</Title>
      <Paragraph>
        A goal of Idiomatically is to catalog and correlate idioms across countries and cultures. For that reason, it is important
        to write idioms from non-Latin alphabets in their native characters. Then provide an English translation of that idiom.
      </Paragraph>
      {data && data.createIdiom.idiom && data.createIdiom.idiom.slug && (
        <Redirect to={`/idioms/${data.createIdiom.idiom.slug}`} />
      )}
      {data &&
        !loading &&
        !error &&
        (data.createIdiom.status === OperationStatus.PENDING || data.createIdiom.status === OperationStatus.PENDINGFAILURE) && (
          <PendingOperationNotification operationStatus={data.createIdiom.status} redirect={`/idioms`} />
        )}

      {(loading || currentUserLoading) && <Spin className="middleSpinner" delay={500} spinning tip="Loading..." />}
      {error && <Alert type="error" message={getErrorMessage(error)} showIcon />}
      <Form
        form={form}
        initialValues={
          {
            languageKey: languageKey
          }
        }
        labelAlign="left" {...formItemLayout}
        onFinishFailed={onFinishFailed}
        onFinish={store => onFinish(store, createIdiom, equivilentIdiom)}>
        {equivilentIdiom && (
          <Form.Item label="Add an equivalent idiom for" colon>
            <div className="equivalentEntry">
              <IdiomRenderer idiom={equivilentIdiom} />
            </div>
          </Form.Item>
        )}

        {commonFormItems(loading, setLanguageKey, languageKey)}
      </Form>
    </div>
  );

  if (props.equivalentIdiomId) {
    // Get the idiom
    if (!equivalentLoadInfo.called) {
      getEquivalentIdiom({ variables: { id: props.equivalentIdiomId } });
    }

    if (equivalentLoadInfo.loading) {
      return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
    }
    if (equivalentLoadInfo.error) {
      return <Alert message="Error" type="error" description={error} showIcon />;
    }
    if (!equivalentLoadInfo.data || !equivalentLoadInfo.data.idiom) {
      return <Alert message="Oops!" description="It looks like you went barking up the wrong tree." type="warning" showIcon />;
    }
    equivilentIdiom = equivalentLoadInfo.data.idiom;
    return <>{renderForm}</>;
  } else {
    return renderForm;
  }
};
