import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import store from "objectum-client";
import Auth from "./Auth";
import Classes from "./Classes";
import Class from "./Class";
import ClassAttr from "./ClassAttr";
import Views from "./Views";
import View from "./View";
import ViewAttr from "./ViewAttr";

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		store.setUrl ("/api/projects/tests/");
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.props.username && me.props.password) {
			let sid = await store.auth ({
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
							<button className="navbar-brand">Objectum</button>
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
								</ul>
							</div>
						</nav>
						<div className="container mt-1">
							<Route path="/views" render={props => <Views {...props} store={store} />} />
							<Route path="/view/:rid" render={props => <View {...props} store={store} />} />
							<Route path="/view_attr/:rid" render={props => <ViewAttr {...props} store={store} />} />
							<Route path="/classes" render={props => <Classes {...props} store={store} />} />
							<Route path="/class/:rid" render={props => <Class {...props} store={store} />} />
							<Route path="/class_attr/:rid" render={props => <ClassAttr {...props} store={store} />} />
						</div>
					</Router>
				</div>
			);
		} else {
			return (
				<div className="container">
					<div className="row">
						<div className="col-sm-4 offset-sm-4 col-md-2 offset-md-5 col-lg-2 offset-lg-5">
							<Auth store={store} onConnect={sid => me.setState ({sid})} />
						</div>
					</div>
				</div>
			);
		}
	}
};

export default ObjectumApp;
