import React, { Component } from 'react';
import './TurnTracker.css';

import Navigation from '../Navigation/Navigation';
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
import GMPanel from '../GMPanel/GMPanel';
import PlayerPanel from '../PlayerPanel/PlayerPanel';

class TurnTracker extends Component {
    render() {
        return (
            <div className="TurnTracker">
                <Navigation />
                <h1>TURN TRACKER</h1>
                <Login />
                <SignUp />
                <GMPanel />
                <PlayerPanel />
            </div>
        );
    }
}

export default TurnTracker;
