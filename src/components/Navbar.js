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

export default class Navbar extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			id: "navbarToggler-" + newId ()
		};
		if (this.props.items && this.props.items.length) {
			this.state.path = this.props.items [0].path;
		}
		this._refs = {
			"nav": React.createRef (),
		}
	}
	
	hideSubmenu (state = {}) {
		_each (this.state, (v, a) => {
			if (a.startsWith ("opened-") && v) {
				state [a] = false;
			}
		});
		this.setState (state);
	}
	
	onDocumentClick = (event) => {
		let cmp = this._refs ["nav"].current;
		
		if (cmp && !cmp.contains (event.target)) {
			this.hideSubmenu ();
		}
	}
	
	componentDidMount () {
		document.addEventListener ("mousedown", this.onDocumentClick)
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	renderSubmenu (item, key, level) {
		key = "opened-" + level + "-" + key;
		
		let link = <span>{item.icon ? <i className={`${item.icon} mr-2`} /> : null} {i18n (item.label)}<i className="fas fa-caret-down ml-1" /></span>;
		
		if (this.props.iconsTop) {
			link = <div className="">
				<div className="text-center"><i className={`${item.icon} fa-2x`} /></div>
				<div className="text-center">{i18n (item.label)}<i className="fas fa-caret-down ml-1" /></div>
			</div>;
		}
		return <div key={key} className="nav-item dropdown">
			<button className={`${this.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold"}`} onClick={() => this.hideSubmenu ({[key]: !this.state [key]})}>
				{link}
			</button>
			<div className={`dropdown-menu shadow-sm ml-${level} ${this.state [key] ? "d-block" : ""}`}>
				{_map (item.items, (item, i) => {
					let key2 = key + "-" + i;
					
					if (item && item.label && item.path) {
						return (
							<Link
								key={i}
								className={this.props.submenuLinkClassName || "dropdown-item nav-item nav-link font-weight-bold text-dark pr-2"} to={item.path}
								onClick={() => this.hideSubmenu ({selected: key2})}
							>
								{item.icon ? <i className={`${item.icon} menu-icon mr-2`} /> : null} {i18n (item.label)}
							</Link>
						);
					}
					if (item && item.label && item.items) {
						return this.renderSubmenu (item, i, level + 1);
					}
					return (
						<div key={key2} className={this.state.selected == key2 ? "active" : ""} onClick={() => this.hideSubmenu ({selected: key2})}>{item}</div>
					);
				})}
			</div>
		</div>;
	}
	
	renderItem (item, key) {
		if (item == "back") {
			return <div key="back" className={this.state.selected == "back" ? "active" : ""} onClick={() => this.setState ({selected: "back"})}>
				<BackButton popLocation={this.props.app && this.props.app.popLocation} locations={this.props.app && this.props.app.state.locations} iconsTop={this.props.iconsTop} />
			</div>;
		}
		if (item == "backIcon") {
			return <div key="back" className={this.state.selected == "back" ? "active" : ""} onClick={() => this.setState ({selected: "back"})}>
				<BackButton key="back" popLocation={this.props.app && this.props.app.popLocation} locations={this.props.app && this.props.app.state.locations} iconsTop={this.props.iconsTop}>
					<i className="fas fa-arrow-left" />
				</BackButton>
			</div>;
		}
		if (item == "logout") {
			return <div key="logout" className={this.state.selected == "logout" ? "active" : ""} onClick={() => this.setState ({selected: "logout"})}>
				<LogoutButton app={this.props.app} iconsTop={this.props.iconsTop} />
			</div>;
		}
		if (item && (item.label || item.path)) {
			if (item.items) {
				return this.renderSubmenu (item, key, 1);
			} else {
				let link = <span>{item.icon ? <i className={`${item.icon} mr-2`}/> : null} {i18n (item.label)}</span>;
				
				if (this.props.iconsTop) {
					link = <div className="">
						<div className="text-center"><i className={`${item.icon} fa-2x`} /></div>
						<div className="text-center">{i18n (item.label)}</div>
					</div>;
				}
				return <Link
					key={key}
					className={`${this.props.linkClassName || "btn btn-link nav-item nav-link font-weight-bold text-left"} ${this.state.selected == key ? "active" : ""}`}
					to={item.path || "/#"}
					onClick={() => this.hideSubmenu ({selected: key})}
				>
					{link}
				</Link>;
			}
		}
		return <div key={key} className={this.state.selected == key ? "active" : ""} onClick={() => this.setState ({selected: key})}>{item}</div>;
	}
	
	render () {
		return <nav className={this.props.className || `navbar ${!this.props.expand ? "navbar-expand-md" : "navbar-expand"} navbar-dark bg-primary`} ref={this._refs ["nav"]}>
			{!this.props.expand && <button
				className="navbar-toggler" type="button"
				onClick={() => this.setState ({isVisible: !this.state.isVisible})}
			>
				<span className="navbar-toggler-icon" />
			</button>}
			<div className={`collapse navbar-collapse ${this.state.isVisible ? "d-block": ""}`}>
				<div className="navbar-nav">
					{this.props.items.map ((item, i) => {
						return this.renderItem (item, i);
					})}
				</div>
			</div>
		</nav>;
	}
};
Navbar.displayName = "Navbar";
