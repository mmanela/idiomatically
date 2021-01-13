import "./NavCommandBar.scss";
import * as React from "react";
import { HomeOutlined, InfoCircleOutlined, LoginOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Menu, Avatar, Button } from "antd";
import { Link, RouteComponentProps } from "react-router-dom";
import { useCurrentUser } from "./withCurrentUser";

export interface NavCommandBarProps {}

type NavBarCombinedProps = RouteComponentProps<any> & NavCommandBarProps;

export const NavCommandBar: React.FunctionComponent<NavBarCombinedProps> = props => {
  const { currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser;

  return (
    <Menu mode="horizontal" selectable={false} className="navCommandBar">
      <Menu.Item key="home">
        <Link to="/">
          <HomeOutlined />
          Home
        </Link>
      </Menu.Item>
      <Menu.Item key="about">
        <Link to="/about">
          <InfoCircleOutlined />
          About
        </Link>
      </Menu.Item>

      {isLoggedIn && (
        <Menu.Item>
          <Button
            type="link"
            icon={<PlusCircleOutlined />}
            size="middle"
            onClick={() => {
              props.history.push("/new");
            }}
          >
            Add an idiom
          </Button>
        </Menu.Item>
      )}
      <Menu.Item key="user" className="userMenuItem">
        {!isLoggedIn && (
          <a href={`${process.env.REACT_APP_SERVER}/login?returnTo=${props.history.location.pathname}`}>
            <LoginOutlined />
            Login
          </a>
        )}
        {isLoggedIn && (
          <Link to="/me">
            <Avatar src={currentUser!.avatar || ""} size="small" className="profileImage" />
            {currentUser!.name}
          </Link>
        )}
      </Menu.Item>
    </Menu>
  );
};
