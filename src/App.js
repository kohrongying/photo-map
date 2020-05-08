import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from "./pages/Home";
import Admin from "./pages/Admin";

function App() {
  return (
    <Switch>
      <Route exact path="/admin" component={Admin} />
      <Route path="/" component={Home} />
    </Switch>

  );
}

export default App;
