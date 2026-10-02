import { GithubOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout } from "antd";
import { useCallback, useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import { DEFAULT_PAGE_TITLE } from "../constants";
import "./App.scss";
import { NavCommandBar } from "./NavCommandBar";
import { SearchBox } from "./SearchBox";

const { Header, Footer, Content } = Layout;

const theme = {
  token: {
    colorPrimary: "#1890ff",
    fontFamily:
      '"Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif',
  },
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const queryFilter = searchParams.get("q");
  const queryLang = searchParams.get("lang");

  const updateSearchParams = useCallback(
    (lang: string | null, filter: string | null) => {
      const nextSearchParams = new URLSearchParams();
      if (filter) {
        nextSearchParams.set("q", filter);
      }
      if (lang) {
        nextSearchParams.set("lang", lang);
      }
      navigate({
        pathname: "/idioms",
        search: nextSearchParams.toString(),
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (!location.pathname.startsWith("/idioms/")) {
      document.title = DEFAULT_PAGE_TITLE;
    }
  }, [location.pathname]);

  return (
    <ConfigProvider theme={theme}>
      <Layout className="container">
        <Header>
          <h1>
            <Link to="/">Idiomatically</Link>
          </h1>
          <h2>Explore idioms translated across languages and countries</h2>
          <NavCommandBar />
          <SearchBox
            onSearch={(value) => updateSearchParams(queryLang, value)}
            onLanguageChange={(value) =>
              updateSearchParams(value, queryFilter)
            }
            filter={queryFilter}
            language={queryLang}
          />
        </Header>
        <Content>
          <Outlet />
        </Content>

        <Footer className="mainFooter">
          <span className="creatorFooter">
            <span>
              Created by{" "}
              <a href="https://matthewmanela.com/" className="nameLink">
                Matthew Manela
              </a>{" "}
            </span>
            <span className="heart">♥</span>
          </span>
          <a
            className="github"
            rel="source"
            href="https://github.com/mmanela/idiomatically"
          >
            <span>
              <GithubOutlined /> View on Github
            </span>
          </a>
          <span className="creativeCommons">
            <a
              rel="license"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
            >
              <img
                alt="Creative Commons License"
                style={{ borderWidth: 0, verticalAlign: "text-bottom" }}
                src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png"
              />
            </a>
          </span>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
