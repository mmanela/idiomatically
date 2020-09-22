import * as React from "react";
import { Idiom } from "../pages/Idiom";
import "./App.scss";
import { Switch, Route, Link, RouteProps, withRouter, RouteComponentProps } from "react-router-dom";
import { Layout, Empty } from "antd";
import { IdiomListView } from "../pages/IdiomListView";
import { NavCommandBar } from "./NavCommandBar";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";
import { NewIdiom } from "../pages/NewIdiom";
import { RouteChildrenProps } from "react-router";
import { UpdateIdiom } from "../pages/UpdateIdiom";
import { ChangeProposals } from "../pages/ChangeProposals";
import { SearchBox } from "./SearchBox";
import { useCallback } from "react";
import { GithubOutlined } from "@ant-design/icons";
import { DEFAULT_PAGE_TITLE } from "../constants";
const { Header, Footer, Content } = Layout;

export interface AppProps {
  subTitle?: string;
}

function AppInternal(props: RouteComponentProps<any> & AppProps) {
  const params = new URLSearchParams(props.location!.search);
  const queryFilter = params.get("q");
  const queryLang = params.get("lang");
  const queryPage = params.get("page");

  const updateSearchParams = useCallback((lang: string | null, filter: string | null, page?: string | null) => {
    let search = `?`;
    const params = [];
    if (filter) {
      params.push(`q=${filter}`);
    }
    if (lang) {
      params.push(`lang=${lang}`);
    }
    if (page) {
      params.push(`page=${page}`);
    }
    search += params.reduce((prev, curr) => `${prev}&${curr}`);
    props.history.push({ pathname: "/idioms", search: search });
  }, [props.history]);

  const onPageChange = useCallback((value: string) => {
    updateSearchParams(queryLang, queryFilter, value);
  }, [queryLang, queryFilter, updateSearchParams]);

  const onSearchChange = useCallback((value: string) => {
    updateSearchParams(queryLang, value);
  }, [queryLang, updateSearchParams]);

  const onLanguageChange = useCallback((value: string) => {
    updateSearchParams(value, queryFilter);
  }, [queryFilter, updateSearchParams]);


  if (window && window.document && window.document.title && props.location.pathname.indexOf("/idioms/") === -1) {
    window.document.title = DEFAULT_PAGE_TITLE;
  }

  return (
    <Layout className="container">
      <Header>
        <h1>
          <Link to="/">Idiomatically</Link>
        </h1>
        <h2>Explore how idioms are translated across languages and countries</h2>
        <NavCommandBar {...props} />
        <SearchBox onSearch={onSearchChange} onLanguageChange={onLanguageChange} filter={queryFilter} language={queryLang} />
      </Header>
      <Content>
        <Switch>
          <Route exact path="/" render={props => renderListView(props, queryFilter, queryLang, queryPage, onPageChange)} />
          <Route exact path="/about" component={About} />
          <Route exact path="/idioms" render={props => renderListView(props, queryFilter, queryLang, queryPage, onPageChange)} />
          <Route exact path="/idioms/:slug" component={renderIdiom} />
          <Route exact path="/new" render={props => renderNewIdiomForm(props)} />
          <Route exact path="/idioms/:slug/update" render={props => renderUpdateIdiomForm(props)} />
          <Route exact path="/me" component={Profile} />
          <Route exact path="/admin/proposals" component={ChangeProposals} />
          <Route path="/" component={NotFoundView} />
        </Switch>
      </Content>

      <Footer className="mainFooter">
        <span className="creatorFooter">
          <span>Created by <a href="https://matthewmanela.com/" className="nameLink">Matthew Manela</a> </span>
          <span className="heart">♥</span>
        </span>
        {githubLink()}
        {createCommonsDisplay()}
      </Footer>
    </Layout>
  );
}

const NotFoundView = () => {
  return (
    <Empty
      className="empty404"
      image="/static/dog404.jpg"
      description="Looks like you went barking up the wrong tree."
    />
  );
}

const githubLink = () => {
  return <a className="github" rel="source" href="https://github.com/mmanela/idiomatically">
    <span><GithubOutlined /> View on Github</span></a>;
}

const createCommonsDisplay = () => {
  return (
    <span className="creativeCommons">
      <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
        <img
          alt="Creative Commons License"
          style={{ borderWidth: 0, verticalAlign: "text-bottom" }}
          src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png"
        />
      </a>
    </span>
  );
};

// Wrap the app with the router to get access to the history object
export const App = withRouter(AppInternal);
const renderIdiom = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;
  return <Idiom {...props} slug={slug} />;
};
const renderListView = (props: RouteProps, filter: string | null, lang: string | null, page: string | null, onPageChange: ((page: string) => void)) => {
  return <IdiomListView filter={filter} language={lang} page={page} onPageChange={onPageChange} />;
};

const renderNewIdiomForm = (props: RouteProps) => {
  const params = new URLSearchParams(props.location!.search);
  const equivalentIdiomId = params.get("equivalentIdiomId");

  return <NewIdiom equivalentIdiomId={equivalentIdiomId!} />;
};

const renderUpdateIdiomForm = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;

  return <UpdateIdiom slug={slug!} />;
};
