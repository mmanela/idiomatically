import * as React from "react";
import { Idiom } from "../pages/Idiom";
import "./App.scss";
import { Switch, Route, Link, RouteProps, withRouter, RouteComponentProps } from "react-router-dom";
import { Layout, Input } from "antd";
import { IdiomListView } from "../pages/IdiomListView";
import { NavCommandBar } from "./NavCommandBar";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";
import { NewIdiom } from "../pages/NewIdiom";
import { RouteChildrenProps } from "react-router";
import { UpdateIdiom } from "../pages/UpdateIdiom";
import { ChangeProposals } from "../pages/ChangeProposals";
//import { ChangeProposals } from "../pages/ChangeProposals";
const { Header, Footer, Content } = Layout;
const { Search } = Input;

export interface AppProps {
  subTitle?: string;
}

function AppInternal(props: RouteComponentProps<any> & AppProps) {
  return (
    <Layout className="container">
      <Header>
        <h1>
          <Link to="/">Idiomatically</Link>
        </h1>
        <h2>{props.subTitle}</h2>
        <NavCommandBar {...props} />
        <Search
          placeholder="Find an idiom"
          size="large"
          enterButton
          onSearch={value => props.history.push({ pathname: "/idioms", search: `?q=${value}` })}
        />
      </Header>
      <Content>
        <Switch>
          <Route exact path="/" render={renderListView} />
          <Route exact path="/about" component={About} />
          <Route exact path="/idioms" render={renderListView} />
          <Route exact path="/idioms/:slug" component={renderIdiom} />
          <Route exact path="/new" render={props => renderNewIdiomForm(props)} />
          <Route exact path="/idioms/:slug/update" render={props => renderUpdateIdiomForm(props)} />
          <Route exact path="/me" component={Profile} />
          <Route exact path="/admin/proposals" component={ChangeProposals} />
        </Switch>
      </Content>

      <Footer>
        <span>Created by Matthew Manela (I </span>
        <span className="heart">♥</span>
        <span> Idioms)</span>
      </Footer>
    </Layout>
  );
}
// Wrap the app with the router to get access to the history object
export const App = withRouter(AppInternal);
const renderIdiom = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;
  return <Idiom {...props} slug={slug} />;
};
const renderListView = (props: RouteProps) => {
  const params = new URLSearchParams(props.location!.search);
  const filter = params.get("q");

  return <IdiomListView filter={filter} />;
};

const renderNewIdiomForm = (props: RouteProps) => {
  const params = new URLSearchParams(props.location!.search);
  const equivilentIdiomId = params.get("equivilentIdiomId");

  return <NewIdiom equivilentIdiomId={equivilentIdiomId!} />;
};

const renderUpdateIdiomForm = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;

  return <UpdateIdiom slug={slug!} />;
};
