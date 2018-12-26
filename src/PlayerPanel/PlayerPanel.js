import React, { Component } from 'react';
import './PlayerPanel.css';

import axios from 'axios';

import CharacterRow from '../CharacterRow/CharacterRow'

class PlayerPanel extends Component {
    constructor(props) {
        super();
        this.state = {rotation:[]}
    }
    componentDidMount() {
        axios.get('http://localhost:3001/api/gameroom/277423').then((res)=>{
            this.setState({rotation:res.data.rotation});
        }).catch((err)=>{
            console.log(err);
        })
    }
    render() {
        var rot = this.state.rotation.map((ent,ind)=>
            (<CharacterRow key={ind} actor={ent.actor} view={ent.visible}/>)
        );
        return (
            <div className="PlayerPanel">
                <h2>Player Panel</h2>
                <h3>Rotation</h3>
                {rot}
            </div>
        );
    }
}

export default PlayerPanel;
