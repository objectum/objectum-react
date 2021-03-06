import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link, useLocation} from "react-router-dom";
import {
	Auth, Models, Model, Property, Queries, Query, Column, Roles, Role, Users, User,
	Menus, Menu, MenuItem, ModelList, ModelTree, ModelRecord, Records, Office, ImportCSS
} from "..";
import Sidebar from "react-sidebar";
import {setLocale, i18n} from "../i18n";
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

function usePageViews (pushLocation, locations) {
	let location = useLocation ();
	
	React.useEffect (() => {
		let pathname = window.location.pathname;
		let hash = window.location.hash;
		
		if (locations.length && locations [locations.length - 1].pathname == pathname) {
			locations [locations.length - 1].hash = hash;
			return;
		}
		let needPop = false;
		
		if (locations.length) {
			let tokens = locations [locations.length - 1].pathname.split ("/");
			
			if (tokens [tokens.length - 1] == "new") {
				needPop = true;
			}
		}
		pushLocation (pathname, hash, needPop);
	}, [location]);
};

function PageViews ({pushLocation, locations}) {
	usePageViews (pushLocation, locations);
	return null;
};

export default class ObjectumApp extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			sidebarDocked: true,
			locations: [{pathname: window.location.pathname, hash: window.location.hash}],
			name: this.props.name || "Objectum",
			version: this.props.version || "0.0.1"
		};
		setStore (this.props.store);
		this.store = this.props.store;
		this.menuItemRecs = [];
		
		setLocale (this.props.locale || "en");
		
		window.OBJECTUM_APP = {
			store: this.store,
			sidebar: this.props.sidebar,
			locale: this.props.locale
		};
	}
	
	async componentDidMount () {
		this.store.addListener ("connect", this.onConnect);
		this.store.addListener ("disconnect", this.onDisconnect);
		
		if (this.props.username && this.props.password) {
			try {
				await this.store.auth ({
					username: this.props.username,
					password: this.props.password
				});
			} catch (err) {
				console.error (err);
				this.setState ({error: err.message});
			}
		} else
		if (this.store.getSessionId ()) {
			await this.onConnect ({
				sid: this.store.getSessionId (),
				menuId: this.store.getMenuId ()
			});
		}
	}
	
	componentWillUnmount () {
		this.store.removeListener ("connect", this.onConnect);
		this.store.removeListener ("disconnect", this.onConnect);
	}
	
	onConnect = async (opts) => {
		let menuId = opts.menuId;
		let state = {sid: opts.sessionId};
		
		this.setState ({loading: true});
		
		if (menuId) {
			let result = await this.store.getData ({
				query: "objectum.userMenuItems",
				menu: menuId
			});
			this.menuItemRecs = result.recs;
			
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
					
					let childs = _filter (this.menuItemRecs, {parent: rec.id});
					
					if (childs.length) {
						item.items = [];
						addItems (item.items, childs);
					}
				});
			};
			addItems (items, _filter (this.menuItemRecs, {parent: null}));
			
			this.menuItems = items;
		} else {
			this.menuItemRecs = [];
			this.menuItems = [];
		}
		state.loading = false;

		if (this.props.onConnect) {
			await execute (this.props.onConnect);
		}
		this.setState (state);
	}
	
	onDisconnect = async () => {
		if (this.props.onDisconnect) {
			await execute (this.props.onDisconnect);
		}
	}
	
	onClickMenu = (key) => {
		this.setState ({[key]: !this.state [key]});
	}
	
	renderMenuOld (size) {
		function renderIcon (icon, key) {
			if (icon) {
				return (<span key={key} className={`${icon} ${size} menu-icon mr-1 align-middle`} />);
			} else {
				return (<span key={key} />);
			}
		};
		let items = [];
		let renderItems = (parent, level) => {
			let recs = this.menuItemRecs.filter (rec => rec.parent == parent);
			
			recs.forEach ((rec, i) => {
				let childRecs = this.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				
				if (childRecs.length) {
					let opened = this.state [`open-${parent}-${i}`];
					
					items.push (
						<tr key={`menu-${parent}-${i}`}>
							<td className="fade-in">
								<button className={`btn btn-link pl-3 ml-${level * 2}`} onClick={() => this.onClickMenu (`open-${parent}-${i}`)}>
									{renderIcon (rec.icon, `icon-${parent}-${i}`)}
									<span className="text-dark">{i18n (rec.name)}</span>
									<i key={`open-${parent}-${i}`} className={`fas ${opened ? "fa-angle-up rotate-180-1" : `fa-angle-down ${this.state.hasOwnProperty (`open-${parent}-${i}`) ? "rotate-180-2" : ""}`} ml-2`} />
								</button>
							</td>
						</tr>
					);
					if (opened) {
						renderItems (rec.id, level + 1);
					}
				} else {
					let key = `menu-${parent}-${i}`;
					let selected = this.state.selectedItem == key;
					
					items.push (
						<tr key={key}><td className={selected ? "bg-primary" : ""}>
							<Link className={`nav-link text-nowrap ml-${level * 2} ${selected ? "text-white" : ""}`}
								  to={rec.path}
								  onClick={() => this.setState ({selectedItem: key})}
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
					<LogoutButtonSB app={this} size={size} />
				</td></tr>
				</tbody>
			</table>
		);
		if (this.props.onRenderSidebar) {
			menu = this.props.onRenderSidebar (menu);
		}
		return (
			<div className="menu">
				{menu}
			</div>
		);
	}
	
	renderMenu (size) {
		function renderIcon (icon, key) {
			if (icon) {
				return <span key={key} className={`${icon} ${size} menu-icon mr-1 align-middle`} />;
			} else {
				return <span key={key} />;
			}
		};
		let items = [];
		let renderItems = (parent, level, parentOpened) => {
			let recs = this.menuItemRecs.filter (rec => rec.parent == parent);
			
			recs.forEach ((rec, i) => {
				let childRecs = this.menuItemRecs.filter (menuItemRec => menuItemRec.parent == rec.id);
				let key = `menu-${parent}-${i}`;
				
				if (childRecs.length) {
					let opened = this.state [`open-${parent}-${i}`];
					
					items.push (
						<div key={key} className="fade-in height-100-1">
							<button className={`btn btn-link shadow-none pl-3 ml-${level * 2}`} onClick={() => this.onClickMenu (`open-${parent}-${i}`)}>
								{renderIcon (rec.icon, `icon-${parent}-${i}`)}
								<span className="text-dark">{i18n (rec.name)}</span>
								<i key={`open-${parent}-${i}`} className={`fas ${opened ? "fa-angle-up rotate-180-1" : `fa-angle-down ${this.state.hasOwnProperty (`open-${parent}-${i}`) ? "rotate-180-2" : ""}`} ml-2`} />
							</button>
						</div>
					);
					renderItems (rec.id, level + 1, opened);
				} else {
					let selected = this.state.selectedItem == key;
					let cls = selected ? "bg-primary" : "";
					
					if (parent) {
						cls += ` menu-hidden ${parentOpened ? "menu-visible" : ""}`;
					}
					items.push (
						<div key={key} className={cls}>
							<Link className={`nav-link text-nowrap ml-${level * 2} ${selected ? "text-white" : ""}`}
								  to={rec.path}
								  onClick={() => this.setState ({selectedItem: key})}
							>
								{renderIcon (rec.icon, `icon-${parent}-${i}`)}
								<span className={selected ? "text-white" : "text-dark"}>{i18n (rec.name)}</span>
							</Link>
						</div>
					);
				}
			});
		};
		renderItems (null, 0);
		
		let menu = <div className="menu">
			{items}
			<div>
				<LogoutButtonSB app={this} size={size} />
			</div>
		</div>;
		
		if (this.props.onRenderSidebar) {
			menu = this.props.onRenderSidebar (menu);
		}
		return menu;
	}
	
	renderMenu2 () {
		return <Navbar iconsTop={this.props.iconsTop}
			items={[
				<BackButton key="back" popLocation={this.popLocation} locations={this.state.locations} iconsTop={this.props.iconsTop} />,
				...this.menuItems,
				<LogoutButton key="logout" app={this} iconsTop={this.props.iconsTop} />
			]}
		/>;
	}
	
	renderRoutes () {
		let items = [
			<Route key="objectum-1" path="/queries" render={props => <Queries {...props} store={this.store} />} />,
			<Route key="objectum-2" path="/query/:rid" render={props => <Query {...props} store={this.store} app={this} />} />,
			<Route key="objectum-3" path="/column/:rid" render={props => <Column {...props} store={this.store} app={this} />} />,
			<Route key="objectum-4" path="/models" render={props => <Models {...props} store={this.store} />} />,
			<Route key="objectum-5" path="/model/:rid" render={props => <Model {...props} store={this.store} app={this} />} />,
			<Route key="objectum-6" path="/property/:rid" render={props => <Property {...props} store={this.store} app={this} />} />,
			<Route key="objectum-7" path="/roles" render={props => <Roles {...props} store={this.store} />} />,
			<Route key="objectum-8" path="/role/:rid" render={props => <Role {...props} store={this.store} app={this} />} />,
			<Route key="objectum-9" path="/users" render={props => <Users {...props} store={this.store} />} />,
			<Route key="objectum-10" path="/user/:rid" render={props => <User {...props} store={this.store} app={this} />} />,
			<Route key="objectum-11" path="/menus" render={props => <Menus {...props} store={this.store} />} />,
			<Route key="objectum-12" path="/menu/:rid" render={props => <Menu {...props} store={this.store} app={this} />} />,
			<Route key="objectum-13" path="/menu_item/:rid" render={props => <MenuItem {...props} store={this.store} app={this} />} />,
			<Route key="objectum-16" path="/model_record/:rid" render={props => <ModelRecord {...props} store={this.store} app={this} />} />,
			<Route key="objectum-17" path="/import_css" render={props => <ImportCSS {...props} />} />,
		];
		let SearchRoutes = (children) => {
			React.Children.forEach (children, (child, i) => {
				if (child && child.props) {
					if (child && child.type && child.type.displayName == "ObjectumRoute") {
						items.push (<Route key={`route-${i}`} {...child.props} app={this} />);
					}
					if (child.props.children) {
						SearchRoutes (child.props.children);
					}
				}
			});
		};
		SearchRoutes (this.props.children);
		
		let model = {}, parent = {};
		
		_each (this.store.map ["model"], m => {
			model [m.getPath ()] = true;
			parent [m.get ("parent")] = true;
		});
		_each (_keys (model), path => {
			let m = this.store.getModel (path);
			
			if (parent [m.get ("id")]) {
				return;
			}
			items.push (<Route
				key={`model-list-${path}`}
				path={`/model_list/${path.split (".").join ("_")}`}
				render={props => <div className="container">
					<div className="bg-white shadow-sm">
						<ModelList {...props} store={this.store} model={path} />
					</div>
				</div>}
			/>);
			items.push (<Route
				key={`model-tree-${path}`}
				path={`/model_tree/${path.split (".").join ("_")}`}
				render={props => <div className="container">
					<div className="bg-white shadow-sm">
						<ModelTree {...props} store={this.store} model={path} />
					</div>
				</div>}
			/>);
			items.push (<Route
				key={`records-${path}`}
				path={`/records/${path.split (".").join ("_")}`}
				render={props => <div className="container">
					<div className="bg-white shadow-sm">
						<Records {...props} store={this.store} model={path} />
					</div>
				</div>}
			/>);
		});
		return items;
	}
	
	pushLocation = (pathname, hash, needPop) => {
		let locations = [...this.state.locations];
		
		if (needPop) {
			locations.splice (locations.length - 1, 1);
		}
		this.setState ({locations: [...locations, {pathname, hash}]});
	}
	
	popLocation = () => {
		let locations = [...this.state.locations];
		let l = locations.splice (locations.length - 1, 1);
		
		this.setState ({locations});
		return l;
	}
	
	render () {
		if (this.state.error) {
			return <div className="container">
				<div className="alert alert-danger mt-1" role="alert">
					{this.state.error}
				</div>
			</div>;
		}
		if (this.state.loading) {
			return <Loading container />
		}
		let content;
		
		if (this.state.sid) {
			if (this.props.onCustomRender) {
				content = this.renderRoutes ();
				content = this.props.onCustomRender ({content, app: this, location: this.state.locations.length ? this.state.locations [this.state.locations.length - 1]: {}});
			}
			if (!content) {
				if (this.props.sidebar) {
					content = <div>
						<Sidebar
							sidebar={this.renderMenu (this.props.menuIconSize || "fa-2x")}
							open={false}
							docked={this.state.sidebarDocked}
							sidebarClassName="bg-white border-right"
							shadow={false}
						>
							<Fade>
								<div className="bg-white shadow-sm header border-bottom py-1 form-inline">
									<button className="btn btn-link" onClick={
										() => {
											this.setState ({sidebarDocked: !this.state.sidebarDocked});
										}
									}>
										<i className="fas fa-bars mr-2"/><span className="text-dark">{i18n ("Menu")}</span>
									</button>
									
									<HomeButtonSB />
									<BackButtonSB popLocation={this.popLocation} locations={this.state.locations}/>
									
									<span
										className="ml-3 font-weight-bold">{`${this.state.name || "Objectum"} (${i18n ("version")}: ${this.state.version}, ${i18n ("user")}: ${this.store.username})`}</span>
								</div>
							</Fade>
							
							<div className="objectum-content">
								{this.renderRoutes ()}
							</div>
						</Sidebar>
					</div>;
				} else {
					let label = this.props.label || `${this.state.name || "Objectum"} (${i18n ("version")}: ${this.state.version}, ${i18n ("user")}: ${this.store.username})`;
					
					content = <Fade>
						<Navbar className="navbar navbar-expand navbar-dark bg-dark" linkClassName="nav-item nav-link" items={[
							<HomeButton><strong>{label}</strong></HomeButton>,
						]} />
						{this.renderMenu2 ()}
						<div className="objectum-content">
							{this.renderRoutes ()}
						</div>
					</Fade>;
				}
			}
			return <div>
				<Router>
					<PageViews pushLocation={this.pushLocation} locations={this.state.locations} />
					{content}
				</Router>
			</div>;
		} else {
			content = this.props.registration ?
				<Fade className="my-5">
					<Office {...this.props} name={this.state.name} version={this.state.version} />
				</Fade> :
				<div>
					<Auth store={this.store} name={this.state.name} version={this.state.version} onRenderAuthInfo={this.props.onRenderAuthInfo}/>
				</div>
			;
			let customContent;
			
			if (this.props.onCustomRender) {
				customContent = this.props.onCustomRender ({content, app: this, location: this.state.locations.length ? this.state.locations [this.state.locations.length - 1]: {}});

				if (customContent) {
					content = customContent;
				}
			} else if (this.props.username && this.props.password) {
				return (<div />);
			}
			return <div>
				<Router>
					<PageViews pushLocation={this.pushLocation} locations={this.state.locations} />
					{content}
				</Router>
			</div>;
		}
	}
};
ObjectumApp.displayName = "ObjectumApp";
