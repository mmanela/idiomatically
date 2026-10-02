import {
  HomeOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router";
import "./NavCommandBar.scss";
import { useCurrentUser } from "./withCurrentUser";

export function NavCommandBar() {
  const { currentUser } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(currentUser);

  return (
    <Menu
      mode="horizontal"
      selectable={false}
      className="navCommandBar"
      items={[
        {
          key: "home",
          label: (
            <Link to="/" style={{ display: "inline-flex", gap: 6 }}>
              <HomeOutlined /> Home
            </Link>
          ),
        },
        {
          key: "about",
          label: (
            <Link to="/about" style={{ display: "inline-flex", gap: 6 }}>
              <InfoCircleOutlined /> About
            </Link>
          ),
        },
        ...(isLoggedIn
          ? [
              {
                key: "add",
                label: (
                  <Button
                    type="link"
                    icon={<PlusCircleOutlined />}
                    size="middle"
                    style={{ display: "inline-flex", gap: 6 }}
                    onClick={() => navigate("/new")}
                  >
                    Add an idiom
                  </Button>
                ),
              },
            ]
          : []),
        {
          key: "user",
          className: "userMenuItem",
          label: !isLoggedIn ? (
            <a
              style={{ display: "inline-flex", gap: 6 }}
              href={`/login?returnTo=${encodeURIComponent(
                `${location.pathname}${location.search}`,
              )}`}
            >
              <LoginOutlined /> Login
            </a>
          ) : (
            <Link to="/me" style={{ display: "inline-flex", gap: 6 }}>
              <Avatar
                src={currentUser?.avatar || ""}
                size="small"
                className="profileImage"
              />{" "}
              {currentUser?.name}
            </Link>
          ),
        },
      ]}
    />
  );
}
