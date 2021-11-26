/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener, i18n} from "..";
import {Link} from "react-router-dom";
import PageTitle from "./PageTitle";

export default class Tabs extends Component {
	constructor (props) {
		super (props);
		
		let tab = 0;
		let hash = getHash (this);

		if (hash [this.props.id]) {
			tab = hash [this.props.id].tab;
		}
		this.state = {
			refresh: false,
			tab,
			tabs: []
		};
	}
	
	getTabs () {
		let tabs = [];
		
		React.Children.forEach (this.props.children, child => {
			if (child && child.type && child.type.displayName == "Tab") {
				tabs.push (child);
			}
		});
		return tabs;
	}
	
	hashChange = () => {
		let hash = getHash (this);
		let tab = 0;
		
		if (hash [this.props.id] && hash [this.props.id].tab) {
			tab = hash [this.props.id].tab;
		}
		this.getTabs ().forEach ((item, i) => {
			if (item.props && item.props.path == document.location.pathname) {
				tab = i;
			}
		});
		this.setState ({tab});
	}
	
	componentDidMount () {
		addHashListener (this, this.hashChange);

		this.getTabs ().forEach ((tab, i) => {
			if (tab.props && tab.props.path == document.location.pathname) {
				setHash (this, {[this.props.id]: {tab: i}});
			}
		});
	}

	componentDidUpdate (prevProps) {
		let num = this.getTabs ().length;

		if (this.state.tab > num - 1) {
			this.changeTab (num - 1);
		}
	}

	componentWillUnmount () {
		removeHashListener (this, this.hashChange);
	}
	
	changeTab = (i) => {
		setHash (this, {[this.props.id]: {tab: i}});
		
		if (this.props.onSelect) {
			this.props.onSelect (i);
		}
	}
	
	render () {
		let tabs = this.getTabs ();
		let tab = tabs [this.state.tab];
		
		return <div className={this.props.className}>
			<PageTitle label={this.props.label} />
			<ul className="nav nav-tabs">
				{tabs.map ((item, i) => {
					let active = "";

					if (i == this.state.tab) {
						active = " active";
					} else {
						active = " border-bottom text-primary select-tab";
					}
					if (item.props.path) {
						return (
							<li className="nav-item" key={i}>
								<Link className={"nav-link" + active} to={item.props.path} onClick={() => this.changeTab (i)}>
									{i18n (item.props.label)}
									{this.props.closable ? <button className={this.props.closeButtonClass || "btn btn-link my-0 ml-2 p-0 text-danger"} title={i18n ("Close")} onClick={() => this.props.onClose (i)}><i className="fas fa-times" /></button> : null}
								</Link>
							</li>
						);
					} else {
						return (
							<li className="nav-item" key={i}>
								<span className={"nav-link" + active} onClick={() => this.changeTab (i)}>
									{i18n (item.props.label)}
									{this.props.closable ? <button className={this.props.closeButtonClass || "btn btn-link my-0 ml-2 p-0 text-danger"} title={i18n ("Close")} onClick={() => this.props.onClose (i)}><i className="fas fa-times" /></button> : null}
								</span>
							</li>
						);
					}
				})}
			</ul>
			{tab}
		</div>;
	}
}
Tabs.displayName = "Tabs";
