import React from "react";
import {
  UserRole,
  OperationStatus,
  GetIdiomQuery_idiom,
  RemoveEquivalentIdiomMutation,
  RemoveEquivalentIdiomMutationVariables,
  GetCurrentUser_me
} from "../__generated__/types";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { DeleteFilled } from '@ant-design/icons';
import { Button, Typography } from "antd";
import "./EquivalentIdiomList.scss";
import {
  IdiomListRenderer,
  renderIdiomListItem,
  type IdiomListItem,
} from "./IdiomListRenderer";
const { Paragraph } = Typography;

export const removeEquivalentQuery = gql`
  mutation RemoveEquivalentIdiomMutation($idiomId: ID!, $equivalentId: ID!) {
    removeEquivalent(idiomId: $idiomId, equivalentId: $equivalentId) {
      status
      message
    }
  }
`;

interface EquivalentListProps {
  user?: GetCurrentUser_me | null;
  idiom: GetIdiomQuery_idiom;
}

export const EquivalentIdiomList: React.FunctionComponent<EquivalentListProps> = props => {
  if (props.idiom.equivalents.length <= 0) {
    return (
      <Paragraph className="content">
        No equivalent idioms across languages yet...
      </Paragraph>
    );
  }


  const ordered = [...props.idiom.equivalents].sort((a, b) => {
    if (a.language.languageName < b.language.languageName) {
      return -1;
    } else if (a.language.languageName > b.language.languageName) {
      return 1;
    }

    if (a.title < b.title) {
      return -1;
    } else if (a.title > b.title) {
      return 1;
    }

    return 0;
  });

  return (
    <IdiomListRenderer
      showSplit={false}
      listSize="small"
      paginationSize="small"
      idioms={ordered}
      pageSize={ordered.length}
      totalCount={ordered.length}
      className="equivalentList"
      renderIdiomListItem={(item) => {
        return (
          <EquivalentIdiomItem
            equivalentIdiom={item}
            idiom={props.idiom}
            user={props.user}
          />
        );
      }}
    />
  );
};

interface EquivalentItemProps {
  user?: GetCurrentUser_me | null;
  equivalentIdiom: IdiomListItem;
  idiom: GetIdiomQuery_idiom;
}
const EquivalentIdiomItem: React.FunctionComponent<EquivalentItemProps> = props => {
  const equivalent = props.equivalentIdiom;
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [
    removeEquivalentIdiomMutation,
    removeEquivalentMutationResult
  ] = useMutation<
    RemoveEquivalentIdiomMutation,
    RemoveEquivalentIdiomMutationVariables
  >(removeEquivalentQuery);
  const equivalentRemoved =
    removeEquivalentMutationResult &&
    removeEquivalentMutationResult.data &&
    removeEquivalentMutationResult.data.removeEquivalent.status ===
    OperationStatus.SUCCESS;
  if (equivalentRemoved) {
    return null;
  }
  const isAdmin = props.user && props.user.role === UserRole.ADMIN;
  const removeEquivalentHandler = (equivalentId: string) => {
    if (confirmRemove) {
      removeEquivalentIdiomMutation({
        variables: { idiomId: props.idiom.id, equivalentId: equivalentId }
      });
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
    }
  };

  const action = isAdmin && (
    <Button
      onClick={() => removeEquivalentHandler(equivalent.id)}
      type="link"
      className="removeEquivalentButton"
    >
      <DeleteFilled className="removeEquivalentIcon" />
      {confirmRemove ? "Are you sure?" : ""}
    </Button>
  );

  return renderIdiomListItem(equivalent, [action]);
};
