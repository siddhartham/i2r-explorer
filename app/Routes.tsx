import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import SettingsPage from './containers/SettingsPage';

export default function Routes() {
  return (
    <App>
      <HashRouter>
        <Route path={routes.HOME} component={HomePage} />
        <Route path={routes.SETTINGS} component={SettingsPage} />
      </HashRouter>
    </App>
  );
}
