import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link, useHistory, useLocation} from "react-router-dom";
import Auth from "./Auth";
import Models from "./Models";
import Model from "./Model";
import Schema from "./Schema";
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
import Records from "./Records";
import Logout from "./Logout";
import Sidebar from "react-sidebar";
import {lang, i18n} from "./../i18n";
import _ from "lodash";
import Fade from "react-reveal/Fade";

function usePageViews (pushLocation, locations) {
	let location = useLocation ();
	
	React.useEffect (() => {
		let pathname = window.location.pathname;
		let hash = window.location.hash;
		
		if (locations.length && locations [locations.length - 1].pathname == pathname) {
			locations [locations.length - 1].hash = hash;
			return;
		}
		if (pathname != "/") {
			let needPop = false;
			
			if (locations.length) {
				let tokens = locations [locations.length - 1].pathname.split ("/");
				
				if (tokens [tokens.length - 1] == "new") {
					needPop = true;
				}
			}
			pushLocation (pathname, hash, needPop);
		}
	}, [location]);
};

function PageViews ({pushLocation, locations}) {
	usePageViews (pushLocation, locations);
	return null;
};

function HomeButton () {
	let history = useHistory ();
	
	function handleClick () {
		history.push ("/");
	}
	return (
		<button className="btn btn-link" onClick={handleClick}>
			<i className="fas fa-home" />
		</button>
	);
};

