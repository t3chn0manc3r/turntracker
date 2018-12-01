import React, { Component } from 'react';
import './Beastiary.css';

import MonsterRow from '../MonsterRow/MonsterRow';

import axios from 'axios';
axios.defaults.withCredentials = true;

class Beastiary extends Component {
    constructor(props) {
        super();
        this.state = {monsters:[]};
    }
    componentDidMount() {
        axios.get('http://localhost:3001/api/monster').then((result)=>{
            this.setState({monsters:result.data});
        }).catch((err)=>{
            console.log(err);
        });
    }
    render() {
        var monsters = this.state.monsters.map((monster)=>(
            <MonsterRow key={monster._id} monster={monster} />
        ));
        return (
            <div className="Beastiary">
                <h2>BEASTIARY</h2>
                {monsters}
            </div>
        );
    }
}

export default Beastiary;
