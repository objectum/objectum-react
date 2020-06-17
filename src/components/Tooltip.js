import React, {Component} from "react";
import {isMobile} from "react-device-detect";
import {newId} from "..";

let tooltips = [];

function createTooltip (id) {
	tooltips.push (id);
};

function removeTooltip (id) {
	if (tooltips.indexOf (id)) {
		tooltips.splice (tooltips.indexOf (id), 1);
	}
};

window.onmousemove = function (e) {
	let x = e.clientX, y = e.clientY;
	
	for (let i = 0; i < tooltips.length; i ++) {
		let c = document.getElementById (tooltips [i]);
		
		if (c) {
			c.style.top = (y + 10) + "px";
			c.style.left = (x + 10) + "px";
		}
	}
};

class Tooltip extends Component {
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
		let me = this;
		
		if (isMobile) {
			return (
				<div className="objectum-tooltip w-100 h-100">
					{me.props.children}
				</div>
			);
		}
		return (
			<div className="objectum-tooltip w-100 h-100">
				{me.props.children}
				{me.props.label && <span id={me.state.id} className="border p-1 bg-white shadow-sm">
					{me.props.label}
				</span>}
			</div>
		);
	}
};
Tooltip.displayName = "Tooltip";

export default Tooltip;
