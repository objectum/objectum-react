import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link, useLocation} from "react-router-dom";
import {
	Auth, Models, Model, Property, Queries, Query, Column, Roles, Role, Users, User,
	Menus, Menu, MenuItem, ModelList, ModelTree, ModelRecord, Records, Office, ImportCSS
} from "..";
import Sidebar from "react-sidebar";
import {setLocale, i18n} from "./../i18n";
import _filter from "lodash.filter";
import _each from "lodash.foreach";
import _keys from "lodash.keys";
import Fade from "./Fade";
import {execute} from "objectum-client";
import Loading from "./Loading";
import {Navbar} from "../index";
import {
	HomeButtonSB,
	HomeButton,
	LogoutButtonSB,
	LogoutButton,
	BackButtonSB,
	BackButton
} from "./Buttons";
import {setStore} from "../modules/common";
import mediator from "../modules/mediator";

function usePageViews (pushLocation, locations) {
	let location = useLocation ();
	
	React.useEffect (() => {
		let pathname = window.location.pathname;
		let hash = window.location.hash;
		
		if (locations.length && locations [locations.length - 1].pathname == pathname) {
			locations [locations.length - 1].hash = hash;
			return;
		}
		//if (pathname != "/") {
			let needPop = false;
			
			if (locations.length) {
				let tokens = locations [locations.length - 1].pathname.split ("/");
				
				if (tokens [tokens.length - 1] == "new") {
					needPop = true;
				}
			}
			pushLocation (pathname, hash, needPop);
		//}
	}, [location]);
};

function PageViews ({pushLocation, locations}) {
	usePageViews (pushLocation, locations);
	return null;
};

