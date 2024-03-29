import React, {Component} from "react";
import {isMobile} from "react-device-detect";
import {newId} from "..";

let tooltips = [];

function createTooltip (id) {
	tooltips.push (id);
}

function removeTooltip (id) {
	if (tooltips.indexOf (id)) {
		tooltips.splice (tooltips.indexOf (id), 1);
	}
}

if (typeof (window) !== 'undefined') {
	window.onmousemove = function (e) {
		let x = e.clientX, y = e.clientY;

		for (let i = 0; i < tooltips.length; i ++) {
			let c = document.getElementById (tooltips [i]);

			if (c) {
				c.style.top = (y + 10) + "px";
				c.style.left = (x + 10) + "px";
			}
		}
	}
}

export default class Tooltip extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			id: newId ()
		};
	}
	
	componentDidMount () {
		createTooltip (this.state.id);
	}
	
	componentWillUnmount () {
		removeTooltip (this.state.id);
	}
	
	render () {
		if (isMobile) {
			return <div className="objectum-tooltip w-100 h-100">
				{this.props.children}
			</div>;
		}
		return <div className="objectum-tooltip w-100 h-100">
			{this.props.children}
			{this.props.label && <span id={this.state.id} className="border p-1 bg-white shadow-sm">
				{this.props.label}
			</span>}
		</div>;
	}
};
Tooltip.displayName = "Tooltip";
