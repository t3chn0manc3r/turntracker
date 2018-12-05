import React, { Component } from 'react';
import './CharacterRow.css';

import ActorModal from '../ActorModal/ActorModal';

//Add functionality for D&D and drop touch ac
class CharacterRow extends Component {
    render() {
        var actor = this.props.actor;
        var per = parseInt((actor.currhp * 100) / actor.hp);
        var status="bg-success";
        if (per < 25) {
            status = "bg-danger";
        }
        else if (per < 50) {
            status = "bg-warning";
        }
        var acchange = "",touchchange="",flatchange="";
        if (actor.currac > actor.ac) {
            acchange = " inc";
        }
        else if (actor.currac < actor.ac) {
            acchange = " dec";
        }
        if (actor.currtouch > actor.touch) {
            touchchange = " inc";
        }
        else if (actor.currtouch < actor.touch) {
            touchchange = " dec";
        }
        if (actor.currflat > actor.flat) {
            flatchange = " inc";
        }
        else if (actor.currflat < actor.flat) {
            flatchange = " dec";
        }
        return (
            <div>
                <div className="CharacterRow" data-toggle="modal" data-target={"#m"+this.props.actor._id}>
                    <div className="Name d-inline-block">{actor.name}</div>
                    <div className="HP d-inline-block icon">
                        <div className="icon-label">HP</div>
                        <div className="icon-value">{actor.currhp+"/"+actor.hp}</div>
                    </div>
                    <div className={"AC d-inline-block icon"+acchange}>
                        <div className="icon-label">AC</div>
                        <div className="icon-value">{actor.currac}</div>
                    </div>
                    <div className={"Touch d-inline-block icon"+touchchange}>
                        <div className="icon-label">Touch</div>
                        <div className="icon-value">{actor.currtouch}</div>
                    </div>
                    <div className={"Flat d-inline-block icon"+flatchange}>
                        <div className="icon-label">Flat</div>
                        <div className="icon-value">{actor.currflat}</div>
                    </div>

                    <div className="progress health-bar">
                        <div className={"progress-bar "+status} role="progressbar" style={{width:per+"%"}} aria-valuenow={per+""} aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <ActorModal actor={actor}/>
            </div>
        );
    }
}

export default CharacterRow;
