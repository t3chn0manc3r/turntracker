//import {combineReducers} from 'redux';
import {LOGIN,LOGOUT} from './actions';

function user(state={'id':'','name':'','username':'','admin':false,'rooms':[]}, action) {
    console.log("Action user")
    console.log(action.user)
    switch (action.type) {
        case LOGIN:
            state.id = action.user.id;
            state.name = action.user.name;
            state.username = action.user.username;
            state.admin = action.user.admin;
            state.rooms = action.user.rooms;
            return state;
        case LOGOUT:
            return {'id':'','name':'','username':'','admin':false,'rooms':[]};
        default:
            return state;
    }
}

const userStore = user;

export default userStore;
