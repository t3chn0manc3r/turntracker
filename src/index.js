import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import userStore from './reducers';
import TurnTracker from './TurnTracker/TurnTracker';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';

const store = createStore(userStore);

ReactDOM.render(<Provider store={store}><BrowserRouter><TurnTracker /></BrowserRouter></Provider>, document.getElementById('root'));

serviceWorker.unregister();
