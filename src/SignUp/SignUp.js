import React, { Component } from 'react';
import './SignUp.css';

import axios from 'axios';

class SignUp extends Component {
    constructor(props) {
        super();
        this.state = {name:"",user:"",pass:""};
        this.handleSignUp = this.handleSignUp.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }
    handleSignUp(e) {
        e.preventDefault();
        axios.post('http://localhost:3001/api/signup',{
         name:this.state.name,
         user:this.state.user,
         pass:this.state.pass}).then((res)=>{
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
            <div className="SignUp">
                <h2>Sign Up</h2>
                <form onSubmit={this.handleSignUp}>
                    <label>Name<input id="name" type="text" value={this.state.name} onChange={this.handleInput}/></label>
                    <label>Username<input id="user" type="text" value={this.state.user} onChange={this.handleInput}/></label>
                    <label>Password<input id="pass" type="password" value={this.state.pass} onChange={this.handleInput}/></label>
                    <input type="submit" value="Sign Up"/>
                </form>
            </div>
        );
    }
}

export default SignUp;
