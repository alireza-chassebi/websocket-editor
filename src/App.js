// Import React!
import React from 'react';
import { Group } from './components/Group';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Route exact path="/">
        <Redirect to={`/groups/${Date.now()}`} />
      </Route>
      <Route exact path="/groups/:groupId">
        <Group />
      </Route>
    </BrowserRouter>
  );
};
