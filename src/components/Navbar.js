/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";
import _map from "lodash.map";
import _each from "lodash.foreach";
import {i18n, newId} from "..";
import {
	BackButton,
	LogoutButton
} from "./Buttons";

class Navbar extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			id: "navbarToggler-" + newId ()
		};
		if (me.props.items && me.props.items.length) {
			me.state.path = me.props.items [0].path;
		}
	}
	
	hideSubmenu (state) {
		let me = this;
		
		_each (me.state, (v, a) => {
			if (a.startsWith ("opened-") && v) {
				state [a] = false;
			}
		});
		me.setState (state);
	}
	
	renderSubmenu (item, key, level) {
		let me = this;
		
		key = "opened-" + level + "-" + key;
		
		let link = <span>{item.icon ? <i className={`${item.icon} mr-2`} /> : null} {i18n (item.label)}<i className="fas fa-caret-down ml-1" /></span>;
		
		if (me.props.iconsTop) {
			link = <div className="">
				<div className="text-center"><i className={`${item.icon} fa-2x`} /></div>
				<div className="text-center">{i18n (item.label)}<i className="fas fa-caret-down ml-1" /></div>
			</div>;
		}
		return (
			<div key={key} className="nav-item dropdown">
				<button className={`${me.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold"}`} onClick={() => me.setState ({[key]: !me.state [key]})}>
					{link}
				</button>
				<div className={`dropdown-menu shadow-sm ml-${level} ${me.state [key] ? "d-block" : ""}`}>
					{_map (item.items, (item, i) => {
						let key2 = key + "-" + i;
						
						if (item && item.label && item.path) {
							return (
								<Link
									key={i}
									className={me.props.submenuLinkClassName || "dropdown-item nav-item nav-link font-weight-bold text-dark pr-2"} to={item.path}
									onClick={() => me.hideSubmenu ({selected: key2})}
								>
									{item.icon ? <i className={`${item.icon} menu-icon mr-2`} /> : null} {i18n (item.label)}
								</Link>
							);
						}
						if (item && item.label && item.items) {
							return me.renderSubmenu (item, i, level + 1);
						}
						return (
							<div key={key2} className={me.state.selected == key2 ? "active" : ""} onClick={() => me.hideSubmenu ({selected: key2})}>{item}</div>
						);
					})}
				</div>
			</div>
		);
	}
	
	renderItem (item, key) {
		let me = this;

		if (item == "back") {
			return (
				<div key="back" className={me.state.selected == "back" ? "active" : ""} onClick={() => me.setState ({selected: "back"})}>
					<BackButton popLocation={me.props.app && me.props.app.popLocation} locations={me.props.app && me.props.app.state.locations} iconsTop={me.props.iconsTop} />
				</div>
			);
		}
		if (item == "backIcon") {
			return (
				<div key="back" className={me.state.selected == "back" ? "active" : ""} onClick={() => me.setState ({selected: "back"})}>
					<BackButton key="back" popLocation={me.props.app && me.props.app.popLocation} locations={me.props.app && me.props.app.state.locations} iconsTop={me.props.iconsTop}>
						<i className="fas fa-arrow-left" />
					</BackButton>
				</div>
			);
		}
		if (item == "logout") {
			return (
				<div key="logout" className={me.state.selected == "logout" ? "active" : ""} onClick={() => me.setState ({selected: "logout"})}>
					<LogoutButton app={me.props.app} iconsTop={me.props.iconsTop} />
				</div>
			);
		}
		if (item && (item.label || item.path)) {
			if (item.items) {
				return me.renderSubmenu (item, key, 1);
			} else {
				let link = <span>{item.icon ? <i className={`${item.icon} mr-2`}/> : null} {i18n (item.label)}</span>;
				
				if (me.props.iconsTop) {
					link = <div className="">
						<div className="text-center"><i className={`${item.icon} fa-2x`} /></div>
						<div className="text-center">{i18n (item.label)}</div>
					</div>;
				}
				return (
					<Link
						key={key}
						className={`${me.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold text-left"} ${me.state.selected == key ? "active" : ""}`}
						to={item.path || "/#"}
						onClick={() => me.hideSubmenu ({selected: key})}
					>
						{link}
					</Link>
				);
			}
		}
		return (
			<div key={key} className={me.state.selected == key ? "active" : ""} onClick={() => me.setState ({selected: key})}>{item}</div>
		);
	}
	
	render () {
		let me = this;
		
		return (
			<nav className={me.props.className || `navbar ${!me.props.expand ? "navbar-expand-md" : "navbar-expand"} navbar-dark bg-primary`}>
				{!me.props.expand && <button
					className="navbar-toggler" type="button"
					onClick={() => me.setState ({isVisible: !me.state.isVisible})}
				>
					<span className="navbar-toggler-icon" />
				</button>}
				<div className={`collapse navbar-collapse ${me.state.isVisible ? "d-block": ""}`}>
					<div className="navbar-nav">
						{me.props.items.map ((item, i) => {
							return me.renderItem (item, i);
						})}
					</div>
				</div>
			</nav>
		);
	}
};
Navbar.displayName = "Navbar";

export default Navbar;
