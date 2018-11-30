import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TurnTracker from './TurnTracker/TurnTracker';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';

ReactDOM.render(<BrowserRouter><TurnTracker /></BrowserRouter>, document.getElementById('root'));

serviceWorker.unregister();
