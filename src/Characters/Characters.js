import React, { Component } from 'react';
import './Characters.css';

import axios from 'axios';

class Characters extends Component {
    constructor(props) {
        super();
        this.state = {chracters:[]};
    }
    componentDidMount() {
        axios.get('http://localhost:3001/api/login').then((res)=>{
            console.log(res.data);
        });
        axios.get('http://localhost:3001/api/actor').then((actors)=>{
            console.log(actors);
        }).catch((err)=>{
            console.log(err);
        });
    }
    render() {
        return (
            <div className="Characters">
                <h2>CHARACTERS</h2>
            </div>
        );
    }
}

export default Characters;
