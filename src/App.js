// Import React!
import React from 'react';
import { Group } from './components/Group';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to={`/groups/${Date.now()}`} />
        </Route>
        <Route exact path="/groups/:groupId">
          <Group />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
