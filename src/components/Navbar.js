/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";
import {i18n} from "./../i18n";
import {newId} from "./helper";
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
		
		_.each (me.state, (v, a) => {
			if (a.startsWith ("opened-") && v) {
				state [a] = false;
			}
		});
		me.setState (state);
	}
	
	renderSubmenu (item, key, level) {
		let me = this;
		
		key = "opened-" + level + "-" + key;
		
		return (
			<div key={key} className="nav-item dropdown">
				<button className={`${me.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold"} dropdown-toggle`} onClick={() => me.setState ({[key]: !me.state [key]})}>
					{item.icon ? <i className={`${item.icon} mr-2`} /> : null} {i18n (item.label)}
				</button>
				<div className={`dropdown-menu ml-${level} ${me.state [key] ? "d-block" : ""}`}>
					{_.map (item.items, (item, i) => {
						let key2 = key + "-" + i;
						
						if (item && item.label && item.path) {
							return (
								<Link
									key={i}
									className={me.props.submenuLinkClassName || "dropdown-item nav-item nav-link font-weight-bold text-dark"} to={item.path}
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
			return <BackButton key="back" popLocation={me.props.app && me.props.app.popLocation} locations={me.props.app && me.props.app.state.locations} />;
		}
		if (item == "logout") {
			return <LogoutButton key="logout" app={me.props.app} />;
		}
		if (item && item.label) {
			if (item.items) {
				return me.renderSubmenu (item, key, 1);
			} else {
				return (
					<Link
						key={key}
						className={`${me.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold text-left"} ${me.state.selected == key ? "active" : ""}`}
						to={item.path || "/#"}
						onClick={() => me.hideSubmenu ({selected: key})}
					>
						{item.icon ? <i className={`${item.icon} mr-2`}/> : null} {i18n (item.label)}
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
			<nav className={me.props.className || "navbar navbar-expand-lg navbar-dark bg-primary"}>
				<button
					className="navbar-toggler" type="button"
					onClick={() => me.setState ({isVisible: !me.state.isVisible})}
				>
					<span className="navbar-toggler-icon" />
				</button>
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
