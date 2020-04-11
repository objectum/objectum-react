import React, {Component} from "react";
import {newId} from "./helper";
import Grid from "./Grid";

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
		
		return (
			<div>
				<div className="objectum-tooltip">
					{me.props.children}
					<span id={me.state.id} className="border p-1 bg-white shadow-sm">
						{me.props.label || "label not exist"}
					</span>
				</div>
			</div>
		);
	}
};
Tooltip.displayName = "Tooltip";

export default Tooltip;
