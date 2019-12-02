import React from "react";
import { LanguageFlags } from "./LanguageFlags";
import {
  UserRole,
  OperationStatus,
  GetIdiomQuery_idiom,
  RemoveEquivalentIdiomMutation,
  RemoveEquivalentIdiomMutationVariables,
  GetCurrentUser_me,
  GetIdiomQuery_idiom_equivalents
} from "../__generated__/types";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Button, Icon, Typography } from "antd";
import gql from "graphql-tag";
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

export const EquivalentIdiomList: React.StatelessComponent<EquivalentListProps> = props => {
  if (props.idiom.equivalents.length <= 0) {
    return <Paragraph className="content">No equivalent idioms across languages yet...</Paragraph>;
  }

  const ordered = props.idiom.equivalents.sort((a, b) => {
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
    <ul className="equivalentList">
      {ordered.length > 0 && ordered.map(x => <EquivalentIdiomItem equivalentIdiom={x} idiom={props.idiom} user={props.user} />)}
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
