import * as React from "react";
import {
  UpdateIdiomMutation,
  UpdateIdiomMutationVariables,
  GetIdiomQuery,
  GetIdiomQueryVariables,
  OperationStatus
} from "../__generated__/types";
import gql from "graphql-tag";
import "./NewIdiom.scss";
import { Typography, Alert, Spin, Form } from "antd";
import { Redirect } from "react-router";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { getIdiomQuery } from "../fragments/getIdiom";
import { commonFormItems } from "../components/commonFormItems";
import { getErrorMessage, isAuthenticationError } from "../utilities/errorUtils";
import { MutationFunction } from "@apollo/react-common";
import { useCurrentUser } from "../components/withCurrentUser";
import { useMutation, useQuery } from "@apollo/react-hooks";
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
  const idiomLoadInfo = useQuery<GetIdiomQuery, GetIdiomQueryVariables>(getIdiomQuery, {
    variables: { slug: props.slug }
  });

  const [form] = Form.useForm();
  const onFinishFailed = async (
    values: Store
  ) => {
    const { errorFields } = values;
    form.scrollToField(errorFields[0].name);
  };

  const onFinish = async (
    values: Store,
    updateIdiom: MutationFunction<UpdateIdiomMutation, UpdateIdiomMutationVariables>,
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
    window.location.href = `${process.env.REACT_APP_SERVER}/login?/idioms/${props.slug}/update`;
    return <></>;
  }

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" tip="Loading..." />;
  }

  if (idiomLoadInfo.loading) {
    return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
  }

  if (idiomLoadInfo.error) {
    return <Alert message="Error" type="error" description={error} showIcon />;
  }

  if (!idiomLoadInfo.data || !idiomLoadInfo.data.idiom) {
    return <Alert message="Oops!" description="It looks like you went barking up the wrong tree." type="warning" showIcon />;
  }

  return (
    <div>
      <Title level={2}>Update an Idiom</Title>
      {data && !loading && !error && data.updateIdiom.idiom && <Redirect to={`/idioms/${data.updateIdiom.idiom.slug}`} />}
      {data &&
        !loading &&
        !error &&
        (data.updateIdiom.status === OperationStatus.PENDING || data.updateIdiom.status === OperationStatus.PENDINGFAILURE) && (
          <PendingOperationNotification operationStatus={data.updateIdiom.status} redirect={`/idioms/${props.slug}`} />
        )}

      {(loading || currentUserLoading) && <Spin className="middleSpinner" delay={500} spinning tip="Loading..." />}
      {error && <Alert type="error" message={getErrorMessage(error)} showIcon />}
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
        onFinish={store => onFinish(store, updateIdiom, idiomLoadInfo.data!.idiom!.id)}
      >
        {commonFormItems(loading, undefined, undefined, idiomLoadInfo.data.idiom)}
      </Form>
    </div>
  );
};