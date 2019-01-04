import React, { Component } from 'react';
import './GMPanel.css';
import axios from 'axios';

class GMPanel extends Component {
    constructor(props) {
        super();
        this.state = {title:"",turn:0,inBattle:false,rotation:[],inactive:[],selected:[],inactiveSelected:[],amount:0};
        this.startBattle = this.startBattle.bind(this);
        this.nextTurn = this.nextTurn.bind(this);
        this.endBattle = this.endBattle.bind(this);
        this.toggleSelected = this.toggleSelected.bind(this);
        this.toggleInactiveSelected = this.toggleInactiveSelected.bind(this);
        this.changeValue = this.changeValue.bind(this);
        this.healSelected = this.healSelected.bind(this);
        this.damageSelected = this.damageSelected.bind(this);
        this.activateSelected = this.activateSelected.bind(this);
        this.deactivateSelected = this.deactivateSelected.bind(this);
        this.toggleViewSelected = this.toggleViewSelected.bind(this);
        this.refresh = this.refresh.bind(this);
    }
    startBattle() {
        axios.put('http://localhost:3001/api/gameroom/277423/start').then((res)=>{
            this.refresh();
        }).catch((err)=>{
            console.log(err);
        });
    }
    nextTurn() {
        axios.put('http://localhost:3001/api/gameroom/277423/next').then((res)=>{
            this.refresh();
        }).catch((err)=>{
            console.log(err);
        });
    }
    endBattle(){
        axios.put('http://localhost:3001/api/gameroom/277423/end').then((res)=>{
            this.refresh();
        }).catch((err)=>{
            console.log(err);
        });
    }
    toggleSelected(ind) {
        var selected = this.state.selected;
        if (selected.includes(ind)) {
            selected.splice(selected.indexOf(ind),1);
        }
        else {
            selected.push(ind);
        }
        this.setState({selected});
    }
    toggleInactiveSelected(ind) {
        var inactiveSelected = this.state.inactiveSelected;
        if (inactiveSelected.includes(ind)) {
            inactiveSelected.splice(inactiveSelected.indexOf(ind),1);
        }
        else {
            inactiveSelected.push(ind);
        }
        this.setState({inactiveSelected});
    }
    changeValue(e) {
        this.setState({amount:parseInt(e.target.value)});
    }
    healSelected() {
        var rotation = this.state.rotation;
        this.state.selected.forEach((ind)=>{
            if (rotation[ind].actor.currhp < rotation[ind].actor.hp) {
                rotation[ind].actor.currhp += this.state.amount;
                if (rotation[ind].actor.currhp > rotation[ind].actor.hp) {
                    rotation[ind].actor.currhp = rotation[ind].actor.hp;
                }
            }
            axios.put('http://localhost:3001/api/gameroom/277423/actor/'+rotation[ind].actor._id,{currhp:rotation[ind].actor.currhp}).then((res)=>{
                this.refresh();
            }).catch((err)=>{
                console.log(err);
            });
        });
    }
    damageSelected() {
        var rotation = this.state.rotation;
        this.state.selected.forEach((ind)=>{
            rotation[ind].actor.currhp -= this.state.amount;
            axios.put('http://localhost:3001/api/gameroom/277423/actor/'+rotation[ind].actor._id,{currhp:rotation[ind].actor.currhp}).then((res)=>{
                this.refresh();
            }).catch((err)=>{
                console.log(err);
            });
        });
    }
    activateSelected() {
        var inactive = this.state.inactive;
        this.state.inactiveSelected.forEach((ind)=>{
            axios.put('http://localhost:3001/api/gameroom/277423/actor/'+inactive[ind]._id+'/activate').then((res)=>{
                this.refresh();
            }).catch((err)=>{
                console.log(err);
            });
        });
    }
    deactivateSelected() {
        var rotation = this.state.rotation;
        this.state.selected.forEach((ind)=>{
            axios.put('http://localhost:3001/api/gameroom/277423/actor/'+rotation[ind].actor._id+'/deactivate').then((res)=>{
                this.refresh();
            }).catch((err)=>{
                console.log(err);
            });
        });
    }
    toggleViewSelected() {
        var rotation = this.state.rotation;
        this.state.selected.forEach((ind)=>{
            console.log(rotation[ind]);
            if (rotation[ind].visible) {
                axios.put('http://localhost:3001/api/gameroom/277423/actor/'+rotation[ind].actor._id+'/hide').then((res)=>{
                    this.refresh();
                }).catch((err)=>{
                    console.log(err);
                });
            }
            else {
                axios.put('http://localhost:3001/api/gameroom/277423/actor/'+rotation[ind].actor._id+'/reveal').then((res)=>{
                    this.refresh();
                }).catch((err)=>{
                    console.log(err);
                });
            }

        });
    }
    refresh() {
        axios.get('http://localhost:3001/api/gameroom/277423').then((res)=>{
            console.log(res.data)
            this.setState({
                title:res.data.title,
                inBattle:res.data.incombat,
                turn: res.data.turn,
                rotation:res.data.rotation,
                inactive:res.data.inactive
            });
        }).catch((err)=>{
            console.log(err);
        });
    }
    componentDidMount() {
        this.refresh();
    }
    render() {
        var gamearr = [{title:"Test Game",id:"277423"}]
        var gameopts = gamearr.map((room,ind)=>(<option key={ind}>{room.title}</option>))
        var rows = this.state.rotation.map((actor,ind)=>{
            var view = actor.visible
            actor = actor.actor
            return (
                <tr key={actor._id}>
                    <td><input type="checkbox" onClick={(e)=>{this.toggleSelected(ind)}}/></td>
                    <td>{actor.initiative}</td>
                    <td>{actor.name + (view ? " (Visible)":"")}</td>
                    <td>{actor.currhp}/{actor.hp}</td>
                    <td>{actor.currac}</td>
                    <td>{actor.currtouch}</td>
                    <td>{actor.currflat}</td>
                </tr>
            );
        });
        var inrows = this.state.inactive.map((actor,ind)=>{
            return (
                <tr key={actor._id}>
                    <td><input type="checkbox" onClick={(e)=>{this.toggleInactiveSelected(ind)}}/></td>
                    <td>{actor.initiative}</td>
                    <td>{actor.name}</td>
                    <td>{actor.currhp}/{actor.hp}</td>
                    <td>{actor.currac}</td>
                    <td>{actor.currtouch}</td>
                    <td>{actor.currflat}</td>
                </tr>
            );
        });
        return (
            <div className="GMPanel">
                <select className="form-control">
                    {gameopts}
                </select>
                <div className="container rotation-container">
                    <div className="rotation-body">
                        <h2>GAME TITLE</h2>
                        <h3>{this.state.inBattle ? "Turn: "+this.state.turn : "Out of Battle"}</h3>
                        <button className="btn btn-success" onClick={this.startBattle}>Start</button>
                        <button className="btn btn-danger" onClick={this.endBattle}>Stop</button>
                        <button className="btn btn-info" onClick={this.nextTurn}>Next</button>
                        <button className="btn btn-info" onClick={()=>{console.log('derp')}}>Add</button>
                        <br />
                        <h2>Active</h2>
                        <input type="number" value={this.state.amount} onChange={this.changeValue}/>
                        <button className="btn btn-success" onClick={this.healSelected}>Heal</button>
                        <button className="btn btn-danger" onClick={this.damageSelected}>Damage</button>
                        <button className="btn btn-info" onClick={this.toggleViewSelected}>Toggle View</button>
                        <button className="btn btn-warning" onClick={this.deactivateSelected}>Deactivate</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Init</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">HP</th>
                                    <th scope="col">AC</th>
                                    <th scope="col">Touch</th>
                                    <th scope="col">Flat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                        <h2>Inactive</h2>
                        <button className="btn btn-primary" onClick={this.activateSelected}>Activate</button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Init</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">HP</th>
                                    <th scope="col">AC</th>
                                    <th scope="col">Touch</th>
                                    <th scope="col">Flat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inrows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default GMPanel;
