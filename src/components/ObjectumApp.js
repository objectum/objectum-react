import React, {Component} from "react";
import {BrowserRouter as Router, Route, Link, useLocation} from "react-router-dom";
import {
	Auth, Models, Model, Property, Queries, Query, Column, Roles, Role, Users, User,
	Menus, Menu, MenuItem, ModelList, ModelTree, ModelRecord, Records, Office, ImportCSS,
	MenuButton, timeout
} from "..";
import Sidebar from "react-sidebar";
import {setLocale, i18n} from "../i18n";
import _filter from "lodash.filter";
import _each from "lodash.foreach";
import _keys from "lodash.keys";
import Fade from "./Fade";
import {execute} from "objectum-client";
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
			headerVisible: true,
			headerMarginTop: 0,
			locations: [],
			name: this.props.name || "Objectum",
			version: this.props.version || "0.0.1"
		};
		if (window.location.pathname != "/") {
			this.state.locations.push ({pathname: window.location.pathname, hash: window.location.hash});
		}
		setStore (this.props.store);
		this.store = this.props.store;
		this.menuItemRecs = [];
		
		setLocale (this.props.locale || "en");

		this.locationLabel = {
			models: i18n ("Models"),
			model: i18n ("Model"),
			property: i18n ("Property"),
			queries: i18n ("Queries"),
			query: i18n ("Query"),
			column: i18n ("Column"),
			menus: i18n ("Menus"),
			menu: i18n ("Menu"),
			menu_item: i18n ("Menu item"),
			roles: i18n ("Roles"),
			role: i18n ("Role"),
			users: i18n ("Users"),
			user: i18n ("User"),
			import_css: i18n ("Import css")
		};
		this._refs = {
			header: React.createRef ()
		};
		Object.assign (window.OBJECTUM_APP, {
			store: this.store,
			sidebar: this.props.sidebar,
			locale: this.props.locale
		});
	}

	onScroll = () => {
		if (this._refs ["header"].current) {
			let headerHeight = this._refs ["header"].current.offsetHeight;
			let headerVisible = window.pageYOffset <= headerHeight;
			let headerMarginTop = (window.pageYOffset > headerHeight && window.pageYOffset < headerHeight * 2) ? headerHeight * 2 - window.pageYOffset : 0;

			if (headerVisible != this.state.headerVisible || headerMarginTop != this.state.headerMarginTop) {
				let state = {headerVisible, headerMarginTop};
				this.setState (state);
			}
		}
	}

	async componentDidMount () {
		this.store.addListener ("connect", this.onConnect);
		this.store.addListener ("disconnect", this.onDisconnect);
		window.addEventListener ("scroll", this.onScroll)
		
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
		window.removeEventListener ("scroll", this.onScroll);
	}
	
	onConnect = async (opts) => {
		let menuId = opts.menuId;
		let state = {sid: opts.sid};
		
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
	
	renderSidebarMenu (size) {
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
	
	renderNavbarMenu () {
		return <Navbar iconsTop={this.props.iconsTop} className2="navbar navbar-expand navbar-light bg-info"
			items={[
				<BackButton key="back" popLocation={this.popLocation} locations={this.state.locations} iconsTop={this.props.iconsTop} />,
				...this.menuItems,
				<LogoutButton key="logout" app={this} iconsTop={this.props.iconsTop} />
			]}
		/>;
	}

	renderPosition () {
		let position = [];

		this.state.locations.forEach ((item, i) => {
			let disabled = i == this.state.locations.length - 1;

			if (i) {
				position.push (<span key={"c-" + i} className={disabled ? "text-secondary" : "text-primary"}><i className="fas fa-chevron-right mx-2" /></span>);
			}
			let path = item.pathname.split ("/")[1];
			let label = this.locationLabel [path] || path;

			if (path == "records" || path == "model_list" || path == "model_tree") {
				let m = this.store.getModel (item.pathname.split ("/")[2].split ("_").join ("."));

				if (path == "records") {
					label = i18n ("Records");
				}
				if (path == "model_list" || path == "model_tree") {
					label = i18n ("List");
				}
				label += ": " + i18n (m.name);
			}
			if (path == "model_record") {
				let m = this.store.getModel (JSON.parse (decodeURI (item.hash.substr (1))).opts.model);
				label = i18n (m.name);
			}
			position.push (disabled ?
				<span key={"p-" + i} className="text-secondary">{label}</span> :
				<Link key={"p-" + i} to={item.pathname + item.hash} className="text-primary">{label}</Link>
			);
		});
		if (position.length) {
			position = [
				<Link key="home" to="/" className="text-primary">{i18n ("Home")}</Link>,
				<span key="home-chevron" className="text-primary"><i className="fas fa-chevron-right mx-2" /></span>,
				...position
			];
		}
		return <div className="ml-2 d-flex align-items-center">
			{position}
		</div>;
	}

	renderRoutes () {
		let items = [
			<Route key="objectum-1" path="/queries" render={props => <Queries {...props} store={this.store} app={this} />} />,
			<Route key="objectum-2" path="/query/:rid" render={props => <Query {...props} store={this.store} app={this} />} />,
			<Route key="objectum-3" path="/column/:rid" render={props => <Column {...props} store={this.store} app={this} />} />,
			<Route key="objectum-4" path="/models" render={props => <Models {...props} store={this.store} app={this} />} />,
			<Route key="objectum-5" path="/model/:rid" render={props => <Model {...props} store={this.store} app={this} />} />,
			<Route key="objectum-6" path="/property/:rid" render={props => <Property {...props} store={this.store} app={this} />} />,
			<Route key="objectum-7" path="/roles" render={props => <Roles {...props} store={this.store} app={this} />} />,
			<Route key="objectum-8" path="/role/:rid" render={props => <Role {...props} store={this.store} app={this} />} />,
			<Route key="objectum-9" path="/users" render={props => <Users {...props} store={this.store} app={this} />} />,
			<Route key="objectum-10" path="/user/:rid" render={props => <User {...props} store={this.store} app={this} />} />,
			<Route key="objectum-11" path="/menus" render={props => <Menus {...props} store={this.store} app={this} />} />,
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
					<ModelList {...props} store={this.store} model={path} />
				</div>}
			/>);
			items.push (<Route
				key={`model-tree-${path}`}
				path={`/model_tree/${path.split (".").join ("_")}`}
				render={props => <div className="container">
					<ModelTree {...props} store={this.store} model={path} />
				</div>}
			/>);
			items.push (<Route
				key={`records-${path}`}
				path={`/records/${path.split (".").join ("_")}`}
				render={props => <div className="container">
					<Records {...props} store={this.store} model={path} />
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
		let menuItemRec = this.menuItemRecs.find (rec => rec.path == pathname);

		if (menuItemRec) {
			locations = [];
		}
		for (let i = 0; i < locations.length; i ++) {
			if (locations [i].pathname == pathname) {
				locations.splice (i);
				break;
			}
		}
		if (pathname == "/") {
			this.setState ({locations: []});
		} else {
			this.setState ({locations: [...locations, {pathname, hash}]});
		}
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
/*
		if (this.state.loading) {
			return <Loading container />
		}
*/
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
							sidebar={this.renderSidebarMenu (this.props.menuIconSize || "fa-2x")}
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
									
									<span className="ml-3 font-weight-bold">{`${this.state.name || "Objectum"} (${i18n ("version")}: ${this.state.version}, ${i18n ("user")}: ${this.store.username})`}</span>
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
{/*
						<Navbar className="navbar navbar-expand" linkClassName="nav-item nav-link text-dark" items={[
							<HomeButton><strong>{label}</strong></HomeButton>,
						]} />
*/}
						<div
							className={`objectum-header d-flex p-1 align-items-center bg-white shadow-sm ${this.state.headerVisible ? "" : "fixed-top"}`}
							style={{marginTop: `-${this.state.headerMarginTop}px`}}
							ref={this._refs ["header"]}
						>
							<MenuButton items={[...this.menuItems, {icon: "fas fa-sign-out-alt", label: i18n ("Logout"), value: "logout"}]} onClick={({value, history}) => {
								if (value == "logout") {
									this.store.end ();
									this.setState ({
										sidebarOpen: false, locations: [], sid: null
									});
									history.push ("/");
								}
							}} />
							{this.renderPosition ()}
						</div>
						{!this.state.headerVisible && <div className="objectum-header" />}
						<div className="objectum-content">
							{this.renderRoutes ()}
						</div>
						<div className="p-1 fixed-bottom border-top text-center bg-white">
							{label}
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
