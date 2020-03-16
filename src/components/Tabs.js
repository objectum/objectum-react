/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener} from "./helper";
import {i18n} from "./../i18n";

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
			tab
		};
		me.tabs = [];
	}
	
	hashChange () {
		let me = this;
		let hash = getHash (me);
		let tab = 0;
		
		if (hash [me.props.id] && hash [me.props.id].tab) {
			tab = hash [me.props.id].tab;
		}
		me.setState ({tab});
	}
	
	componentDidMount () {
		//window.addEventListener ("hashchange", this.hashChange);
		addHashListener (this, this.hashChange);
	}
	
	componentWillUnmount () {
//		window.removeEventListener ("hashchange", this.hashChange);
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
		
		me.tabs = [];
		
		//if (!me.tabs.length) {
			React.Children.forEach (me.props.children, child => {
				if (child && child.type && child.type.displayName == "Tab") {
					me.tabs.push (child);
				}
			});
		//}
		let tab;
		
		for (let i = 0; i < me.tabs.length; i ++) {
			if (me.state.tab == i) {
				tab = me.tabs [i];
				break;
			}
		}
		return (
			<div>
				{me.props.label && <div className="text-white bg-info py-1">
					<strong className="pl-2">{i18n (me.props.label)}</strong>
				</div>}
				<div>
					<div className="p-1">
						<ul className="nav nav-tabs">
							{me.tabs.map ((item, i) => {
								let active = "";
								
								if (i == me.state.tab) {
									active = " active";
								} else {
									active = " bg-light";
								}
								return (
									<li className="nav-item" key={i}>
										<button type="button" className={"btn btn-link nav-link" + active} onClick={() => me.changeTab (i)}>{i18n (item.props.label)}</button>
									</li>
								);
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
