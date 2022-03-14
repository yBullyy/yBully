import React, {useEffect} from 'react';
import {
  Router,
} from '../../node_modules/react-chrome-extension-router/dist/index';
import Popup from './popup/Popup';

const App = () => {
  return (
    <Router>
      <Popup />
    </Router>
  );
};

export default App
