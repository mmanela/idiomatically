import React from "react";
import { History } from "history";
import {
  OperationStatus,
  GetIdiomQuery_idiom,
  AddEquivalentIdiomMutation,
  AddEquivalentIdiomMutationVariables,
  GetCurrentUser_me,
  FindIdiomsQuery,
  FindIdiomsQueryVariables,
  FindIdiomsQuery_idioms_edges_node
} from "../__generated__/types";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import { MINIMAL_IDIOM_ENTRY } from "../fragments/fragments";
import gql from "graphql-tag";
import "./AddEquivalentSection.scss";
import { Alert, Spin, Button, Select, Typography } from "antd";
import { IdiomRenderer } from "./IdiomRenderer";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

export const addIdiomEquivalentQuery = gql`
  mutation AddEquivalentIdiomMutation($idiomId: ID!, $equivalentId: ID!) {
    addEquivalent(idiomId: $idiomId, equivalentId: $equivalentId) {
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

interface AddEquivalentListProps {
  user?: GetCurrentUser_me | null;
  idiom: GetIdiomQuery_idiom;
  history: History;
}
type SelectedIdiomState = {
  idiom?: FindIdiomsQuery_idioms_edges_node | null;
  submitting?: boolean;
  status?: OperationStatus;
};
export const AddEquivalentSection: React.StatelessComponent<AddEquivalentListProps> = props => {
  const [selectedIdiomState, setSelectedIdiomState] = React.useState<SelectedIdiomState>({});
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
  // Clear selected idiom if we submitted succesfully
  if (addEquivalentIdiomMutationResult.called && !addEquivalentIdiomMutationResult.loading && selectedIdiomState.submitting) {
    let status = OperationStatus.FAILURE;
    if (addEquivalentIdiomMutationResult.data) {
      status = addEquivalentIdiomMutationResult.data.addEquivalent.status;
    }
    setSelectedIdiomState({ ...selectedIdiomState, submitting: false, status: status });
  }
  const fetchUser = (value: string) => {
    findQueryData({ variables: { filter: value } });
  };
  const handleChange = (id: string) => {
    const matches = findData.filter(x => x.node.id === id);
    const idiom = matches && matches[0] ? matches[0].node : null;
    setSelectedIdiomState({ idiom: idiom });
  };
  const addEquivalent = (id: string) => {
    addEquivalentIdiomMutation({ variables: { idiomId: props.idiom.id, equivalentId: id } });
    setSelectedIdiomState({ ...selectedIdiomState, submitting: true });
  };
  if (!props.user) {
    return (
      <Button type="link" icon="plus-circle" onClick={e => loginClick(e, props.idiom!.slug, props.history)}>
        Login to correlate with other idioms
      </Button>
    );
  }

  const actions = (
    <Button
      disabled={!selectedIdiomState.idiom || selectedIdiomState.submitting}
      type="primary"
      onClick={() => addEquivalent(selectedIdiomState.idiom!.id)}
    >
      {addEquivalentIdiomMutationResult.loading ? <Spin size="small" /> : "Add"}
    </Button>
  );

  return (
    <>
      <Title level={4}>Correlate Idiom</Title>
      <Paragraph className="content addEquivalent addExisting">
        <Text strong>With an existing idiom...</Text>
        <Text className="addEquivalentDescription">Search to find an idiom to correlate this with</Text>
        <div className="addExistingFindBox">
          <Select<string>
            mode="default"
            showSearch
            value={selectedIdiomState.idiom ? selectedIdiomState.idiom.id! : undefined}
            placeholder="Find an idiom"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={fetchUser}
            onChange={handleChange}
            className="findSelectControl"
          >
            {findData.map(d => (
              <Option key={d.node.id} value={d.node.id}>
                <IdiomRenderer idiom={d.node} hideFlags={true} disableLink={true} />
              </Option>
            ))}
          </Select>
        </div>
        {selectedIdiomState.idiom && selectedIdiomState.status !== undefined && (
          <Alert
            className="addEquivalentResult"
            message={getMessageFromStatus(selectedIdiomState.status)}
            type={getSuccessFromStatus(selectedIdiomState.status) ? "success" : "error"}
          />
        )}

        {selectedIdiomState.idiom && selectedIdiomState.status === undefined && (
          <IdiomRenderer idiom={selectedIdiomState.idiom} actions={actions} />
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

const getMessageFromStatus = (status: OperationStatus) => {
  switch (status) {
    case OperationStatus.SUCCESS:
      return "Successfully added!";
    case OperationStatus.PENDING:
      return "Thanks, your proposed change has been submitted for review.";
    case OperationStatus.PENDINGFAILURE:
      return "Thanks, you may have too many proposed change. Please try again later";
    default:
      return "There was an error, please try again";
  }
};

const getSuccessFromStatus = (status: OperationStatus) => {
  switch (status) {
    case OperationStatus.SUCCESS:
    case OperationStatus.PENDING:
      return true;
    default:
      return false;
  }
};

export const handleAddEquivalentClick = (e: React.MouseEvent<any, any>, idiomId: string, history: History) => {
  history.push(`/new?equivalentIdiomId=${idiomId}`);
};

export const loginClick = (e: React.MouseEvent<any, any>, idiomSlug: string, history: History) => {
  const returnUrl = `/idioms/${idiomSlug}`;
  window.location.href = `${process.env.REACT_APP_SERVER}/login?returnTo=${returnUrl}`;
};
