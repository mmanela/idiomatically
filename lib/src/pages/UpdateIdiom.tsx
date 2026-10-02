import * as React from "react";
import {
  UpdateIdiomMutation,
  UpdateIdiomMutationVariables,
  GetIdiomQuery,
  GetIdiomQueryVariables,
  OperationStatus
} from "../__generated__/types";
import "./NewIdiom.scss";
import { Typography, Alert, Spin, Form } from "antd";
import { Navigate } from "react-router";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { getIdiomQuery } from "../fragments/getIdiom";
import { commonFormItems } from "../components/commonFormItems";
import { getErrorMessage, isAuthenticationError } from "../utilities/errorUtils";
import { useCurrentUser } from "../components/withCurrentUser";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { PendingOperationNotification } from "../components/PendingOperationNotification";
import { Store } from "antd/lib/form/interface";
const { Title } = Typography;

export const updateIdiomQuery = gql`
  mutation UpdateIdiomMutation(
    $id: ID!
    $title: String
    $countryKeys: [String!]
    $description: String
    $literalTranslation: String
    $transliteration: String
  ) {
    updateIdiom(
      idiom: {
        id: $id
        title: $title
        description: $description
        transliteration: $transliteration
        literalTranslation: $literalTranslation
        countryKeys: $countryKeys
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

export interface UpdateIdiomProps {
  slug: string;
  initialData: GetIdiomQuery;
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

export const UpdateIdiom: React.FunctionComponent<UpdateIdiomProps> = props => {
  const { currentUser, currentUserLoading } = useCurrentUser();
  const [updateIdiom, { data, error, loading }] = useMutation<UpdateIdiomMutation, UpdateIdiomMutationVariables>(
    updateIdiomQuery
  );
  const idiomLoadInfo = {
    data: props.initialData,
    loading: false,
    error: undefined,
  };

  const [form] = Form.useForm();
  const onFinishFailed = async (
    values: Store
  ) => {
    const { errorFields } = values;
    form.scrollToField(errorFields[0].name);
  };

  const onFinish = async (
    values: Store,
    idiomId: string
  ) => {

    console.log("Received values of form: ", values);

    const variables: UpdateIdiomMutationVariables = {
      id: idiomId,
      title: values["title"] as string,
      description: values["description"] as string,
      transliteration: values["transliteration"] as string,
      literalTranslation: values["literalTranslation"] as string,
      countryKeys: values["countryKeys"] as string[]
    };

    await updateIdiom({ variables, errorPolicy: "all" } as any);
  };

  const userNoLongerSignedIn = isAuthenticationError(error);
  const userNeedsToAuthenticate = (!currentUser && !currentUserLoading) || userNoLongerSignedIn;
  if (userNeedsToAuthenticate) {
    window.location.href = `/login?returnTo=/idioms/${props.slug}/update`;
    return <></>;
  }

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" description="Loading..." />;
  }

  if (idiomLoadInfo.loading) {
    return <Spin delay={500} className="middleSpinner" description="Loading..." />;
  }

  if (idiomLoadInfo.error) {
    return <Alert title="Error" type="error" description={getErrorMessage(idiomLoadInfo.error)} showIcon />;
  }

  if (!idiomLoadInfo.data || !idiomLoadInfo.data.idiom) {
    return <Alert title="Oops!" description="It looks like you went barking up the wrong tree." type="warning" showIcon />;
  }

  return (
    <div>
      <Title level={2}>Update an Idiom</Title>
      {data && !loading && !error && data.updateIdiom.idiom && <Navigate to={`/idioms/${data.updateIdiom.idiom.slug}`} replace />}
      {data &&
        !loading &&
        !error &&
        (data.updateIdiom.status === OperationStatus.PENDING || data.updateIdiom.status === OperationStatus.PENDINGFAILURE) && (
          <PendingOperationNotification operationStatus={data.updateIdiom.status} redirect={`/idioms/${props.slug}`} />
        )}

      {(loading || currentUserLoading) && <Spin className="middleSpinner" delay={500} spinning description="Loading..." />}
      {error && <Alert type="error" title={getErrorMessage(error)} showIcon />}
      <Form
        name="updateIdiom"
        initialValues={{
          title: idiomLoadInfo.data.idiom.title,
          languageKey: idiomLoadInfo.data.idiom.language && idiomLoadInfo.data.idiom.language.languageKey,
          countryKeys: idiomLoadInfo.data.idiom.language && idiomLoadInfo.data.idiom.language.countries.map(x => x.countryKey),
          literalTranslation: idiomLoadInfo.data.idiom.literalTranslation,
          description: idiomLoadInfo.data.idiom.description,
          transliteration: idiomLoadInfo.data.idiom.transliteration
        }
        }
        labelAlign="left"
        {...formItemLayout}
        onFinishFailed={onFinishFailed}
        onFinish={store => onFinish(store, idiomLoadInfo.data!.idiom!.id)}
      >
        {commonFormItems(loading, undefined, undefined, idiomLoadInfo.data.idiom)}
      </Form>
    </div>
  );
};