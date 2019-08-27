import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
//import store from "objectum-client";
import Auth from "./Auth";
import Classes from "./Classes";
import Class from "./Class";
import ClassAttr from "./ClassAttr";
import Views from "./Views";
import View from "./View";
import ViewAttr from "./ViewAttr";
import Roles from "./Roles";
import Role from "./Role";
import Users from "./Users";
import User from "./User";
import Menu from "./Menu";

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		me.store = me.props.store;
		//store.setUrl ("/api/projects/tests/");
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.props.username && me.props.password) {
			let sid = await me.store.auth ({
				username: me.props.username,
				password: me.props.password
			});
			me.setState ({sid});
		}
	}
	
	render () {
		let me = this;
		
		if (me.props.username && me.props.password && !me.state.sid) {
			return (<div/>);
		}
		if (me.state.sid) {
			return (
				<div>
					<Router>
						<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
							<a className="navbar-brand" href="#">Objectum</a>
							<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
								<span className="navbar-toggler-icon"></span>
							</button>
							<div className="collapse navbar-collapse" id="navbarNav">
								<ul className="navbar-nav">
									<li className="nav-item">
										<Link className="nav-link" to="/classes">Classes</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/views">Views</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/roles">Roles</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/users">Users</Link>
									</li>
								</ul>
							</div>
						</nav>
						<div className="container mt-1">
							<Route path="/views" render={props => <Views {...props} store={me.store} />} />
							<Route path="/view/:rid" render={props => <View {...props} store={me.store} />} />
							<Route path="/view_attr/:rid" render={props => <ViewAttr {...props} store={me.store} />} />
							<Route path="/classes" render={props => <Classes {...props} store={me.store} />} />
							<Route path="/class/:rid" render={props => <Class {...props} store={me.store} />} />
							<Route path="/class_attr/:rid" render={props => <ClassAttr {...props} store={me.store} />} />
							<Route path="/roles" render={props => <Roles {...props} store={me.store} />} />
							<Route path="/role/:rid" render={props => <Role {...props} store={me.store} />} />
							<Route path="/users" render={props => <Users {...props} store={me.store} />} />
							<Route path="/user/:rid" render={props => <User {...props} store={me.store} />} />
							<Route path="/menu/:rid" render={props => <Menu {...props} store={me.store} />} />
						</div>
					</Router>
				</div>
			);
		} else {
			return (
				<div className="container">
					<div className="row">
						<div className="col-sm-4 offset-sm-4 col-md-2 offset-md-5 col-lg-2 offset-lg-5">
							<Auth store={me.store} onConnect={sid => me.setState ({sid})} />
						</div>
					</div>
				</div>
			);
		}
	}
};

export default ObjectumApp;
