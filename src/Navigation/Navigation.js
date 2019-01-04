import React, { Component } from 'react';
import './Navigation.css';

import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';
import {logout} from '../actions';

class Navigation extends Component {
    render() {
        return (
            <div className="Navigation">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <NavLink className="navbar-brand" to="/signup">Turn Tracker</NavLink>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <NavLink className="nav-link" to="/">Home <span className="sr-only">(current)</span></NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/characters">Characters</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/beastiary">Beastiary</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/games">Games</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/player">Player</NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}

const mapStateToProps = state => ({
  user: state
})

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
})

export default connect(mapStateToProps,mapDispatchToProps)(Navigation);
