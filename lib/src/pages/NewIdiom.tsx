import * as React from "react";
import {
  CreateIdiomMutation,
  CreateIdiomMutationVariables,
  FullIdiomEntry,
  GetIdiomQuery,
  GetIdiomQueryVariables,
  OperationStatus
} from "../__generated__/types";
import gql from "graphql-tag";
import "./NewIdiom.scss";
import { Typography, Alert, Spin, Form } from "antd";
import { WrappedFormInternalProps } from "antd/lib/form/Form";
import { IDictionary } from "../types";
import { FormEvent, useState } from "react";
import { Redirect } from "react-router";
import { FULL_IDIOM_ENTRY } from "../fragments/fragments";
import { LanguageFlags } from "../components/LanguageFlags";
import { getIdiomQuery } from "../fragments/getIdiom";
import { commonFormItems } from "../components/commonFormItems";
import { getErrorMessage, isAuthenticationError } from "../utilities/errorUtils";
import { MutationFunction } from "@apollo/react-common";
import { useCurrentUser } from "../components/withCurrentUser";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import { PendingOperationNotification } from "../components/PendingOperationNotification";
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
  equivilentIdiomId?: string;
}

type FormProps = NewIdiomProps & WrappedFormInternalProps<IDictionary<string | string[]>>;

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

const NewIdiomComponent: React.StatelessComponent<FormProps> = props => {
  const { currentUser, currentUserLoading } = useCurrentUser();
  const { getFieldDecorator } = props.form;

  const [languageKey, setLanguageKey] = useState("");

  const [createIdiom, { data, error, loading, client }] = useMutation<CreateIdiomMutation, CreateIdiomMutationVariables>(
    createIdiomQuery
  );
  const [getEquivalentIdiom, equivalentLoadInfo] = useLazyQuery<GetIdiomQuery, GetIdiomQueryVariables>(getIdiomQuery);

  const handleSubmit = async (
    e: FormEvent<any>,
    props: FormProps,
    createIdiom: MutationFunction<CreateIdiomMutation, CreateIdiomMutationVariables>,
    equivalentIdiom: FullIdiomEntry | null
  ) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
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
      }
    });
  };

  const userNoLongerSignedIn = isAuthenticationError(error);
  const userNeedsToAuthenticate = (!currentUser && !currentUserLoading) || userNoLongerSignedIn;
  if (userNeedsToAuthenticate) {
    window.location.href = `${process.env.REACT_APP_SERVER}/auth/google`;
    return <></>;
  }

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" tip="Loading..." />;
  }

  let equivilentIdiom: FullIdiomEntry | null = null;
  if (props.equivilentIdiomId) {
    equivilentIdiom = client!.readFragment<FullIdiomEntry>({
      id: "Idiom:" + props.equivilentIdiomId,
      fragment: FULL_IDIOM_ENTRY
    });
  }
  const form = () => (
    <div>
      <Title level={2}>Add an Idiom</Title>
      <Paragraph>
        A goal of Idiomatically is to catalog and relate Idioms across countries and cultures. For that reason, it is important to
        give idioms from non-English alphabets in their native characters. Then provide an english character transliteration and
        translation of that Idiom.
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
      <Form labelAlign="left" {...formItemLayout} onSubmit={e => handleSubmit(e, props, createIdiom, equivilentIdiom)}>
        {equivilentIdiom && (
          <Form.Item label="Equivalent for">
            <div className="equivalentEntry">
              <LanguageFlags languageInfo={equivilentIdiom.language} layoutMode="horizontal" compactMode size="small" />
              <span className="ant-form-text">{equivilentIdiom.title}</span>
            </div>
          </Form.Item>
        )}

        {commonFormItems(getFieldDecorator, loading, setLanguageKey, languageKey)}
      </Form>
    </div>
  );

  if (props.equivilentIdiomId) {
    // Get the idiom
    if (!equivalentLoadInfo.called) {
      getEquivalentIdiom({ variables: { id: props.equivilentIdiomId } });
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
    return <>{form()}</>;
  } else {
    return form();
  }
};

export const NewIdiom = Form.create<FormProps>({ name: "newIdiom" })(NewIdiomComponent);
