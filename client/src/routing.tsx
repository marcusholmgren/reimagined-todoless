import React from "react";
import Auth from "./auth/Auth";
import { Router, Route } from "react-router-dom";
import Callback from "./components/Callback";
import * as history from "history";
import App from "./App";
const browserHistory = history.createBrowserHistory();

const auth = new Auth(browserHistory);

const handleAuthentication = (props: any) => {
  const location = props.location;
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
};

export const makeAuthRouting = () => {
  return (
    <Router history={browserHistory}>
      <div>
        <Route
          path="/callback"
          render={(props) => {
            handleAuthentication(props);
            return <Callback />;
          }}
        />
        <Route
          render={(props) => {
            return <App auth={auth} {...props} />;
          }}
        />
      </div>
    </Router>
  );
};
