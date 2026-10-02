import * as React from "react";
import "./Profile.scss";
import { PoweroffOutlined } from '@ant-design/icons';
import { Avatar, Typography, Button, Spin } from "antd";
import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useCurrentUser } from "../components/withCurrentUser";
import { UserRole } from "../__generated__/types";
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

export const Profile: React.FunctionComponent<ProfileProps> = props => {
  const { currentUser, currentUserLoading, resetOnLogout } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error(e);
    }

    await resetOnLogout!();
    setIsLoggingOut(false);
  };

  if (currentUserLoading) {
    return <Spin spinning delay={500} className="middleSpinner" description="Loading..." />;
  } else if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const showAdminLinks = currentUser && !currentUserLoading && currentUser.role === UserRole.ADMIN;
  const role = getRoleInfo(currentUser.role);
  return <>
    <Title>{currentUser.name}</Title>
    <div className="profileContent">
      <Avatar className="profilePicture" size={150} src={currentUser.avatar || ""} shape="square" />
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
              <Button type="primary" icon={<PoweroffOutlined />} loading={isLoggingOut} onClick={logOut}>
                Log out
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </>;
};
