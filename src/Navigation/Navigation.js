import React, { Component } from 'react';
import './Navigation.css';

import {Link} from 'react-router-dom';

class Navigation extends Component {
    render() {
        return (
            <div className="Navigation">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <Link className="navbar-brand" to="/signup">Turn Tracker</Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <Link className="nav-link" to="/">Home <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/characters">Characters</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/beastiary">Beastiary</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/games">Games</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/player">Player</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}

export default Navigation;
