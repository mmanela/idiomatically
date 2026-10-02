import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Pagination,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import * as React from "react";
import { Link, Navigate } from "react-router";
import {
  AcceptChangeProposalMutation,
  AcceptChangeProposalMutationVariables,
  GetChangeProposalsQuery,
  GetChangeProposalsQueryVariables,
  GetChangeProposalsQuery_idiomChangeProposals_edges,
  OperationStatus,
  RejectChangeProposalMutation,
  RejectChangeProposalMutationVariables,
} from "../__generated__/types";
import { CountrySelect } from "../components/CountrySelect";
import { LanguageSelect } from "../components/LanguageSelect";
import { useCurrentUser } from "../components/withCurrentUser";
import "./ChangeProposals.scss";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

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
          readOnlySlug
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

type EditableIdiom = {
  title?: string;
  description?: string;
  languageKey?: string;
  countryKeys?: string[];
  transliteration?: string;
  literalTranslation?: string;
  tags?: string[];
};

type ProposalBody = {
  type?: string;
  idiomId?: string;
  equivalentId?: string;
  idiomToCreate?: EditableIdiom;
  idiomToUpdate?: EditableIdiom;
  readOnlyEquivalentTitle?: string;
  readOnlyEquivalentSlug?: string;
  [key: string]: unknown;
};

type EditableIdiomKey = "idiomToCreate" | "idiomToUpdate";
type EditableIdiomField = keyof EditableIdiom;

function getProposalTypeLabel(proposalType: string) {
  const labels: Record<string, string> = {
    AddEquivalent: "Add equivalent",
    CreateIdiom: "Create idiom",
    DeleteEquivalent: "Remove equivalent",
    DeleteIdiom: "Delete idiom",
    UpdateIdiom: "Update idiom",
  };
  return labels[proposalType] || proposalType;
}

function parseProposalBody(body: string) {
  try {
    const value = JSON.parse(body) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Proposal body must be an object");
    }

    return { body: value as ProposalBody, error: null };
  } catch (error) {
    return {
      body: null,
      error: error instanceof Error ? error.message : "Invalid proposal body",
    };
  }
}

export interface ChangeProposalsProps {
  filter: string | null;
}

export const ChangeProposals: React.FunctionComponent<
  ChangeProposalsProps
