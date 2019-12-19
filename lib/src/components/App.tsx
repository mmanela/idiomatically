import * as React from "react";
import { Idiom } from "../pages/Idiom";
import "./App.scss";
import { Switch, Route, Link, RouteProps, withRouter, RouteComponentProps } from "react-router-dom";
import { Layout } from "antd";
import { IdiomListView } from "../pages/IdiomListView";
import { NavCommandBar } from "./NavCommandBar";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";
import { NewIdiom } from "../pages/NewIdiom";
import { RouteChildrenProps } from "react-router";
import { UpdateIdiom } from "../pages/UpdateIdiom";
import { ChangeProposals } from "../pages/ChangeProposals";
import { SearchBox } from "./SearchBox";
const { Header, Footer, Content } = Layout;

export interface AppProps {
  subTitle?: string;
}

function AppInternal(props: RouteComponentProps<any> & AppProps) {
  const params = new URLSearchParams(props.location!.search);
  const filter = params.get("q");
  const lang = params.get("lang");

  return (
    <Layout className="container">
      <Header>
        <h1>
          <Link to="/">Idiomatically</Link>
        </h1>
        <h2>{props.subTitle}</h2>
        <NavCommandBar {...props} />
        <SearchBox history={props.history} filter={filter} language={lang} />
      </Header>
      <Content>
        <Switch>
          <Route exact path="/" render={props => renderListView(props, filter, lang)} />
          <Route exact path="/about" component={About} />
          <Route exact path="/idioms" render={props => renderListView(props, filter, lang)} />
          <Route exact path="/idioms/:slug" component={renderIdiom} />
          <Route exact path="/new" render={props => renderNewIdiomForm(props)} />
          <Route exact path="/idioms/:slug/update" render={props => renderUpdateIdiomForm(props)} />
          <Route exact path="/me" component={Profile} />
          <Route exact path="/admin/proposals" component={ChangeProposals} />
        </Switch>
      </Content>

      <Footer>
        <span className="mainFooter">
          <span>Created by Matthew Manela </span>
          <span className="heart">♥</span>
        </span>
        {createCommonsDisplay()}
      </Footer>
    </Layout>
  );
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
const renderListView = (props: RouteProps, filter: string | null, lang: string | null) => {
  return <IdiomListView filter={filter} language={lang} />;
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
