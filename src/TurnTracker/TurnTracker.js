import React, { Component } from 'react';
import { Route } from "react-router-dom";
import './TurnTracker.css';

import Navigation from '../Navigation/Navigation';
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
import Characters from '../Characters/Characters';
import GMPanel from '../GMPanel/GMPanel';
import PlayerPanel from '../PlayerPanel/PlayerPanel';
import Beastiary from '../Beastiary/Beastiary';

class TurnTracker extends Component {
    render() {
        return (
            <div className="TurnTracker">
                <Navigation />
                <Route exact path="/" component={Login} />
                <Route path="/signup" component={SignUp} />
                <Route path="/characters" component={Characters} />
                <Route path="/games" component={GMPanel} />
                <Route path="/player" component={PlayerPanel} />
                <Route path="/beastiary" component={Beastiary} />
            </div>
        );
    }
}

export default TurnTracker;
