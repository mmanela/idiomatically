import * as React from "react";
import { Idiom } from "../pages/Idiom";
import "./App.scss";
import {
  Switch,
  Route,
  Link,
  RouteProps,
  withRouter,
  RouteComponentProps
} from "react-router-dom";
import { Layout, Input } from "antd";
import { IdiomListView } from "../pages/IdiomListView";
import { NavCommandBar } from "./NavCommandBar";
import { withCurrentUser, WithCurrentUserProps } from "./withCurrentUser";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";
import { NewIdiom } from "../pages/NewIdiom";
import { RouteChildrenProps } from "react-router";
import { UpdateIdiom } from "../pages/UpdateIdiom";
const { Header, Footer, Content } = Layout;
const { Search } = Input;

const subTitles = [
  "Taking language with a grain of salt",
  "The horse of a different color",
  "The pot calling the kettle black",
  "Reaping what it sows",
  "The cart before the horse",
  "The perfect storm",
  "Letting the cat out of the bag",
  "The elephant in the room",
  "The penny for your thoughts",
  "Barking up the wrong tree",
  "On a wild goose chase",
  "Putting its eggs in one basket",
  "Crying over spilt milk",
  "Catching more flies with honey than with vinegar",
  "Looking before it leaps",
  "Saving up for a rainy-day"
];
const subTitle = subTitles[Math.floor(Math.random() * subTitles.length)];

function AppInternal(
  props: RouteComponentProps<any> & WithCurrentUserProps<{}>
) {
  return (
    <Layout className="container">
      <Header>
        <h1>
          <Link to="/">Idiomatically</Link>
        </h1>
        <h2>{subTitle}</h2>
        <NavCommandBar {...props} />
        <Search
          placeholder="Find an idiom"
          size="large"
          enterButton
          onSearch={value =>
            props.history.push({ pathname: "/idioms", search: `?q=${value}` })
          }
        />
      </Header>
      <Content>
        <Switch>
          <Route exact path="/" render={renderListView} />
          <Route exact path="/about" component={About} />
          <Route exact path="/idioms" render={renderListView} />
          <Route exact path="/idioms/:slug" component={renderIdiom} />
          <Route
            exact
            path="/new"
            render={props => renderNewIdiomForm(props)}
          />
          <Route
            exact
            path="/idioms/:slug/update"
            render={props => renderUpdateIdiomForm(props)}
          />
          <Route exact path="/me" component={withCurrentUser(Profile)} />
        </Switch>
      </Content>

      <Footer>
        <span>Created by Matthew Manela (For the </span>
        <span className="heart">♥</span>
        <span> of Idioms)</span>
      </Footer>
    </Layout>
  );
}
// Wrap the app with the router to get access to the history object
export const App = withRouter(withCurrentUser(AppInternal));
const WrappedIdiom = withCurrentUser(Idiom);
const renderIdiom = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;
  return <WrappedIdiom {...props} slug={slug} />;
};
const renderListView = (props: RouteProps) => {
  const params = new URLSearchParams(props.location!.search);
  const filter = params.get("q");

  return <IdiomListView filter={filter} />;
};

const WrappedNewIdiomForm = withCurrentUser(NewIdiom);
const renderNewIdiomForm = (props: RouteProps) => {
  const params = new URLSearchParams(props.location!.search);
  const equivilentIdiomId = params.get("equivilentIdiomId");

  return <WrappedNewIdiomForm equivilentIdiomId={equivilentIdiomId!} />;
};

const WrappedUpdateIdiomForm = withCurrentUser(UpdateIdiom);
const renderUpdateIdiomForm = (props: RouteChildrenProps<any>) => {
  const { slug } = props!.match!.params;

  return <WrappedUpdateIdiomForm slug={slug!} />;
};
