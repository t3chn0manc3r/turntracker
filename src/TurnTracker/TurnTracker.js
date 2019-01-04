import React, { Component } from 'react';
import { Route } from "react-router-dom";
import './TurnTracker.css';

import 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import axios from 'axios';
import {login} from '../actions';

import Navigation from '../Navigation/Navigation';
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
import Characters from '../Characters/Characters';
import GMPanel from '../GMPanel/GMPanel';
import PlayerPanel from '../PlayerPanel/PlayerPanel';
import Beastiary from '../Beastiary/Beastiary';

class TurnTracker extends Component {
    componentDidMount() {
        console.log(this.props.user)
        axios.get('http://localhost:3001/api/login').then((res)=>{
            this.props.login(res.data);
        }).catch((err)=>{
            console.log(err);
        });
    }
    render() {
        if (this.props.user && this.props.user.id !== "") {
            console.log("Logged In!")
        }
        else {
            console.log("Not logged in....")
        }
        console.log(this.props.user);
        return (
            <div className="TurnTracker">
                <Navigation />
                {this.props.user.id && this.props.user.id !== "" ? (<Route path="/" exact component={Characters} />) : (<Route path="/" exact component={Login} />)}
                <Route path="/login" component={Login} />
                <Route path="/signup" component={SignUp} />
                {this.props.user.id && this.props.user.id !== "" ? (<Route path="/characters" component={Characters} />) : ""}
                {this.props.user.id && this.props.user.id !== "" ? (<Route path="/games" component={GMPanel} />) : ""}
                {this.props.user.id && this.props.user.id !== "" ? (<Route path="/player" component={PlayerPanel} />) : ""}
                {this.props.user.id && this.props.user.id !== "" ? (<Route path="/beastiary" component={Beastiary} />) : ""}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state
    }
}
const mapDispatchToProps = dispatch => {
    return {
        login: user => dispatch(login(user))
    }
}

export default withRouter(connect(mapStateToProps,mapDispatchToProps)(TurnTracker));
