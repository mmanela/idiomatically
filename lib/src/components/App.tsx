import { GithubOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout } from "antd";
import { useCallback, useEffect } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router";
import type { GetCurrentUser } from "../__generated__/types";
import { graphqlRequest } from "../graphql.server";
import "./App.scss";
import { NavCommandBar } from "./NavCommandBar";
import { SearchBox } from "./SearchBox";
import { getCurrentUserQuery } from "./withCurrentUser";
import { getLanguagePath } from "../utilities/languageUtil";

const { Header, Footer, Content } = Layout;

const theme = {
  token: {
    colorPrimary: "#1890ff",
    fontFamily:
      '"Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif',
  },
};

export function loader({ request }: LoaderFunctionArgs) {
  return graphqlRequest<GetCurrentUser, Record<string, never>>(
    request,
    getCurrentUserQuery,
    {},
  );
}

export default function App() {
  const initialCurrentUser = useLoaderData<typeof loader>().me;
  const location = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const queryFilter = searchParams.get("q");
  const routeSeo = matches
    .map(
      (match) =>
        match.loaderData as
          | { seo?: { languageKey?: string; languageName?: string } }
          | undefined,
    )
    .find((data) => data?.seo?.languageKey)?.seo;
  const queryLang = routeSeo?.languageKey || "en";

  const updateSearchParams = useCallback(
    (lang: string | null, languageName: string | null, filter: string | null) => {
      const nextSearchParams = new URLSearchParams();
      if (filter) {
        nextSearchParams.set("q", filter);
      }
      const pathname =
        !lang || lang === "all"
          ? "/idioms"
          : getLanguagePath(languageName || lang);
      navigate({
        pathname,
        search: nextSearchParams.toString(),
      });
    },
    [navigate],
  );

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    document.documentElement.dataset.route =
      `${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  return (
    <ConfigProvider theme={theme}>
      <Layout className="container">
        <Header>
          <div className="siteTitle">
            <Link to="/">Idiomatically</Link>
          </div>
          <h2>Explore idioms translated across languages and countries</h2>
          <NavCommandBar initialCurrentUser={initialCurrentUser} />
          <SearchBox
            onSearch={(value) =>
              updateSearchParams(
                queryLang,
                routeSeo?.languageName || null,
                value,
              )
            }
            onLanguageChange={(value, languageName) =>
              updateSearchParams(value, languageName, queryFilter)
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
