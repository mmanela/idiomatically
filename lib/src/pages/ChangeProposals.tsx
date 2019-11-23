import * as React from "react";
import {
  GetChangeProposalsQuery,
  GetChangeProposalsQueryVariables,
  GetChangeProposalsQuery_idiomChangeProposals_edges,
  AcceptChangeProposalMutation,
  AcceptChangeProposalMutationVariables,
  RejectChangeProposalMutation,
  RejectChangeProposalMutationVariables
} from "../__generated__/types";
import gql from "graphql-tag";
import "./ChangeProposals.scss";
import { Alert, Spin, List, Empty, Icon } from "antd";
import { Link } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import { JsonEditor } from "../components/JsonEditor";

export const getChangeProposalsQuery = gql`
  query GetChangeProposalsQuery($filter: String, $limit: Int, $cursor: String) {
    idiomChangeProposals(filter: $filter, limit: $limit, cursor: $cursor) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          body
          readOnlyType
          readOnlyCreatedBy
          readOnlyTitle
        }
      }
    }
  }
`;

export const acceptChangeProposalQuery = gql`
  mutation AcceptChangeProposalMutation($id: ID!, $body: String) {
    acceptIdiomChangeProposal(proposalId: $id, body: $body) {
      status
      message
    }
  }
`;

export const rejectChangeProposalQuery = gql`
  mutation RejectChangeProposalMutation($id: ID!) {
    rejectIdiomChangeProposal(proposalId: $id) {
      status
      message
    }
  }
`;

export interface ChangeProposalsProps {
  filter: string | null;
}

export const ChangeProposals: React.StatelessComponent<ChangeProposalsProps> = props => {
  const { filter } = props;
  const [pageNumber, setPageNumber] = React.useState(1);
  const [lastFilter, setLastFilter] = React.useState(props.filter);
  const [queryPage, loadResult] = useLazyQuery<GetChangeProposalsQuery, GetChangeProposalsQueryVariables>(
    getChangeProposalsQuery
  );
  const pageSize = 10;

  // Based on the page number we get from state we calculate the bounds of the cursors
  // we then check if the data we current have has a endCursor that falls in that range. If so,
  // we have the data for this page, no need to query. Otherwise, run the query.
  const currCursorNum = (pageNumber - 1) * pageSize;
  const nextCursorNum = pageNumber * pageSize;
  const incomingEndCursorNum =
    loadResult.data && loadResult.data.idiomChangeProposals.totalCount > 0
      ? Number.parseInt(loadResult.data.idiomChangeProposals.pageInfo.endCursor)
      : null;
  const changePage =
    incomingEndCursorNum != null && !(currCursorNum < incomingEndCursorNum && nextCursorNum >= incomingEndCursorNum);
  const filterChanged = props.filter !== lastFilter;
  if (!loadResult.called || (!loadResult.loading && loadResult.data && changePage) || filterChanged) {
    queryPage({
      variables: { filter, limit: pageSize, cursor: currCursorNum.toString() }
    });
    setLastFilter(props.filter);
  }
  if (loadResult.loading) return <Spin delay={500} className="middleSpinner" tip="Loading..." />;
  if (loadResult.error) return <Alert message="Error" type="error" description={loadResult.error.message} showIcon />;
  if (!loadResult.data || loadResult.data.idiomChangeProposals.edges.length <= 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Could not find a needle in the haystack." />;
  }

  return (
    <List
      className="changeProposalsListView"
      itemLayout="vertical"
      size="default"
      pagination={{
        defaultCurrent: pageNumber,
        onChange: (page: number, size?: number) => {
          setPageNumber(page);
        },
        pageSize: pageSize,
        hideOnSinglePage: true,
        total: loadResult.data.idiomChangeProposals.totalCount
      }}
      dataSource={loadResult.data.idiomChangeProposals.edges}
      renderItem={item => <ChangeProposalItem item={item} />}
    />
  );
};

interface ChangeProposalItemProps {
  item: GetChangeProposalsQuery_idiomChangeProposals_edges;
}

export const ChangeProposalItem: React.StatelessComponent<ChangeProposalItemProps> = props => {
  const proposal = props.item.node;
  const [proposalBody, setProposalBody] = React.useState(proposal.body);
  const [confirmAccept, setConfirmAccept] = React.useState(false);
  const [confirmReject, setConfirmReject] = React.useState(false);
  const [acceptProposalMutation, acceptProposalMutationResult] = useMutation<
    AcceptChangeProposalMutation,
    AcceptChangeProposalMutationVariables
  >(acceptChangeProposalQuery);
  const [rejectProposalMutation, rejectProposalMutationResult] = useMutation<
    RejectChangeProposalMutation,
    RejectChangeProposalMutationVariables
  >(rejectChangeProposalQuery);

  const error = (acceptProposalMutationResult && acceptProposalMutationResult.error && acceptProposalMutationResult.error.message)
                || (rejectProposalMutationResult && rejectProposalMutationResult.error && rejectProposalMutationResult.error.message);

  const title = proposal.readOnlyTitle ? `${proposal.id} - ${proposal.readOnlyTitle}` : proposal.id;
  const extra = <div className="proposalType">{proposal.readOnlyType}</div>;
  const json = JSON.parse(proposalBody || proposal.body || "{}");

  const editor = <JsonEditor json={json} onChangeText={code => setProposalBody(code)} />;

  const acceptProposal = () => {
    if(confirmAccept) {
      acceptProposalMutation({ variables: { id: proposal.id, body: proposalBody } });
      setConfirmAccept(false);
    }
    else {
      setConfirmAccept(true);
    }
  };

  const rejectProposal = () => {
    if(confirmReject) {
    rejectProposalMutation({ variables: { id: proposal.id } });
    setConfirmReject(false);
    }
    else {
      setConfirmReject(true);
    }
  };

  const resetProposal = () => {
    setConfirmAccept(false);
    setConfirmReject(false);
    setProposalBody(proposal.body);
  };

  const acceptAction = (
    <span>
      <a onClick={acceptProposal}>
        <Icon type="check-circle" className="acceptButton proposalButton" theme="filled" />
        {confirmAccept ? "Are you sure?" : "Accept Proposal"}
      </a>
    </span>
  );

  const rejectAction = (
    <span>
      <a onClick={rejectProposal}>
        <Icon type="close-circle" className="rejectButton proposalButton" theme="filled" />
        {confirmReject ? "Are you sure?" : "Reject Proposal"}
      </a>
    </span>
  );

  const resetAction = (
    <span>
      <a onClick={resetProposal}>
        <Icon type="clock-circle" className="resetButton proposalButton" theme="filled" />
        Reset Proposal
      </a>
    </span>
  );

  return (
    <List.Item key={proposal.id} extra={extra} className="changeProposalItem" actions={[acceptAction, rejectAction, resetAction]}>
      <List.Item.Meta className="itemDetails" title={title} description={"By " + proposal.readOnlyCreatedBy} />
      
      {error && <Alert message="Error" type="error" description={error} showIcon />}
      {editor}
    </List.Item>
  );
};
