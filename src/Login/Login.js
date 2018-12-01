import React, { Component } from 'react';
import './Login.css';

import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super();
        this.state = {user:"",pass:""};
        this.handleLogin = this.handleLogin.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }
    handleLogin(e) {
        e.preventDefault();
        axios.post('http://localhost:3001/api/login',{
            user:this.state.user,
            pass:this.state.pass
        }).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }
    handleInput(e) {
        var obj = {};
        obj[e.target.id] = e.target.value
        this.setState(obj);
    }
    render() {
        return (
            <div className="Login container">
                <h2>Login</h2>
                <form onSubmit={this.handleLogin}>
                    <label>User<input id="user" type="text" value={this.state.user} onChange={this.handleInput}/></label>
                    <label>Password<input id="pass" type="password" value={this.state.pass} onChange={this.handleInput}/></label>
                    <input type="submit" value="Login"/>
                </form>
            </div>
        );
    }
}

export default Login;
