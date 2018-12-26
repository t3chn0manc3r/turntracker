import React, { Component } from 'react';
import './GMPanel.css';
import axios from 'axios';

class GMPanel extends Component {
    constructor(props) {
        super();
        this.state = {actors:[],selected:[],amount:0};
        this.toggleSelected = this.toggleSelected.bind(this);
        this.changeValue = this.changeValue.bind(this);
        this.healSelected = this.healSelected.bind(this);
        this.damageSelected = this.damageSelected.bind(this);
    }
    toggleSelected(ind) {
        var selected = this.state.selected;
        if (selected.includes(ind)) {
            selected.splice(selected.indexOf(ind),1);
        }
        else {
            selected.push(ind);
        }
        this.setState(selected);
    }
    changeValue(e) {
        this.setState({amount:parseInt(e.target.value)});
    }
    healSelected() {
        var actors = this.state.actors;
        this.state.selected.forEach((ind)=>{
            if (actors[ind].currhp < actors[ind].hp) {
                actors[ind].currhp += this.state.amount;
                if (actors[ind].currhp > actors[ind].hp) {
                    actors[ind].currhp = actors[ind].hp;
                }
            }
        })
        this.setState({actors});
    }
    damageSelected() {
        var actors = this.state.actors;
        this.state.selected.forEach((ind)=>{
            actors[ind].currhp -= this.state.amount;
        })
        this.setState({actors});
    }
    componentDidMount() {
        axios.get('http://localhost:3001/api/gameroom/277423').then((res)=>{
            this.setState({actors:res.data.rotation});
        }).catch((err)=>{
            console.log(err);
        });
    }
    render() {
        var gamearr = [{title:"Test Game",id:"277423"}]
        var gameopts = gamearr.map((room,ind)=>(<option key={ind}>{room.title}</option>))
        var rows = this.state.actors.map((actor,ind)=>{
            actor = actor.actor
            return (
                <tr key={actor._id}>
                    <td><input type="checkbox" onClick={(e)=>{this.toggleSelected(ind)}}/></td>
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
                        <input type="number" value={this.state.amount} onChange={this.changeValue}/>
                        <button className="btn btn-success" onClick={this.healSelected}>Heal</button>
                        <button className="btn btn-danger" onClick={this.damageSelected}>Damage</button>
                        <button className="btn btn-info" onClick={this.damageSelected}>Toggle View</button>
                        <button className="btn btn-warning" onClick={this.damageSelected}>Deactivate</button>
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
                    </div>
                </div>
            </div>
        );
    }
}

export default GMPanel;
