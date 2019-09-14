import "./NavCommandBar.scss";
import * as React from "react";
import { Menu, Icon, Avatar, Button } from "antd";
import { ClickParam } from "antd/lib/menu";
import { Link, RouteComponentProps } from "react-router-dom";
import { WithCurrentUserProps } from "./withCurrentUser";

export interface NavCommandBarProps {
}

type NavBarCombinedProps = RouteComponentProps<any> & WithCurrentUserProps<NavCommandBarProps>

export const NavCommandBar: React.StatelessComponent<
NavBarCombinedProps
> = props => {
  const { currentUser } = props;
  const isLoggedIn = !!currentUser;

  return (
    <Menu
      onClick={handleClick}
      mode="horizontal"
      selectable={false}
      className="navCommandBar"
    >
      <Menu.Item key="home">
        <Link to="/">
          <Icon type="home" />
          Home
        </Link>
      </Menu.Item>
      <Menu.Item key="about">
        <Link to="/about">
          <Icon type="info-circle" />
          About
        </Link>
      </Menu.Item>
      <Menu.Item key="user" className="userMenuItem">
        {!isLoggedIn && (
          <a href={`${process.env.REACT_APP_SERVER}/auth/google`}>
            <Icon type="login" />
            Login
          </a>
        )}
        {isLoggedIn && (
          <Link to="/me">
            <Avatar
              src={currentUser!.avatar || ""}
              size="small"
              className="profileImage"
            />
            {currentUser!.name}
          </Link>
        )}
      </Menu.Item>
      {isLoggedIn && (
        <Menu.Item>
          <Button
            type="link"
            icon="plus-circle"
            size="default"
            onClick={() => {
                props.history.push("/new");
            }}
          >
            Add an Idiom
          </Button>
        </Menu.Item>
      )}
    </Menu>
  );
};

const handleClick = (e: ClickParam) => {
  if (e.key === "user") {
  }
};