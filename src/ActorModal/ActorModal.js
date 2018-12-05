import React, { Component } from 'react';
import './ActorModal.css';

class ActorModal extends Component {
    constructor(props) {
        super();
        this.state = {
            name:props.actor.name,
            hp:props.actor.hp,
            currhp:props.actor.currhp,
            ac:props.actor.ac,
            currac:props.actor.currac,
            touch:props.actor.touch,
            currtouch:props.actor.currtouch,
            flat:props.actor.flat,
            currflat:props.actor.currflat,
            initiative:props.actor.initiative,
            initmod:props.actor.initmod,
            dexmod:props.actor.dexmod
        }
        this.updateName = this.updateName.bind(this);
        this.updateHP = this. updateHP.bind(this);
        this.updateCurrHP = this.updateCurrHP.bind(this);
        this.updateAC = this.updateAC.bind(this);
        this.updateCurrAC = this.updateCurrAC.bind(this);
        this.updateTouch = this.updateTouch.bind(this);
        this.updateCurrTouch = this.updateCurrTouch.bind(this);
        this.updateFlat = this.updateFlat.bind(this);
        this.updateCurrFlat = this.updateCurrFlat.bind(this);
        this.updateInit = this.updateInit.bind(this);
        this.updateInitMod = this.updateInitMod.bind(this);
        this.updateDexMod = this.updateDexMod.bind(this);
    }
    updateName(e) {
        this.setState({name:e.target.value});
    }
    updateHP(e) {
        this.setState({hp:e.target.value});
    }
    updateCurrHP(e) {
        this.setState({currhp:e.target.value});
    }
    updateAC(e) {
        this.setState({ac:e.target.value});
    }
    updateCurrAC(e) {
        this.setState({currac:e.target.value});
    }
    updateTouch(e) {
        this.setState({touch:e.target.value});
    }
    updateCurrTouch(e) {
        this.setState({currtouch:e.target.value});
    }
    updateFlat(e) {
        this.setState({flat:e.target.value});
    }
    updateCurrFlat(e) {
        this.setState({currflat:e.target.value});
    }
    updateInit(e) {
        this.setState({initiative:e.target.value});
    }
    updateInitMod(e) {
        this.setState({initmod:e.target.value});
    }
    updateDexMod(e) {
        this.setState({dexmod:e.target.value});
    }
    render() {
        return (
            <div className="ActorModal">
                <div className="modal fade" id={"m"+this.props.actor._id} tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content ActorModalContent">
                            <div className="modal-body ActorModalBody">
                                <div>Name: <input className="name-input" type="text" value={this.state.name} onChange={this.updateName}/></div>
                                <div>{"Game Type: "+(this.props.actor.gametype ? "Pathfinder":"D&D")}</div>
                                <div>HP: <input className="num-input" type="number" value={this.state.currhp} onChange={this.updateCurrHP}/>/<input className="num-input" type="number" value={this.state.hp} onChange={this.updateHP}/></div>
                                <div>AC: <input className="num-input" type="number" value={this.state.currac} onChange={this.updateCurrAC}/> (<input className="num-input" type="number" value={this.state.ac} onChange={this.updateAC}/>)</div>
                                <div>Touch: <input className="num-input" type="number" value={this.state.currtouch} onChange={this.updateCurrTouch}/> (<input className="num-input" type="number" value={this.state.touch} onChange={this.updateTouch}/>)</div>
                                <div>Flat: <input className="num-input" type="number" value={this.state.currflat} onChange={this.updateCurrFlat}/> (<input className="num-input" type="number" value={this.state.flat} onChange={this.updateFlat}/>)</div>
                                <div>Init: <input className="num-input" type="number" value={this.state.initiative} onChange={this.updateInit}/></div>
                                <div>Init Mod: <input className="num-input" type="number" value={this.state.initmod} onChange={this.updateInitMod}/></div>
                                <div>Dex Mod: <input className="num-input" type="number" value={this.state.dexmod} onChange={this.updateDexMod}/></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ActorModal;
