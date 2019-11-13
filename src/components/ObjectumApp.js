import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import Auth from "./Auth";
import Models from "./Models";
import Model from "./Model";
import Property from "./Property";
import Queries from "./Queries";
import Query from "./Query";
import Column from "./Column";
import Roles from "./Roles";
import Role from "./Role";
import Users from "./Users";
import User from "./User";
import Menus from "./Menus";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import Logout from "./Logout";

import "../css/objectum.css";
import "../css/bootstrap.css";
import "../css/sidebar.css";
import "../fontawesome/css/all.css";
import "../js/jquery.js";
import "../js/popper.js";
import "../js/bootstrap.js";

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		me.store = me.props.store;
		me.onConnect = me.onConnect.bind (me);
	}
	
	async componentDidMount () {
		let me = this;
		
		me.store.addListener ("connect", me.onConnect);
		
		if (me.props.username && me.props.password) {
			await me.store.auth ({
				username: me.props.username,
				password: me.props.password
			});
		}
	}
	
	componentWillUnmount () {
		this.store.removeListener ("connect", this.onConnect);
	}
	
	async onConnect (opts) {
		let me = this;
		let menuId = opts.menuId;
		
		if (menuId == "admin") {
			let menuResult = await me.store.getData ({
				query: "objectum.menu",
				offset: 0,
				limit: 100000
			});
			for (let i = 0; i < menuResult.recs.length; i ++) {
				if (menuResult.recs [i].code == "admin") {
					menuId = menuResult.recs [i].id;
					break;
				}
			}
		}
		if (menuId) {
			let result = await me.store.getData ({
				query: "objectum.userMenuItems",
				menu: menuId
			});
			me.menuItemRecs = result.recs;
		}
		me.setState ({sid: opts.sessionId});
	}
	
	renderMenu () {
		let me = this;
		let recs = me.menuItemRecs;
		
		if (!recs) {
			return (
				<ul className="list-unstyled components">
					<li className="active">
						<a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Objectum</a>
						<ul className="collapse list-unstyled" id="homeSubmenu">
							<li>
								<Link className="nav-link" to="/models">Models</Link>
							</li>
							<li>
								<Link className="nav-link" to="/queries">Queries</Link>
							</li>
							<li>
								<Link className="nav-link" to="/menus">Menus</Link>
							</li>
							<li>
								<Link className="nav-link" to="/roles">Roles</Link>
							</li>
							<li>
								<Link className="nav-link" to="/users">Users</Link>
							</li>
						</ul>
					</li>
					<li className="mt-3">
						<Link className="nav-link" to="/logout">Logout</Link>
					</li>
				</ul>
			);
		}
		function renderIcon (icon) {
			if (icon) {
				return (<i className={`${icon} menu-icon`} />);
			} else {
				return (<span />);
			}
		};
		function renderItems (parent) {
			let recs = me.menuItemRecs.filter (rec => rec.parent == parent);

			return recs.map ((rec, i) => {
				let childRecs = me.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				
				if (childRecs.length) {
					return (
						<li className="active" key={`active-${parent}-${i}`}>
							<a key={`a-${parent}-${i}`} href={`#submenu-${parent}-${i}`} data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">{renderIcon (rec.icon)}{rec.name}</a>
							<ul key={`ul-${parent}-${i}`} className="collapse list-unstyled" id={`submenu-${parent}-${i}`}>
								{renderItems (rec.id)}
							</ul>
						</li>
					);
				} else {
					return (
						<li key={`${parent}-${i}`}>
							<Link className="nav-link" to={rec.path}>{renderIcon (rec.icon)}{rec.name}</Link>
						</li>
					);
				}
			});
		};
		return (
			<ul className="list-unstyled components">
				{renderItems (null)}
				<li className="mt-3">
					<Link className="nav-link" to="/logout"><i className="fas fa-sign-out-alt mr-2" />Logout</Link>
				</li>
			</ul>
		);
	}
	
	renderRoutes () {
		let me = this;
		let items = [
			<Route key="objectum-1" path="/queries" render={props => <Queries {...props} store={me.store} />} />,
			<Route key="objectum-2" path="/query/:rid" render={props => <Query {...props} store={me.store} />} />,
			<Route key="objectum-3" path="/column/:rid" render={props => <Column {...props} store={me.store} />} />,
			<Route key="objectum-4" path="/models" render={props => <Models {...props} store={me.store} />} />,
			<Route key="objectum-5" path="/model/:rid" render={props => <Model {...props} store={me.store} />} />,
			<Route key="objectum-6" path="/property/:rid" render={props => <Property {...props} store={me.store} />} />,
			<Route key="objectum-7" path="/roles" render={props => <Roles {...props} store={me.store} />} />,
			<Route key="objectum-8" path="/role/:rid" render={props => <Role {...props} store={me.store} />} />,
			<Route key="objectum-9" path="/users" render={props => <Users {...props} store={me.store} />} />,
			<Route key="objectum-10" path="/user/:rid" render={props => <User {...props} store={me.store} />} />,
			<Route key="objectum-11" path="/menus" render={props => <Menus {...props} store={me.store} />} />,
			<Route key="objectum-12" path="/menu/:rid" render={props => <Menu {...props} store={me.store} />} />,
			<Route key="objectum-13" path="/menu_item/:rid" render={props => <MenuItem {...props} store={me.store} />} />,
			<Route key="objectum-14" path="/logout" render={props => <Logout {...props} store={me.store} onLogout={() => me.setState ({sid: null})} />} />
		];
		React.Children.forEach (me.props.children, (child, i) => {
			if (child.type && (child.type.name == "ObjectumRoute" || child.type.name == "Route")) {
/*
				let props = {...child.props};
				
				props.key = i;
				
				items.push (React.cloneElement (child, props));
*/
				items.push (<Route key={i} {...child.props} />);
			}
		});
		return items;
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
{/*
						<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
							<a className="navbar-brand" href="#">{me.props.name || "Objectum"}</a>
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
										<Link className="nav-link" to="/menus">Menus</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/roles">Roles</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/users">Users</Link>
									</li>
								</ul>
							</div>
							<Link className="nav-link" to="/logout">Logout</Link>
						</nav>
*/}
						<div className="wrapper">
							<nav id="sidebar">
								<div className="sidebar-header">
									<h3>{me.props.name || "Objectum"}</h3>
								</div>
								{me.renderMenu ()}
							</nav>
							<div id="content">
								{me.renderRoutes ()}
							</div>
						</div>
					</Router>
				</div>
			);
		} else {
			return (
				<div className="container">
					<div className="row">
						<div className="col-sm-4 offset-sm-4 col-md-2 offset-md-5 col-lg-2 offset-lg-5">
							<Auth store={me.store} />
						</div>
					</div>
				</div>
			);
		}
	}
};

export default ObjectumApp;
