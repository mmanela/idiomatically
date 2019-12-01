import * as React from "react";
import "./Idiom.scss";
import { LanguageFlags } from "../components/LanguageFlags";
import { RouteChildrenProps, Redirect } from "react-router";
import { History } from "history";
import { getIdiomQuery } from "../fragments/getIdiom";
import {
  GetIdiomQuery,
  GetIdiomQueryVariables,
  UserRole,
  DeleteIdiomMutation,
  DeleteIdiomMutationVariables,
  OperationStatus,
  GetIdiomQuery_idiom,
  AddEquivalentIdiomMutation,
  AddEquivalentIdiomMutationVariables,
  RemoveEquivalentIdiomMutation,
  RemoveEquivalentIdiomMutationVariables,
  GetCurrentUser_me,
  GetIdiomQuery_idiom_equivalents,
  FindIdiomsQuery,
  FindIdiomsQueryVariables,
  FindIdiomsQuery_idioms_edges,
  FindIdiomsQuery_idioms_edges_node
} from "../__generated__/types";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../components/withCurrentUser";
import { useQuery, useMutation, useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useState } from "react";
import { Typography, Alert, Spin, Button, PageHeader, Icon, Select } from "antd";
import { MINIMAL_IDIOM_ENTRY } from "../fragments/fragments";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

export const deleteIdiomQuery = gql`
  mutation DeleteIdiomMutation($id: ID!) {
    deleteIdiom(idiomId: $id) {
      status
      message
    }
  }
`;

export const addIdiomEquivalentQuery = gql`
  mutation AddEquivalentIdiomMutation($idiomId: ID!, $equivalentId: ID!) {
    addEquivalent(idiomId: $idiomId, equivalentId: $equivalentId) {
      status
      message
    }
  }
`;

export const removeEquivalentQuery = gql`
  mutation RemoveEquivalentIdiomMutation($idiomId: ID!, $equivalentId: ID!) {
    removeEquivalent(idiomId: $idiomId, equivalentId: $equivalentId) {
      status
      message
    }
  }
`;

