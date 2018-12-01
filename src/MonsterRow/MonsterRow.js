import React, { Component } from 'react';
import './MonsterRow.css';

class MonsterRow extends Component {
    render() {
        var monster = this.props.monster;
        return (
            <div className="MonsterRow">
                <div className="MonsterName">{"Name: "+monster.name}</div>
                <div className="CR">{"CR: "+monster.cr}</div>
                <div className="HP">{"HP: "+monster.hp}</div>
                <div className="AC">{"AC: "+monster.ac}</div>
                <div className="Touch">{"Touch AC: "+monster.touch}</div>
                <div className="Flat">{"Flat-Footed AC: "+monster.flat}</div>
            </div>
        );
    }
}

export default MonsterRow;