function BackButton ({popLocation, locations}) {
	let history = useHistory ();
	
	function handleClick () {
		let {pathname, hash} = locations [locations.length - 2];
		
		popLocation ();
		
//		history.push (decodeURI (pathname + hash));
		history.push (pathname + hash);
	}
	return (
		<button className="btn btn-link" disabled={locations.length < 2} onClick={handleClick}>
			<i className="fas fa-arrow-left mr-2" /><span className="text-dark">{i18n ("Back")}</span>
		</button>
	);
};

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			sidebarDocked: true,
			locations: [],
			name: me.props.name || "Objectum",
			version: me.props.version || "0.0.1"
		};
		me.store = me.props.store;
		me.onConnect = me.onConnect.bind (me);
		me.onClickMenu = me.onClickMenu.bind (me);
		me.pushLocation = me.pushLocation.bind (me);
		me.popLocation = me.popLocation.bind (me);
		
		lang (me.props.locale || "en");
	}
	
	async componentDidMount () {
		let me = this;
		
		console.log ("objectumApp onConnect");
		me.store.addListener ("connect", me.onConnect);
		
		if (me.props.username && me.props.password) {
			try {
				await me.store.auth ({
					username: me.props.username,
					password: me.props.password
				});
			} catch (err) {
				console.error (err);
				me.setState ({error: err.message});
			}
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
	
	renderMenu (size) {
		let me = this;
		
		function renderIcon (icon, key) {
			if (icon) {
				return (<i key={key} className={`${icon} ${size} menu-icon mr-1`} />);
			} else {
				return (<span key={key} />);
			}
		};
		let items = [];
		
		function renderItems (parent, level) {
			let recs = me.menuItemRecs.filter (rec => rec.parent == parent);
			
			recs.forEach ((rec, i) => {
				let childRecs = me.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				let selected = (rec.path || "").split ("#")[0] == document.location.pathname;
				
				if (childRecs.length) {
					let opened = me.state [`open-${parent}-${i}`];
					
					items.push (
						<tr key={`menu-${parent}-${i}`}><td>
							<button className={`btn btn-link pl-3 ml-${level * 2}`} onClick={() => me.onClickMenu (`open-${parent}-${i}`)}>
								{renderIcon (rec.icon, `icon-${parent}-${i}`)}
								<span className="text-dark">{i18n (rec.name)}</span>
								<i key={`open-${parent}-${i}`} className={`far ${opened ? "fa-folder-open" : "fa-folder"} menu-icon`} />
							</button>
						</td></tr>
					);
					if (opened) {
						renderItems (rec.id, level + 1);
					}
				} else {
					items.push (
						<tr key={`menu-${parent}-${i}`}><td className={selected ? "bg-primary" : ""}>
							<Link className={`nav-link text-nowrap ml-${level * 2} ${selected ? "text-white" : ""}`} to={rec.path}>
								{renderIcon (rec.icon, `icon-${parent}-${i}`)}
								<span className={selected ? "text-white" : "text-dark"}>{i18n (rec.name)}</span>
							</Link>
						</td></tr>
					);
				}
			});
		};
		renderItems (null, 0);
		
		let menu = (
			<table className="table table-sm table-borderless">
				<tbody>
				{items}
				<tr><td>
					<Link key="menu-logout" className="nav-link" to="/logout">
						<i key="icon-logout" className={`fas fa-sign-out-alt ${size} menu-icon mr-1`} /><span className="text-dark">{i18n ("Logout")}</span>
					</Link>
				</td></tr>
				</tbody>
			</table>
		);
		if (me.props.onRenderSidebar) {
			menu = me.props.onRenderSidebar (menu);
		}
		return (
			<div className="menu">
				{menu}
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
			<Route key="objectum-17" path="/schema" render={props => <Schema {...props} store={me.store} />} />,
			<Route key="objectum-logout" path="/logout" render={props => {
				me.setState ({
					sidebarOpen: false, locations: []
				});
				return (
					<Logout {...props} store={me.store} onLogout={() => me.setState ({sid: null})} />
				);
			}} />
		];
		React.Children.forEach (me.props.children, (child, i) => {
			if (child && child.type && child.type.displayName == "ObjectumRoute") {
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
			items.push (
				<Route
					key={`model-list-${path}`}
					path={`/model_list/${path.split (".").join ("_")}`}
					render={props => <div className="container">
						<div className="bg-white shadow-sm">
							<ModelList {...props} store={me.store} model={path} />
						</div>
					</div>}
				/>
			);
			items.push (
				<Route
					key={`model-tree-${path}`}
					path={`/model_tree/${path.split (".").join ("_")}`}
					render={props => <div className="container">
						<div className="bg-white shadow-sm">
							<ModelTree {...props} store={me.store} model={path} />
						</div>
					</div>}
				/>
			);
			items.push (
				<Route
					key={`records-${path}`}
					path={`/records/${path.split (".").join ("_")}`}
					render={props => <div className="container">
						<div className="bg-white shadow-sm">
							<Records {...props} store={me.store} model={path} />
						</div>
					</div>}
				/>
			);
		});
		return items;
	}
	
	pushLocation (pathname, hash, needPop) {
		let me = this;
		let locations = [...me.state.locations];
		
		if (needPop) {
			locations.splice (locations.length - 1, 1);
		}
		me.setState ({locations: [...locations, {pathname, hash}]});
	}
	
	popLocation () {
		let me = this;
		let locations = [...me.state.locations];
		let l = locations.splice (locations.length - 1, 1);
		
		me.setState ({locations});
		return l;
	}
	
	onHome () {
		let history = useHistory ();
		
		history.push ({
			pathname: "/"
		});
	}
	
	render () {
		let me = this;
		
		if (me.state.error) {
			return (
				<div className="container">
					<div className="alert alert-danger mt-1" role="alert">
						{me.state.error}
					</div>
				</div>
			);
		}
		if (me.props.username && me.props.password && !me.state.sid) {
			return (<div/>);
		}
		if (me.state.sid) {
			return (
				<div>
					<Router>
						<PageViews pushLocation={me.pushLocation} locations={me.state.locations} />
						
						<div>
							<Sidebar
								sidebar={me.renderMenu ("fa-lg")}
								open={false}
								docked={me.state.sidebarDocked}
								sidebarClassName="bg-white border-right"
								shadow={false}
							>
								<Fade>
									<div className="bg-white shadow-sm header border-bottom py-1 form-inline">
										<button className="btn btn-link" onClick={
											() => {
												me.setState ({sidebarDocked: !me.state.sidebarDocked});
											}
										}>
											<i className="fas fa-bars mr-2" /><span className="text-dark">{i18n ("Menu")}</span>
										</button>
										
										<HomeButton />
										<BackButton popLocation={me.popLocation} locations={me.state.locations} />
										
										<span className="ml-3 font-weight-bold">{`${me.state.name || "Objectum"} (${i18n ("version")}: ${me.state.version}, ${i18n ("user")}: ${store.username})`}</span>
									</div>
								</Fade>
								
								<div style={{marginTop: "1em", marginBottom: "5em"}}>
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
					<Fade top>
						<Auth store={me.store} name={me.state.name} version={me.state.version} onRenderAuthInfo={me.props.onRenderAuthInfo} />
					</Fade>
				</div>
			);
		}
	}
};
ObjectumApp.displayName = "ObjectumApp";

export default ObjectumApp;
