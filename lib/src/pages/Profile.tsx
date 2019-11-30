import * as React from "react";
import "./Profile.scss";
import { Avatar, Typography, Button, Spin } from "antd";
import { useState } from "react";
import { Redirect } from "react-router";
import { useCurrentUser } from "../components/withCurrentUser";
import { UserRole } from "../__generated__/types";
import { Link } from "react-router-dom";
const { Title } = Typography;

export interface ProfileProps {}
type RoleInfo = { displayName: string; description: string };

function getRoleInfo(role: UserRole | null): RoleInfo {
  let displayName = "";
  let description = "";

  switch (role) {
    case UserRole.CONTRIBUTOR:
      displayName = "Conjunction Contributor";
      description = "You can submit, edit and correlate idioms at will.";
      break;
    case UserRole.GENERAL:
      displayName = "Gerunder General";
      description =
        "You can submit, edit and correlate idioms provisionally and they must be approved before they appear on the site.";
      break;
    case UserRole.ADMIN:
      displayName = "Ardent Admin";
      description = "You can do everything including reviewing newly proposed idioms.";
      break;

    default:
      break;
  }

  return { displayName: displayName, description: description };
}

export const Profile: React.StatelessComponent<ProfileProps> = props => {
  const { currentUser, currentUserLoading, resetOnLogout } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${process.env.REACT_APP_SERVER}/logout`, { method: "POST", mode: "cors", credentials: "include" });
    } catch (e) {
      console.error(e);
    }

    await resetOnLogout!();
    setIsLoggingOut(false);
  };

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" tip="Loading..." />;
  } else if (!currentUser) {
    return <Redirect to="/" />;
  }

  const showAdminLinks = currentUser && !currentUserLoading && currentUser.role === UserRole.ADMIN;
  const role = getRoleInfo(currentUser.role);
  return (
    <>
      <Title>{currentUser.name}</Title>
      <div className="profileContent">
        <Avatar className="profilePicture" size={200} src={currentUser.avatar || ""} shape="square" />
        <div className="profileActions">
          <div>
            <h3>Role</h3>
            <div className="roleName">{role.displayName}</div>
            <div className="roleDescription">{role.description}</div>
          </div>
          <div>
            <h3>Actions</h3>
            <ul>
              {showAdminLinks && (
                <li>
                  <Link to="/admin/proposals">Review Proposals</Link>
                </li>
              )}

              <li>
                <Button type="primary" icon="poweroff" loading={isLoggingOut} onClick={logOut}>
                  Log out
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
