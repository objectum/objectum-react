/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener} from "./helper";
import {i18n} from "./../i18n";
import {Link} from "react-router-dom";

class Tabs extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.changeTab = me.changeTab.bind (me);
		me.hashChange = me.hashChange.bind (me);
		
		let tab = 0;
		let hash = getHash (me);

		if (hash [me.props.id]) {
			tab = hash [me.props.id].tab;
		}
		me.state = {
			refresh: false,
			tab,
			tabs: []
		};
	}
	
	getTabs () {
		let me = this;
		let tabs = [];
		
		React.Children.forEach (me.props.children, child => {
			if (child && child.type && child.type.displayName == "Tab") {
				tabs.push (child);
			}
		});
		return tabs;
	}
	
	hashChange () {
		let me = this;
		let hash = getHash (me);
		let tab = 0;
		
		if (hash [me.props.id] && hash [me.props.id].tab) {
			tab = hash [me.props.id].tab;
		}
		me.getTabs ().forEach ((item, i) => {
			if (item.props && item.props.path == document.location.pathname) {
				tab = i;
			}
		});
		me.setState ({tab});
	}
	
	componentDidMount () {
		let me = this;
		
		addHashListener (this, this.hashChange);

		me.getTabs ().forEach ((tab, i) => {
			if (tab.props && tab.props.path == document.location.pathname) {
				setHash (me, {[me.props.id]: {tab: i}});
			}
		});
	}
	
	componentWillUnmount () {
		removeHashListener (this, this.hashChange);
	}
	
	changeTab (i) {
		let me = this;
		
		setHash (me, {[me.props.id]: {tab: i}});
		
		if (me.props.onSelect) {
			me.props.onSelect (i);
		}
	}
	
/*
	componentDidUpdate () {
		let me = this;
		
		if (me.props.hasOwnProperty ("tab") && me.props.tab != me.state.tab) {
			me.setState ({tab: me.props.tab});
		}
	}
*/
	
	render () {
		let me = this;
		let tab = me.getTabs () [me.state.tab];
		
/*
		for (let i = 0; i < me.state.tabs.length; i ++) {
			if (me.state.tab == i) {
				tab = me.state.tabs [i];
				break;
			}
		}
*/
		return (
			<div>
				{me.props.label && <div className="text-white bg-info py-1">
					<strong className="pl-2">{i18n (me.props.label)}</strong>
				</div>}
				<div>
					<div className="p-1">
						<ul className="nav nav-tabs">
							{me.getTabs ().map ((item, i) => {
								let active = "";
								
								if (i == me.state.tab) {
									active = " active";
								} else {
									active = " border-bottom";
								}
								if (item.props.path) {
									return (
										<li className="nav-item" key={i}>
											<Link className={"nav-link" + active} to={item.props.path} onClick={() => me.changeTab (i)}>{i18n (item.props.label)}</Link>
										</li>
									);
								} else {
									return (
										<li className="nav-item" key={i}>
											<a href="javascript:void(0)" className={"nav-link" + active} onClick={() => me.changeTab (i)}>{i18n (item.props.label)}</a>
										</li>
									);
								}
							})}
						</ul>
						{tab}
					</div>
				</div>
			</div>
		);
	}
}
Tabs.displayName = "Tabs";

export default Tabs;
