import React, { Component } from 'react';
import './ActorModal.css';

class ActorModal extends Component {
    render() {
        return (
            <div className="ActorModal">
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target={"#"+this.props.actor._id}>
                    Modal Version
                </button>

                <div className="modal fade" id={""+this.props.actor._id} tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div>{"Name: "+this.props.actor.name}</div>
                                <div>{"Game Type: "+(this.props.actor.gametype ? "Pathfinder":"D&D")}</div>
                                <div>{"HP: "+this.props.actor.hp}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ActorModal;
