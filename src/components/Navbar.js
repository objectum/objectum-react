/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";

class Navbar extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		
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
					{item.icon ? <i className={`${item.icon} mr-2`} /> : null} {item.label}
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
									{item.icon ? <i className={`${item.icon} menu-icon mr-2`} /> : null} {item.label}
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
		
		if (item && item.label) {
			if (item.items) {
				return me.renderSubmenu (item, key, 1);
			} else {
				return (
					<Link
						key={key}
						className={`${me.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold"} ${me.state.selected == key ? "active" : ""}`}
						to={item.path || "/#"}
						onClick={() => me.setState ({path: item.path})}
					>
						{item.icon ? <i className={`${item.icon} mr-2`}/> : null} {item.label}
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
		
/*
		return (
			<nav className={me.props.className || "navbar navbar-expand navbar-dark bg-primary"}>
				<div className="collapse navbar-collapse" id={me.state.id}>
					<div className="navbar-nav">
						{me.props.items.map ((item, i) => {
							return (
								<Link
									key={i}
									className={`nav-item m-2 nav-link ${me.state.path == item.path ? "active" : ""}`}
									to={item.path}
									onClick={() => me.setState ({path: item.path})}
								>
									<strong>{item.label}</strong>
								</Link>
							);
						})}
					</div>
				</div>
			</nav>
		);
*/
		return (
			<nav className={me.props.className || "navbar navbar-expand navbar-dark bg-primary"}>
				<div className="collapse navbar-collapse" id={me.state.id}>
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