export const findIdiomsQuery = gql`
  query FindIdiomsQuery($filter: String) {
    idioms(filter: $filter, limit: 10) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...MinimalIdiomEntry
        }
      }
    }
  }
  ${MINIMAL_IDIOM_ENTRY}
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
  const buttons = [
    showEdit && (
      <Button
        key="1"
        type="default"
        onClick={() => {
          props.history.push("/idioms/" + idiom.slug + "/update");
        }}
      >
        Edit
      </Button>
    ),
    showDelete && (
      <Button
        key="2"
        type="danger"
        onClick={() => {
          if (deleteConfirmation === DeleteActionState.Proposed) {
            deleteIdiom({ variables: { id: idiom.id } });
          } else if (deleteConfirmation === DeleteActionState.None) {
            setDeleteConfirmation(DeleteActionState.Proposed);
          }
        }}
      >
        {deleteConfirmation === DeleteActionState.Proposed ? "Are you sure?" : "Delete"}
      </Button>
    )
  ];

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

        {idiom.description && (
          <>
            <Title level={4}>Description</Title>
            <Paragraph className="content">{idiom.description}</Paragraph>
          </>
        )}

        <Title level={4}>Equivalents</Title>
        <Paragraph className="info">This is how you express this idiom across languages and locales.</Paragraph>
        <EquivalentIdiomList idiom={idiom} user={currentUser} />
        <AddEquivalentIdiomList idiom={idiom} user={currentUser} history={props.history} />
      </PageHeader>
    </article>
  );
};

interface AddEquivalentListProps {
  user?: GetCurrentUser_me | null;
  idiom: GetIdiomQuery_idiom;
  history: History;
}

type IdiomFindItem = { title: string; slug: string; id: string };
const AddEquivalentIdiomList: React.StatelessComponent<AddEquivalentListProps> = props => {
  const [selectedIdiom, setSelectedIdiom] = React.useState<FindIdiomsQuery_idioms_edges_node | null>(null);
  const [findQueryData, findQueryLoadResult] = useLazyQuery<FindIdiomsQuery, FindIdiomsQueryVariables>(findIdiomsQuery);
  const [addEquivalentIdiomMutation, addEquivalentIdiomMutationResult] = useMutation<
    AddEquivalentIdiomMutation,
    AddEquivalentIdiomMutationVariables
  >(addIdiomEquivalentQuery);

  const fetching = findQueryLoadResult.loading;
  const findData =
    (!findQueryLoadResult.error &&
      findQueryLoadResult.data &&
      findQueryLoadResult.data.idioms &&
      findQueryLoadResult.data.idioms.edges) ||
    [];

  const fetchUser = (value: string) => {
    findQueryData({ variables: { filter: value } });
  };
  const handleChange = (id: string) => {
    const matches = findData.filter(x => x.node.id === id);
    const idiom = matches && matches[0] ? matches[0].node : null;
    setSelectedIdiom(idiom);
  };

  if (!props.user) {
    return (
      <Button type="link" icon="plus-circle" onClick={e => loginClick(e, props.idiom!.slug, props.history)}>
        Login to correlate with other idioms
      </Button>
    );
  }

  return (
    <>
      <Title level={4}>Correlate Idiom</Title>
      <Paragraph className="content addEquivalent addExisting">
        <Text strong>With existing idiom...</Text>
        <Text className="addEquivalentDescription">Search to find an idiom to correlate this with</Text>
        <div>
          <Select<string>
            mode="default"
            showSearch
            value={selectedIdiom ? selectedIdiom.id! : undefined}
            placeholder="Find an idiom"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={fetchUser}
            onChange={handleChange}
            style={{ width: "400px" }}
          >
            {findData.map(d => (
              <Option key={d.node.id} value={d.node.id}>
                {d.node.title}
              </Option>
            ))}
          </Select>
        </div>
        {selectedIdiom && (
          <div className="equivalentItem">
            <div className="equivalentItemContent">
              <LanguageFlags
                languageInfo={selectedIdiom.language}
                compactMode={true}
                showLabel={true}
                size={"small"}
                layoutMode={"horizontal"}
              />
              <Link target="_blank" to={"/idioms/" + selectedIdiom.slug}>
                {selectedIdiom.title}
              </Link>
            </div>
            <Button type="primary">Add</Button>
          </div>
        )}
      </Paragraph>
      <Paragraph className="content addEquivalent addNew">
        <Text strong>With a new idiom...</Text>
        <Text className="addEquivalentDescription">If the idiom doesn't exist here yet, please add it</Text>
        <div>
          <Button type="link" icon="plus-circle" onClick={e => handleAddEquivalentClick(e, props.idiom!.id, props.history)}>
            Add idiom
          </Button>
        </div>
      </Paragraph>
    </>
  );
};

interface EquivalentListProps {
  user?: GetCurrentUser_me | null;
  idiom: GetIdiomQuery_idiom;
}

const EquivalentIdiomList: React.StatelessComponent<EquivalentListProps> = props => {
  if (props.idiom.equivalents.length <= 0) {
    return <Paragraph className="content">No equivalent idioms across languages yet...</Paragraph>;
  }

  return (
    <ul className="equivalentList">
      {props.idiom.equivalents.length > 0 &&
        props.idiom.equivalents.map(x => <EquivalentIdiomItem equivalentIdiom={x} idiom={props.idiom} user={props.user} />)}
    </ul>
  );
};

interface EquivalentItemProps {
  user?: GetCurrentUser_me | null;
  equivalentIdiom: GetIdiomQuery_idiom_equivalents;
  idiom: GetIdiomQuery_idiom;
}
const EquivalentIdiomItem: React.StatelessComponent<EquivalentItemProps> = props => {
  const equivalent = props.equivalentIdiom;
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [removeEquivalentIdiomMutation, removeEquivalentMutationResult] = useMutation<
    RemoveEquivalentIdiomMutation,
    RemoveEquivalentIdiomMutationVariables
  >(removeEquivalentQuery);

  const equivalentRemoved =
    removeEquivalentMutationResult &&
    removeEquivalentMutationResult.data &&
    removeEquivalentMutationResult.data.removeEquivalent.status === OperationStatus.SUCCESS;

  if (equivalentRemoved) {
    return null;
  }

  const isAdmin = props.user && props.user.role === UserRole.ADMIN;

  const removeEquivalentHandler = (equivalentId: string) => {
    if (confirmRemove) {
      removeEquivalentIdiomMutation({ variables: { idiomId: props.idiom.id, equivalentId: equivalentId } });
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
    }
  };

  return (
    <li key={equivalent.slug}>
      <div className="equivalentItem">
        <div className="equivalentItemContent">
          <LanguageFlags
            languageInfo={equivalent.language}
            compactMode={true}
            showLabel={true}
            size={"small"}
            layoutMode={"horizontal"}
          />
          <Link to={"/idioms/" + equivalent.slug}>{equivalent.title}</Link>
        </div>
        {isAdmin && (
          <Button onClick={() => removeEquivalentHandler(equivalent.id)} type="link" className="removeEquivalentButton">
            <Icon type="delete" className="removeEquivalentIcon" theme="filled" />
            {confirmRemove ? "Are you sure?" : "Remove"}
          </Button>
        )}
      </div>
    </li>
  );
};

const handleAddEquivalentClick = (e: React.MouseEvent<any, any>, idiomId: string, history: History) => {
  history.push(`/new?equivalentIdiomId=${idiomId}`);
};

const loginClick = (e: React.MouseEvent<any, any>, idiomSlug: string, history: History) => {
  const returnUrl = `/idioms/${idiomSlug}`;
  window.location.href = `${process.env.REACT_APP_SERVER}/login?returnTo=${returnUrl}`;
};