> = ({ filter }) => {
  const { currentUser, currentUserLoading } = useCurrentUser();
  const [pageNumber, setPageNumber] = React.useState(1);
  const pageSize = 10;
  const loadResult = useQuery<
    GetChangeProposalsQuery,
    GetChangeProposalsQueryVariables
  >(getChangeProposalsQuery, {
    variables: {
      filter,
      limit: pageSize,
      cursor: String((pageNumber - 1) * pageSize),
    },
  });

  if (currentUserLoading) {
    return (
      <Spin
        spinning
        delay={500}
        className="middleSpinner"
        description="Loading..."
      />
    );
  }
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  if (loadResult.loading) {
    return (
      <Spin
        delay={500}
        className="middleSpinner"
        description="Loading..."
      />
    );
  }
  if (loadResult.error) {
    return (
      <Alert
        title="Error"
        type="error"
        description={loadResult.error.message}
        showIcon
      />
    );
  }

  const proposals = loadResult.data?.idiomChangeProposals;
  if (!proposals?.edges.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_DEFAULT}
        description="Could not find a needle in a haystack."
      />
    );
  }

  return (
    <div className="changeProposalsListView">
      <div className="proposalList">
        {proposals.edges.map((item) => (
          <ChangeProposalItem key={item.node.id} item={item} />
        ))}
      </div>
      {proposals.totalCount > pageSize && (
        <Pagination
          current={pageNumber}
          onChange={setPageNumber}
          pageSize={pageSize}
          total={proposals.totalCount}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};

interface ChangeProposalItemProps {
  item: GetChangeProposalsQuery_idiomChangeProposals_edges;
}

export const ChangeProposalItem: React.FunctionComponent<
  ChangeProposalItemProps
> = ({ item }) => {
  const proposal = item.node;
  const initialProposal = React.useMemo(
    () => parseProposalBody(proposal.body),
    [proposal.body],
  );
  const [proposalBody, setProposalBody] =
    React.useState<ProposalBody | null>(initialProposal.body);
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

  const proposalResolved =
    acceptProposalMutationResult.data?.acceptIdiomChangeProposal.status ===
      OperationStatus.SUCCESS ||
    rejectProposalMutationResult.data?.rejectIdiomChangeProposal.status ===
      OperationStatus.SUCCESS;
  if (proposalResolved) {
    return null;
  }

  const error =
    acceptProposalMutationResult.error?.message ||
    rejectProposalMutationResult.error?.message ||
    initialProposal.error;
  const editableIdiomKey: EditableIdiomKey | null =
    proposal.readOnlyType === "CreateIdiom"
      ? "idiomToCreate"
      : proposal.readOnlyType === "UpdateIdiom"
        ? "idiomToUpdate"
        : null;
  const editableIdiom =
    editableIdiomKey && proposalBody
      ? proposalBody[editableIdiomKey]
      : null;
  const proposalUrl = proposal.readOnlySlug
    ? `/idioms/${proposal.readOnlySlug}`
    : "";
  const title = proposal.readOnlyTitle || `Proposal ${proposal.id.slice(-6)}`;

  const updateIdiomField = (
    field: EditableIdiomField,
    value: string | string[],
  ) => {
    if (!editableIdiomKey) {
      return;
    }
    setProposalBody((current) =>
      current
        ? {
            ...current,
            [editableIdiomKey]: {
              ...(current[editableIdiomKey] || {}),
              [field]: value,
            },
          }
        : current,
    );
  };

  const acceptProposal = () => {
    if (!confirmAccept) {
      setConfirmAccept(true);
      setConfirmReject(false);
      return;
    }
    if (proposalBody) {
      acceptProposalMutation({
        variables: {
          id: proposal.id,
          body: JSON.stringify(proposalBody),
        },
      });
    }
    setConfirmAccept(false);
  };

  const rejectProposal = () => {
    if (!confirmReject) {
      setConfirmReject(true);
      setConfirmAccept(false);
      return;
    }
    rejectProposalMutation({ variables: { id: proposal.id } });
    setConfirmReject(false);
  };

  const resetProposal = () => {
    setConfirmAccept(false);
    setConfirmReject(false);
    setProposalBody(parseProposalBody(proposal.body).body);
  };

  return (
    <Card
      className="changeProposalItem"
      title={
        proposalUrl ? (
          <Link to={proposalUrl}>{title}</Link>
        ) : (
          <span>{title}</span>
        )
      }
      extra={
        <Tag className="proposalType" color="orange">
          {getProposalTypeLabel(proposal.readOnlyType)}
        </Tag>
      }
    >
      <Descriptions
        className="proposalMetadata"
        column={{ xs: 1, sm: 2 }}
        size="small"
        items={[
          {
            key: "submittedBy",
            label: "Submitted by",
            children: proposal.readOnlyCreatedBy,
          },
          {
            key: "proposalId",
            label: "Proposal ID",
            children: <Text copyable>{proposal.id}</Text>,
          },
        ]}
      />

      {error && (
        <Alert
          className="proposalError"
          title="Unable to review proposal"
          type="error"
          description={error}
          showIcon
        />
      )}

      {editableIdiomKey && editableIdiom ? (
        <Form className="proposalEditor" layout="vertical">
          <div className="proposalFieldGrid">
            <Form.Item label="Title">
              <Input
                aria-label="Proposed title"
                value={editableIdiom.title || ""}
                onChange={(event) =>
                  updateIdiomField("title", event.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="Language">
              <LanguageSelect
                value={editableIdiom.languageKey || ""}
                onChange={(languageKey) =>
                  updateIdiomField("languageKey", languageKey)
                }
              />
            </Form.Item>
            <Form.Item label="Countries">
              <CountrySelect
                languageKey={editableIdiom.languageKey}
                value={editableIdiom.countryKeys || []}
                onChange={(countryKeys) =>
                  updateIdiomField("countryKeys", countryKeys)
                }
              />
            </Form.Item>
            <Form.Item
              label="Tags"
              extra="Separate multiple tags with commas."
            >
              <Input
                aria-label="Proposed tags"
                value={(editableIdiom.tags || []).join(", ")}
                onChange={(event) =>
                  updateIdiomField(
                    "tags",
                    event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
              />
            </Form.Item>
            <Form.Item label="Transliteration">
              <Input
                aria-label="Proposed transliteration"
                value={editableIdiom.transliteration || ""}
                onChange={(event) =>
                  updateIdiomField("transliteration", event.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="Literal translation">
              <Input
                aria-label="Proposed literal translation"
                value={editableIdiom.literalTranslation || ""}
                onChange={(event) =>
                  updateIdiomField(
                    "literalTranslation",
                    event.target.value,
                  )
                }
              />
            </Form.Item>
          </div>
          <Form.Item label="Description">
            <TextArea
              aria-label="Proposed description"
              autoSize={{ minRows: 3, maxRows: 8 }}
              value={editableIdiom.description || ""}
              onChange={(event) =>
                updateIdiomField("description", event.target.value)
              }
            />
          </Form.Item>
        </Form>
      ) : (
        <ProposalDecisionSummary
          proposalBody={proposalBody}
          proposalType={proposal.readOnlyType}
        />
      )}

      <Space className="proposalActions" wrap>
        <Button
          className="acceptAction"
          disabled={!proposalBody}
          loading={acceptProposalMutationResult.loading}
          onClick={acceptProposal}
          type={confirmAccept ? "primary" : "default"}
        >
          <CheckCircleFilled className="acceptButton proposalButton" />
          {confirmAccept ? "Are you sure?" : "Accept Proposal"}
        </Button>
        <Button
          className="rejectAction"
          danger={confirmReject}
          loading={rejectProposalMutationResult.loading}
          onClick={rejectProposal}
        >
          <CloseCircleFilled className="rejectButton proposalButton" />
          {confirmReject ? "Are you sure?" : "Reject Proposal"}
        </Button>
        {editableIdiomKey && (
          <Button className="resetAction" onClick={resetProposal}>
            <ClockCircleFilled className="resetButton proposalButton" />
            Reset changes
          </Button>
        )}
      </Space>
    </Card>
  );
};

function ProposalDecisionSummary({
  proposalBody,
  proposalType,
}: {
  proposalBody: ProposalBody | null;
  proposalType: string;
}) {
  if (!proposalBody) {
    return null;
  }

  const descriptions: Record<string, string> = {
    DeleteIdiom: "Delete this idiom.",
    AddEquivalent: "Link this idiom to the related idiom.",
    DeleteEquivalent: "Remove the link to the related idiom.",
  };

  return (
    <Alert
      className="proposalDecisionSummary"
      type={proposalType === "DeleteIdiom" ? "warning" : "info"}
      title={descriptions[proposalType] || "Review this proposal."}
      description={
        proposalBody.readOnlyEquivalentTitle ? (
          <Paragraph>
            Related idiom:{" "}
            {proposalBody.readOnlyEquivalentSlug ? (
              <Link
                to={`/idioms/${proposalBody.readOnlyEquivalentSlug}`}
              >
                {proposalBody.readOnlyEquivalentTitle}
              </Link>
            ) : (
              proposalBody.readOnlyEquivalentTitle
            )}
          </Paragraph>
        ) : undefined
      }
      showIcon
    />
  );
}
