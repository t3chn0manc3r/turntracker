import React, { Component } from 'react';
import './Characters.css';

import CharacterRow from '../CharacterRow/CharacterRow';

import axios from 'axios';
axios.defaults.withCredentials = true;

class Characters extends Component {
    constructor(props) {
        super();
        this.state = {characters:[]};
    }
    componentDidMount() {
        axios.get('http://localhost:3001/api/actor').then((res)=>{
            this.setState({characters:res.data});
        }).catch((err)=>{
            console.log(err);
        });
    }
    render() {
        var actors = this.state.characters.map((actor)=>(
            <CharacterRow key={actor._id} actor={actor} />
        ));
        return (
            <div className="Characters">
                <h2>CHARACTERS</h2>
                <button className="btn btn-primary" onClick={()=>alert("Derp")}>New Character</button>
                {actors}
            </div>
        );
    }
}

export default Characters;
