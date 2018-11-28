import React, { Component } from 'react';
import './TurnTracker.css';

import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';

class TurnTracker extends Component {
    render() {
        return (
            <div className="TurnTracker">
                <h1>TURN TRACKER</h1>
                <Login />
                <SignUp />
            </div>
        );
    }
}

export default TurnTracker;
