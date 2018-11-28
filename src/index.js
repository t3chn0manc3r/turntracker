import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TurnTracker from './TurnTracker/TurnTracker';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<TurnTracker />, document.getElementById('root'));

serviceWorker.unregister();