class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			sidebarDocked: true,
			locations: [{pathname: window.location.pathname, hash: window.location.hash}],
			name: me.props.name || "Objectum",
			version: me.props.version || "0.0.1"
		};
		setStore (me.props.store);
		me.store = me.props.store;
		me.onConnect = me.onConnect.bind (me);
		me.onClickMenu = me.onClickMenu.bind (me);
		me.pushLocation = me.pushLocation.bind (me);
		me.popLocation = me.popLocation.bind (me);
		me.menuItemRecs = [];
		
		setLocale (me.props.locale || "en");
		
		window.OBJECTUM_APP = {
			store: me.store,
			sidebar: me.props.sidebar,
			locale: me.props.locale
		};
	}
	
	async componentDidMount () {
		let me = this;
		
		me.store.addListener ("connect", me.onConnect);
		me.store.addListener ("disconnect", me.onDisconnect);
		
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
		} else
		if (me.store.getSessionId ()) {
			await me.onConnect ({
				sid: me.store.getSessionId (),
				menuId: me.store.getMenuId ()
			});
		}
	}
	
	componentWillUnmount () {
		this.store.removeListener ("connect", this.onConnect);
		this.store.removeListener ("disconnect", this.onConnect);
	}
	
	async onConnect (opts) {
		let me = this;
		let menuId = opts.menuId;
		let state = {sid: opts.sessionId};
		
//		if (!me.props.onCustomRender) {
			me.setState ({loading: true});
			
/*
			if (menuId == "admin") {
				let menuResult = await me.store.getData ({
					query: "objectum.menu"
				});
				for (let i = 0; i < menuResult.recs.length; i ++) {
					if (menuResult.recs [i].code == "admin") {
						menuId = menuResult.recs [i].id;
						break;
					}
				}
			}
*/
			if (menuId) {
				let result = await me.store.getData ({
					query: "objectum.userMenuItems",
					menu: menuId
				});
				me.menuItemRecs = result.recs;
				
				let items = [];
				let addItems = (items, recs) => {
					recs.forEach (rec => {
						let item = {
							id: rec.id,
							label: rec.name,
							icon: rec.icon,
							path: rec.path
						};
						items.push (item);
						
						let childs = _filter (me.menuItemRecs, {parent: rec.id});
						
						if (childs.length) {
							item.items = [];
							addItems (item.items, childs);
						}
					});
				};
				addItems (items, _filter (me.menuItemRecs, {parent: null}));
				
				me.menuItems = items;
			} else {
				me.menuItemRecs = [];
				me.menuItems = [];
			}
			state.loading = false;
//		}
		if (me.props.onConnect) {
			await execute (me.props.onConnect);
		}
		me.setState (state);
	}
	
	onDisconnect = async () => {
		if (this.props.onDisconnect) {
			await execute (this.props.onDisconnect);
		}
	}
	
	onClickMenu (key) {
		let me = this;
		
		me.setState ({[key]: !me.state [key]});
	}
	
	renderMenu (size) {
		let me = this;
		
		function renderIcon (icon, key) {
			if (icon) {
				return (<span key={key} className={`${icon} ${size} menu-icon mr-1 align-middle`} />);
			} else {
				return (<span key={key} />);
			}
		};
		let items = [];
		
		function renderItems (parent, level) {
			let recs = me.menuItemRecs.filter (rec => rec.parent == parent);
			
			recs.forEach ((rec, i) => {
				let childRecs = me.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				//let selected = (rec.path || "").split ("#")[0] == document.location.pathname;
				
				if (childRecs.length) {
					let opened = me.state [`open-${parent}-${i}`];
					
					items.push (
						<tr key={`menu-${parent}-${i}`}>
							<td>
								<button className={`btn btn-link pl-3 ml-${level * 2}`} onClick={() => me.onClickMenu (`open-${parent}-${i}`)}>
									{renderIcon (rec.icon, `icon-${parent}-${i}`)}
									<span className="text-dark">{i18n (rec.name)}</span>
									<i key={`open-${parent}-${i}`} className={`fas ${opened ? "fa-angle-up" : "fa-angle-down"} ml-2`} />
								</button>
							</td>
						</tr>
					);
					if (opened) {
						renderItems (rec.id, level + 1);
					}
				} else {
					let key = `menu-${parent}-${i}`;
					let selected = me.state.selectedItem == key;
					
					items.push (
						<tr key={key}><td className={selected ? "bg-primary" : ""}>
							<Link className={`nav-link text-nowrap ml-${level * 2} ${selected ? "text-white" : ""}`}
								  to={rec.path}
								  onClick={() => me.setState ({selectedItem: key})}
							>
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
					<LogoutButtonSB app={me} size={size} />
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
	
	renderMenu2 () {
		let me = this;
		
		return (
			<Navbar iconsTop={me.props.iconsTop}
				items={[
					<BackButton key="back" popLocation={me.popLocation} locations={me.state.locations} iconsTop={me.props.iconsTop} />,
					...me.menuItems,
					<LogoutButton key="logout" app={me} iconsTop={me.props.iconsTop} />
				]}
			/>
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
			<Route key="objectum-17" path="/import_css" render={props => <ImportCSS {...props} />} />,
/*
			<Route key="objectum-18" path="/schema" render={props => <Schema {...props} store={me.store} />} />,
*/
		];
		let SearchRoutes = (children) => {
			React.Children.forEach (children, (child, i) => {
				if (child && child.props) {
					if (child && child.type && child.type.displayName == "ObjectumRoute") {
						items.push (<Route key={`route-${i}`} {...child.props} />);
					}
					if (child.props.children) {
						SearchRoutes (child.props.children);
					}
				}
			});
		};
		SearchRoutes (me.props.children);
		
		let model = {}, parent = {};
		
		_each (me.store.map ["model"], m => {
			model [m.getPath ()] = true;
			parent [m.get ("parent")] = true;
		});
		_each (_keys (model), path => {
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
		if (me.state.loading) {
			return <Loading container />
		}
/*
		if (me.props.username && me.props.password && !me.state.sid) {
			return (<div/>);
		}
*/
		let content;
		
		if (me.state.sid) {
			if (me.props.onCustomRender) {
				content = me.renderRoutes ();
				content = me.props.onCustomRender ({content, app: me, location: me.state.locations.length ? me.state.locations [me.state.locations.length - 1]: {}});
			}
			if (!content) {
				if (me.props.sidebar) {
					content = (
						<div>
							<Sidebar
								sidebar={me.renderMenu (me.props.menuIconSize || "fa-2x")}
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
											<i className="fas fa-bars mr-2"/><span className="text-dark">{i18n ("Menu")}</span>
										</button>
										
										<HomeButtonSB />
										<BackButtonSB popLocation={me.popLocation} locations={me.state.locations}/>
										
										<span
											className="ml-3 font-weight-bold">{`${me.state.name || "Objectum"} (${i18n ("version")}: ${me.state.version}, ${i18n ("user")}: ${me.store.username})`}</span>
									</div>
								</Fade>
								
								<div className="objectum-content">
									{me.renderRoutes ()}
								</div>
							</Sidebar>
						</div>
					);
				} else {
					let label = me.props.label || `${me.state.name || "Objectum"} (${i18n ("version")}: ${me.state.version}, ${i18n ("user")}: ${me.store.username})`;
					
					content = (
						<Fade>
							<Navbar className="navbar navbar-expand navbar-dark bg-dark" linkClassName="nav-item nav-link" items={[
								<HomeButton><strong>{label}</strong></HomeButton>,
							]} />
							{me.renderMenu2 ()}
							<div className="objectum-content">
								{me.renderRoutes ()}
							</div>
						</Fade>
					);
				}
			}
			return (
				<div>
					<Router>
						<PageViews pushLocation={me.pushLocation} locations={me.state.locations} />
						{content}
					</Router>
				</div>
			);
		} else {
			content = me.props.registration ?
				<Fade className="my-5">
					<Office {...me.props} name={me.state.name} version={me.state.version} />
				</Fade> :
				<div>
					<Auth store={me.store} name={me.state.name} version={me.state.version} onRenderAuthInfo={me.props.onRenderAuthInfo}/>
				</div>
			;
			let customContent;
			
			if (me.props.onCustomRender) {
				customContent = me.props.onCustomRender ({content, app: me, location: me.state.locations.length ? me.state.locations [me.state.locations.length - 1]: {}});

				if (customContent) {
					content = customContent;
				}
			} else if (me.props.username && me.props.password) {
				return (<div/>);
			}
			//return content;
			return (
				<div>
					<Router>
						<PageViews pushLocation={me.pushLocation} locations={me.state.locations} />
						{content}
					</Router>
				</div>
			);
		}
	}
};
ObjectumApp.displayName = "ObjectumApp";

export default ObjectumApp;
