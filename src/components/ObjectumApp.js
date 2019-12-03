import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link, useHistory, useLocation} from "react-router-dom";
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
import ModelList from "./ModelList";
import ModelTree from "./ModelTree";
import ModelRecord from "./ModelRecord";
import Logout from "./Logout";
import Sidebar from "react-sidebar";
import {lang, i18n} from "./../i18n";
import _ from "lodash";
import Fade from "react-reveal/Fade";

import "../css/objectum.css";
import "../css/bootstrap.css";
import "../fontawesome/css/all.css";

function usePageViews (pushLocation, popLocation, locations) {
	let location = useLocation ();
	
	React.useEffect (() => {
		let pathname = window.location.pathname;
		let hash = window.location.hash;
		
		if (locations.length && locations [locations.length - 1].pathname == pathname) {
			locations [locations.length - 1].hash = hash;
			return;
		}
		if (pathname != "/") {
			if (locations.length) {
				let tokens = locations [locations.length - 1].pathname.split ("/");
				
				if (tokens [tokens.length - 1] == "new") {
					popLocation ();
				}
			}
			pushLocation (pathname, hash);
		}
	}, [location]);
};

function PageViews ({pushLocation, popLocation, locations}) {
	usePageViews (pushLocation, popLocation, locations);
	return null;
};

function BackButton ({popLocation, locations}) {
	let history = useHistory ();
	
	function handleClick () {
		let {pathname, hash} = locations [locations.length - 2];
		
		popLocation ();
		
		history.push (unescape (pathname + hash));
	}
	
	return (
		<button className="btn btn-primary ml-1" disabled={locations.length < 2} onClick={handleClick}>
			<i className="fas fa-arrow-left mr-2" />{i18n ("Back")}
		</button>
	);
};

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			sidebarOpen: false,
			locations: []
		};
		me.store = me.props.store;
		me.onConnect = me.onConnect.bind (me);
		me.onSetSidebarOpen = me.onSetSidebarOpen.bind (me);
		me.onClickMenu = me.onClickMenu.bind (me);
		me.pushLocation = me.pushLocation.bind (me);
		me.popLocation = me.popLocation.bind (me);
		
		lang (me.props.locale || "en");
	}
	
	onSetSidebarOpen (open) {
		this.setState({ sidebarOpen: open });
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
	
	onClickMenu (key) {
		let me = this;
		
		me.setState ({[key]: !me.state [key]});
	}
	
	renderMenu () {
		let me = this;
		function renderIcon (icon, key) {
			if (icon) {
				return (<i key={key} className={`${icon} menu-icon`} />);
			} else {
				return (<span key={key} />);
			}
		};
		function renderItems (parent, level) {
			let recs = me.menuItemRecs.filter (rec => rec.parent == parent);
			
			return recs.map ((rec, i) => {
				let childRecs = me.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				
				if (childRecs.length) {
					let opened = me.state [`open-${parent}-${i}`];
					
					return (
						<div key={`menuDiv-${parent}-${i}`}>
							<button key={`menu-${parent}-${i}`} className={`btn btn-link text-dark pl-3 ml-${level * 2}`} onClick={() => me.onClickMenu (`open-${parent}-${i}`)}>
								{renderIcon (rec.icon, `icon-${parent}-${i}`)}{i18n (rec.name)}<i key={`open-${parent}-${i}`} className={`far ${opened ? "fa-folder-open" : "fa-folder"} menu-icon`} />
							</button>
							{opened && renderItems (rec.id, level + 1)}
						</div>
					);
				} else {
					return (
						<Link key={`menu-${parent}-${i}`} className={`nav-link text-dark ml-${level * 2}`} to={rec.path}>{renderIcon (rec.icon, `icon-${parent}-${i}`)}{i18n (rec.name)}</Link>
					);
				}
			});
		};
		return (
			<div className="menu">
				{renderItems (null, 0)}
				<Link key="menu-logout" className="nav-link text-dark mt-4" to="/logout"><i key="icon-logout" className="fas fa-sign-out-alt mr-2 ml-2" />{i18n ("Logout")}</Link>
			</div>
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
			<Route key="objectum-16" path="/model_record/:rid" render={props => <ModelRecord {...props} store={me.store} />} />,
			<Route key="objectum-logout" path="/logout" render={props => <Logout {...props} store={me.store} onLogout={() => me.setState ({sid: null})} />} />
		];
		React.Children.forEach (me.props.children, (child, i) => {
			if (child.type && child.type.displayName == "ObjectumRoute") {
				items.push (<Route key={`route-${i}`} {...child.props} />);
			}
		});
		let model = {}, parent = {};
		
		_.each (me.store.map ["model"], m => {
			model [m.getPath ()] = true;
			parent [m.get ("parent")] = true;
		});
		_.each (_.keys (model), path => {
			let m = me.store.getModel (path);
			
			if (parent [m.get ("id")]) {
				return;
			}
			items.push (<Route key={`model-list-${path}`} path={`/model_list/${path.split (".").join ("_")}`} render={props => <ModelList {...props} store={me.store} model={path} />} />);
			items.push (<Route key={`model-tree-${path}`} path={`/model_tree/${path.split (".").join ("_")}`} render={props => <ModelTree {...props} store={me.store} model={path} />} />);
		});
		return items;
	}
	
	pushLocation (pathname, hash) {
		let me = this;
		
		me.setState ({locations: [...me.state.locations, {pathname, hash}]});
	}
	
	popLocation () {
		let me = this;
		let locations = [...me.state.locations];
		let l = locations.splice (locations.length - 1, 1);
		
		me.setState ({locations});
		return l;
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
						<PageViews pushLocation={me.pushLocation} popLocation={me.popLocation} locations={me.state.locations} />
						
						<Fade>
							<div className="fixed-top text-light bg-dark">
								<button className="btn btn-primary" onClick={() => this.onSetSidebarOpen (!me.state.sidebarOpen)}>
									<i className="fas fa-bars mr-2"></i>{i18n ("Menu")}
								</button>
	
								<BackButton popLocation={me.popLocation} locations={me.state.locations} />
	
								<span className="ml-3 text-uppercase font-weight-bold">{me.props.name || "Objectum"}</span>
							</div>
						</Fade>

						<div className="container-fluid">
							<Sidebar
								sidebar={me.renderMenu ()}
								open={this.state.sidebarOpen}
								onSetOpen={this.onSetSidebarOpen}
								sidebarClassName="bg-white"
							>
								<div className="container content">
									{me.renderRoutes ()}
								</div>
							</Sidebar>
						</div>
					</Router>
				</div>
			);
		} else {
			return (
				<div>
					<Fade>
						<div id="header" className="fixed-top text-light bg-dark">
							<span className="text-uppercase font-weight-bold">{me.props.name || "Objectum"}</span>
						</div>
					</Fade>
					<Fade top>
						<div className="container">
							<div className="row">
								<div className="col-sm-4 offset-sm-4 col-md-2 offset-md-5 col-lg-2 offset-lg-5">
									<Auth store={me.store} />
								</div>
							</div>
						</div>
					</Fade>
				</div>
			);
		}
	}
};
ObjectumApp.displayName = "ObjectumApp";

export default ObjectumApp;
