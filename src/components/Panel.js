/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

class Panel extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			expanded: this.props.collapsible ? this.props.expanded : true
		};
	}
	
	render () {
		let opts = {
			className: "text-white bg-info py-1"
		};
		if (this.props.collapsible) {
			opts.className += " select-tab";
			opts.onClick= () => this.setState ({expanded: !this.state.expanded});
		}
		return <div className="border shadow-sm">
			<div {...opts}>
				{this.props.collapsible && <i className={`fas ${this.state.expanded ? "fa-chevron-down" : "fa-chevron-up"} ml-2`} />}
				{this.props.icon && <i className={`${this.props.icon} ml-2`} />}
				<strong className="ml-2">{i18n (this.props.label) || ""}</strong>
			</div>
			{this.state.expanded && <div className="p-1">{this.props.children}</div>}
		</div>;
	}
};
Panel.displayName = "Panel";

export default Panel;
