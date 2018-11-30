import React, { Component } from 'react';
import './CharacterRow.css';

class CharacterRow extends Component {
    render() {
        var actor = this.props.actor;
        return (
            <div className="CharacterRow">
                <div className="CharacterName">{"Name: "+actor.name}</div>
                <div className="HP">{"HP: "+actor.currhp+"/"+actor.hp}</div>
                <div className="AC">{"AC: "+actor.currac}</div>
                <div className="Touch">{"Touch AC: "+actor.currtouch}</div>
                <div className="Flat">{"Flat-Footed AC: "+actor.currflat}</div>
            </div>
        );
    }
}

export default CharacterRow;
